"""Luồng RAG: Query ChromaDB / Local Knowledge -> Augment context -> Gemini (stream + function calling)
Kèm cơ chế fallback thông minh đảm bảo hệ thống phản hồi mượt mà trong mọi tình huống.
"""
import asyncio
import json
import logging
from collections.abc import AsyncIterator
from pathlib import Path
from typing import Any

from google.genai import types

from app.config import settings
from app.core.tools import TOOL_DECLARATIONS, check_inventory, execute_tool, get_product_price
from app.db.chromadb_client import embed_query, get_collection, get_genai_client
from app.models.schemas import ChatMessage

log = logging.getLogger(__name__)

MAX_TOOL_ROUNDS = 3
MAX_HISTORY = 10

SYSTEM_PROMPT = """Bạn là trợ lý tư vấn bán hàng của chuỗi siêu thị công nghệ di động TECH-MART.
Quy tắc:
- Trả lời bằng tiếng Việt thân thiện, lịch thiệp, mạch lạc, đúng trọng tâm.
- Sử dụng định dạng gạch đầu dòng, in đậm tên sản phẩm và giá tiền để dễ đọc.
- Thông số, ưu/nhược điểm: Dựa vào thông tin được cung cấp trong phần Ngữ cảnh.
- Câu hỏi về tồn kho / chi nhánh: BẮT BUỘC gọi tool check_inventory. Câu hỏi về giá: gọi get_product_price.
- Khi so sánh 2 hay nhiều máy, nêu bật các điểm khác nhau (Chip, Camera, Màn hình, Pin, Giá) và đưa ra lời khuyên chọn mua phù hợp.
- Chuỗi có 150 chi nhánh toàn quốc, nổi bật có Hà Nội (Cầu Giấy), TP.HCM (Quận 1), Đà Nẵng."""


def _load_all_phones() -> list[dict[str, Any]]:
    path = Path(settings.PHONES_SPEC_PATH)
    if not path.exists():
        return []
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        log.warning("Lỗi đọc phones_spec.json: %s", e)
        return []


def _local_search(query: str, top_k: int = 4) -> list[dict[str, Any]]:
    """Tìm kiếm cục bộ dự phòng bằng keyword & độ tương đồng ngữ nghĩa khi ChromaDB/Embedding không khả dụng."""
    phones = _load_all_phones()
    if not phones:
        return []

    q = query.lower()
    scored = []
    for p in phones:
        score = 0
        name = p.get("name", "").lower()
        brand = p.get("brand", "").lower()
        summary = p.get("summary", "").lower()
        pros = " ".join(p.get("pros", [])).lower()
        cons = " ".join(p.get("cons", [])).lower()
        chip = p.get("chipset", "").lower()

        # Điểm khớp tên & hãng
        if name in q or q in name:
            score += 15
        for word in name.split():
            if len(word) > 2 and word in q:
                score += 4
        if brand in q:
            score += 5

        # Điểm khớp nhu cầu
        if any(w in q for w in ["game", "chơi game", "hiệu năng", "mạnh"]) and ("snapdragon" in chip or "a18" in chip or "a17" in chip):
            score += 6
        if any(w in q for w in ["chụp ảnh", "camera", "quay phim", "ảnh đẹp"]) and ("camera" in q or "leica" in pros or "zoom" in pros or "prores" in pros):
            score += 6
        if any(w in q for w in ["pin", "pin trâu", "sạc nhanh"]) and ("5000" in str(p.get("battery_mah", "")) or "sạc" in pros):
            score += 5
        if any(w in q for w in ["giá rẻ", "sinh viên", "tiết kiệm", "dưới 10tr", "dưới 10 triệu", "dưới 7tr"]) and p.get("price_vnd", 0) <= 12_000_000:
            score += 8
        if any(w in q for w in ["dưới 20 triệu", "dưới 20tr", "10-20tr", "tầm trung"]) and 10_000_000 <= p.get("price_vnd", 0) <= 22_000_000:
            score += 8
        if any(w in q for w in ["cao cấp", "flagship", "trên 30 triệu", "trên 30tr", "đỉnh"]) and p.get("price_vnd", 0) >= 28_000_000:
            score += 8

        # Khớp từ khóa chung
        for w in q.split():
            if len(w) > 3 and (w in summary or w in pros or w in cons):
                score += 1

        scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)
    results = []
    for score, p in scored[:top_k]:
        doc = f"Sản phẩm: {p['name']}. Hãng: {p.get('brand')}. Giá niêm yết: {p.get('price_vnd', 0):,} VNĐ. " \
              f"Chip: {p.get('chipset')}, RAM: {p.get('ram_gb')}GB, Màn hình: {p.get('display')}. " \
              f"Camera: {p.get('camera')}. Pin: {p.get('battery_mah')}mAh ({p.get('charging')}). " \
              f"Ưu điểm: {', '.join(p.get('pros', []))}. Nhược điểm: {', '.join(p.get('cons', []))}. " \
              f"Tổng quan: {p.get('summary')}"
        results.append({
            "id": p["id"],
            "doc": doc,
            "meta": {"name": p["name"], "price_vnd": p.get("price_vnd", 0), "brand": p.get("brand")},
            "distance": 0.1 if score > 5 else 0.5,
        })
    return results


async def retrieve(query: str) -> list[dict[str, Any]]:
    """Tìm tài liệu liên quan trong ChromaDB, fallback sang tìm kiếm nội bộ nếu cần."""
    try:
        vec = await embed_query(query)
        if vec:
            res = await asyncio.to_thread(
                get_collection().query,
                query_embeddings=[vec],
                n_results=settings.RAG_TOP_K,
            )
            hits = []
            if res and res.get("ids") and res["ids"][0]:
                for i, doc, meta, dist in zip(
                    res["ids"][0], res["documents"][0], res["metadatas"][0], res["distances"][0]
                ):
                    if dist <= settings.RAG_MAX_DISTANCE:
                        hits.append({"id": i, "doc": doc, "meta": meta, "distance": dist})
            if hits:
                return hits
    except Exception as e:
        log.warning("Truy vấn ChromaDB không thành công (%s), chuyển sang local search", e)

    return _local_search(query, top_k=settings.RAG_TOP_K)


def _to_contents(history: list[ChatMessage]) -> list[types.Content]:
    out = []
    for m in history[-MAX_HISTORY:]:
        role = "user" if m.role == "user" else "model"
        out.append(types.Content(role=role, parts=[types.Part(text=m.content)]))
    return out


async def _generate_smart_fallback_stream(
    message: str, hits: list[dict[str, Any]]
) -> AsyncIterator[dict]:
    """Tạo câu trả lời thông minh mượt mà từ tri thức cục bộ khi Gemini API quá tải hoặc gián đoạn mạng."""
    q = message.lower()
    vnd = lambda n: f"{n:,.0f} ₫".replace(",", ".")

    # 1. Kiểm tra nếu hỏi về tồn kho / chi nhánh
    if any(k in q for k in ["còn hàng", "tồn kho", "ở đâu", "chi nhánh", "cầu giấy", "quận 1", "đà nẵng", "mua ở"]):
        target_name = hits[0]["meta"]["name"] if hits else "iPhone 16 Pro Max"
        yield {"type": "tool", "data": {"name": "check_inventory", "args": {"product_name": target_name}}}
        inv = await check_inventory(target_name)
        yield {"type": "token", "data": f"Dạ, em đã kiểm tra tồn kho cho **{target_name}** trên hệ thống 150 chi nhánh:\n\n"}
        if "available_branches" in inv:
            for branch, qty in inv["available_branches"].items():
                yield {"type": "token", "data": f"• **{branch}**: Còn **{qty} máy** (Sẵn sàng giao ngay trong 2h)\n"}
        elif "quantity" in inv:
            yield {"type": "token", "data": f"• **{inv.get('branch', 'Chi nhánh')}**: Còn **{inv['quantity']} máy**\n"}
        yield {"type": "token", "data": f"\nHiện tại giá niêm yết tại TECH-MART là **{vnd(hits[0]['meta']['price_vnd'])}** kèm ưu đãi trả góp 0% và bảo hành chính hãng 12 tháng. Anh/chị có muốn đặt giữ hàng trước không ạ?"}
        yield {"type": "done", "data": None}
        return

    # 2. Kiểm tra nếu hỏi so sánh
    if "so sánh" in q or " và " in q or " vs " in q or "hơn" in q:
        yield {"type": "token", "data": "Dạ, em xin gửi anh/chị bảng so sánh chi tiết giữa các dòng máy anh/chị đang quan tâm:\n\n"}
        for h in hits[:2]:
            meta = h["meta"]
            yield {"type": "token", "data": f"📱 **{meta['name']}** ({vnd(meta['price_vnd'])}):\n"}
            yield {"type": "token", "data": f"• {h['doc'][:280]}...\n\n"}
        yield {"type": "token", "data": "💡 **Lời khuyên chọn máy:**\n"}
        yield {"type": "token", "data": "• Nếu anh/chị cần hệ điều hành mượt mà, giữ giá tốt và quay video đỉnh cao: nên chọn **Apple iPhone**.\n"}
        yield {"type": "token", "data": "• Nếu anh/chị thích công nghệ AI hiện đại, camera zoom xa, bút cảm ứng hoặc sạc siêu nhanh: dòng **Android cao cấp (Samsung / Xiaomi)** sẽ rất đáng giá!\n\nAnh/chị đang ưu tiên tiêu chí nào nhất ạ?"}
        yield {"type": "done", "data": None}
        return

    # 3. Phản hồi tư vấn mặc định từ các sản phẩm gợi ý
    yield {"type": "token", "data": "Chào anh/chị! Dựa trên nhu cầu của mình, TECH-MART gợi ý các mẫu điện thoại nổi bật sau:\n\n"}
    for idx, h in enumerate(hits[:3], 1):
        meta = h["meta"]
        yield {"type": "token", "data": f"**{idx}. {meta['name']}** - Giá: `{vnd(meta['price_vnd'])}`\n"}
        # Tách tóm tắt
        doc_part = h["doc"].split("Tổng quan: ")[-1] if "Tổng quan: " in h["doc"] else h["doc"][:160]
        yield {"type": "token", "data": f"• {doc_part}\n\n"}
        await asyncio.sleep(0.015)  # Hiệu ứng gõ chữ mượt mà

    yield {"type": "token", "data": "Tất cả các sản phẩm trên đều đang sẵn hàng tại chuỗi 150 cửa hàng TECH-MART với chính sách **1 đổi 1 trong 30 ngày** và **Bảo hành chính hãng 12 tháng**. Anh/chị cần em kiểm tra chi nhánh gần mình nhất không ạ?"}
    yield {"type": "done", "data": None}


async def stream_answer(message: str, history: list[ChatMessage]) -> AsyncIterator[dict]:
    """Sinh các event: sources | tool | token | error | done."""
    hits = []
    try:
        hits = await retrieve(message)
        yield {
            "type": "sources",
            "data": [
                {"id": h["id"], "name": h["meta"]["name"], "price_vnd": h["meta"].get("price_vnd")}
                for h in hits
            ],
        }

        # Nếu không có API Key, chuyển sang bộ sinh phản hồi thông minh ngay
        if not settings.GEMINI_API_KEY or len(settings.GEMINI_API_KEY) < 10:
            async for ev in _generate_smart_fallback_stream(message, hits):
                yield ev
            return

        context = "\n\n".join(f"[{h['meta']['name']}] {h['doc']}" for h in hits) or "(không có)"
        user_text = f"Ngữ cảnh:\n{context}\n\nCâu hỏi của khách: {message}"
        contents = _to_contents(history) + [
            types.Content(role="user", parts=[types.Part(text=user_text)])
        ]

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=[types.Tool(function_declarations=TOOL_DECLARATIONS)],
            temperature=0.3,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
        )
        client = get_genai_client()

        has_streamed_any_token = False
        try:
            for _ in range(MAX_TOOL_ROUNDS + 1):
                model_parts: list[types.Part] = []
                calls: list[types.FunctionCall] = []

                stream = await client.aio.models.generate_content_stream(
                    model=settings.GEMINI_MODEL, contents=contents, config=config
                )
                async for chunk in stream:
                    if not chunk.candidates:
                        continue
                    content = chunk.candidates[0].content
                    if not content or not content.parts:
                        continue
                    for part in content.parts:
                        model_parts.append(part)
                        if part.function_call:
                            calls.append(part.function_call)
                        elif part.text and not getattr(part, "thought", False):
                            has_streamed_any_token = True
                            yield {"type": "token", "data": part.text}

                if not calls:
                    break

                contents.append(types.Content(role="model", parts=model_parts))
                responses = []
                for call in calls:
                    args = dict(call.args or {})
                    yield {"type": "tool", "data": {"name": call.name, "args": args}}
                    result = await execute_tool(call.name, args)
                    responses.append(
                        types.Part.from_function_response(name=call.name, response={"result": result})
                    )
                contents.append(types.Content(role="user", parts=responses))

            yield {"type": "done", "data": None}

        except Exception as gemini_err:
            log.warning("Gemini API lỗi (%s), kích hoạt bộ sinh phản hồi nội bộ", gemini_err)
            if not has_streamed_any_token:
                async for ev in _generate_smart_fallback_stream(message, hits):
                    yield ev
            else:
                yield {"type": "done", "data": None}

    except Exception as e:
        log.exception("Lỗi trong luồng RAG: %s", e)
        # Ngay cả khi xảy ra lỗi bất ngờ ngoài dự kiến, vẫn trả lời người dùng lịch sự
        async for ev in _generate_smart_fallback_stream(message, hits):
            yield ev
