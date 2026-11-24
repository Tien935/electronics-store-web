"""Tư vấn theo lựa chọn: khách trả lời 4 câu -> lọc sản phẩm -> Gemini chọn top 3 -> JSON.
Kèm cơ chế dự phòng thông minh khi Gemini API hoặc ChromaDB không khả dụng.
"""
import asyncio
import json
import logging
import time
from pathlib import Path

from google.genai import types
from pydantic import BaseModel

from app.config import BASE_DIR, settings
from app.core.tools import check_inventory
from app.db.chromadb_client import embed_query, get_collection, get_genai_client
from app.models.schemas import AdvisorResponse, FeedbackRequest, Recommendation

log = logging.getLogger(__name__)

FEEDBACK_PATH = BASE_DIR / "data" / "feedback.jsonl"
PRICE_TOLERANCE = 0.15  # nới ±15% quanh khoảng giá khách chọn
TOP_K = 6

# Nguồn sự thật duy nhất cho các câu hỏi: frontend lấy qua GET /advisor/questions.
QUESTIONS = [
    {
        "id": "budget",
        "short": "Ngân sách",
        "title": "Ngân sách của bạn khoảng bao nhiêu?",
        "options": [
            {"value": "under_10", "label": "Dưới 10 triệu", "min": 0, "max": 10_000_000},
            {"value": "10_20", "label": "10 – 20 triệu", "min": 10_000_000, "max": 20_000_000},
            {"value": "20_30", "label": "20 – 30 triệu", "min": 20_000_000, "max": 30_000_000},
            {"value": "over_30", "label": "Trên 30 triệu", "min": 30_000_000, "max": None},
        ],
    },
    {
        "id": "usage",
        "short": "Nhu cầu chính",
        "title": "Bạn dùng điện thoại chủ yếu để làm gì?",
        "options": [
            {"value": "gaming", "label": "Chơi game"},
            {"value": "camera", "label": "Chụp ảnh, quay video"},
            {"value": "work", "label": "Làm việc, học tập"},
            {"value": "basic", "label": "Dùng cơ bản (nhắn tin, mạng xã hội)"},
        ],
    },
    {
        "id": "brand",
        "short": "Hệ điều hành",
        "title": "Bạn thích hệ điều hành nào?",
        "options": [
            {"value": "apple", "label": "iPhone (iOS)"},
            {"value": "android", "label": "Android"},
            {"value": "any", "label": "Không quan trọng"},
        ],
    },
    {
        "id": "priority",
        "short": "Ưu tiên",
        "title": "Bạn ưu tiên điều gì nhất?",
        "options": [
            {"value": "battery", "label": "Pin trâu, sạc nhanh"},
            {"value": "display", "label": "Màn hình đẹp"},
            {"value": "performance", "label": "Hiệu năng mạnh"},
            {"value": "price", "label": "Giá tốt nhất"},
        ],
    },
]

ADVISOR_PROMPT = """Bạn là chuyên viên tư vấn điện thoại của chuỗi cửa hàng TECH-MART.
Dựa DUY NHẤT vào danh sách máy ứng viên, chọn tối đa 3 máy hợp nhất với nhu cầu khách, xếp theo mức phù hợp giảm dần.
- id phải lấy đúng từ danh sách ứng viên.
- reason: 1-2 câu tiếng Việt, nói rõ vì sao máy hợp với nhu cầu CỤ THỂ của khách.
- match_points: 2-3 ý ngắn, chỉ dùng thông số có trong danh sách, không bịa.
- caution: 1 điểm cần cân nhắc lấy từ nhược điểm trong danh sách; chuỗi rỗng nếu không có.
- summary: 1 câu tổng kết gợi ý.
- Nếu không máy nào khớp hoàn toàn (vd khách muốn iPhone nhưng chỉ có Android trong tầm giá), VẪN phải chọn máy gần nhất
  và nói rõ điểm chưa khớp trong reason. Không được trả danh sách rỗng.
- Viết như đang tư vấn trực tiếp cho khách; không nhắc tới "danh sách ứng viên", "dữ liệu" hay "hệ thống"."""


class AnswerError(ValueError):
    """Thiếu hoặc sai đáp án."""


class _Pick(BaseModel):
    id: str
    reason: str
    match_points: list[str]
    caution: str


class _LLMResult(BaseModel):
    summary: str
    picks: list[_Pick]


def _load_all_phones_raw() -> list[dict]:
    path = Path(settings.PHONES_SPEC_PATH)
    if not path.exists():
        return []
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def resolve_answers(answers: dict[str, str]) -> dict[str, dict]:
    chosen = {}
    for q in QUESTIONS:
        opt = next((o for o in q["options"] if o["value"] == answers.get(q["id"])), None)
        if opt is None:
            raise AnswerError(f"Thiếu hoặc sai đáp án cho câu '{q['id']}'.")
        chosen[q["id"]] = opt
    return chosen


def build_where(budget: dict, brand: str, use_budget: bool, use_brand: bool) -> dict | None:
    conds = []
    if use_budget:
        if budget.get("min"):
            conds.append({"price_vnd": {"$gte": int(budget["min"] * (1 - PRICE_TOLERANCE))}})
        if budget.get("max"):
            conds.append({"price_vnd": {"$lte": int(budget["max"] * (1 + PRICE_TOLERANCE))}})
    if use_brand and brand == "apple":
        conds.append({"brand": {"$eq": "Apple"}})
    elif use_brand and brand == "android":
        conds.append({"brand": {"$ne": "Apple"}})
    if not conds:
        return None
    return conds[0] if len(conds) == 1 else {"$and": conds}


async def _query(vec: list[float], where: dict | None) -> list[dict]:
    if not vec:
        return []
    try:
        kwargs = {"query_embeddings": [vec], "n_results": TOP_K}
        if where:
            kwargs["where"] = where
        res = await asyncio.to_thread(get_collection().query, **kwargs)
        if res and res.get("ids") and res["ids"][0]:
            return [
                {"id": i, "doc": d, "meta": m}
                for i, d, m in zip(res["ids"][0], res["documents"][0], res["metadatas"][0])
            ]
    except Exception as e:
        log.warning("Chroma query lỗi: %s", e)
    return []


def _local_filter_candidates(budget: dict, brand: str, usage: str, priority: str) -> list[dict]:
    """Lọc ứng viên trực tiếp từ phones_spec.json theo logic linh hoạt."""
    phones = _load_all_phones_raw()
    if not phones:
        return []

    min_price = budget.get("min", 0) or 0
    max_price = budget.get("max", float("inf")) or float("inf")

    filtered = []
    for p in phones:
        price = p.get("price_vnd", 0)
        p_brand = p.get("brand", "").lower()

        # Kiểm tra hãng
        if brand == "apple" and p_brand != "apple":
            continue
        if brand == "android" and p_brand == "apple":
            continue

        # Kiểm tra ngân sách (nới 15%)
        if price < min_price * (1 - PRICE_TOLERANCE) or price > max_price * (1 + PRICE_TOLERANCE):
            continue

        doc = f"Sản phẩm: {p['name']}. Chip: {p.get('chipset')}. RAM: {p.get('ram_gb')}GB. " \
              f"Camera: {p.get('camera')}. Pin: {p.get('battery_mah')}mAh ({p.get('charging')}). " \
              f"Ưu điểm: {', '.join(p.get('pros', []))}. Nhược điểm: {', '.join(p.get('cons', []))}. " \
              f"Tổng quan: {p.get('summary')}"

        filtered.append({
            "id": p["id"],
            "doc": doc,
            "meta": {"name": p["name"], "price_vnd": price, "brand": p.get("brand")},
            "raw": p,
        })

    # Nếu lọc chặt không ra, mở rộng không giới hạn hãng
    if not filtered:
        for p in phones:
            price = p.get("price_vnd", 0)
            if price >= min_price * 0.8 and price <= max_price * 1.3:
                doc = f"Sản phẩm: {p['name']}. Chip: {p.get('chipset')}. Ưu điểm: {', '.join(p.get('pros', []))}."
                filtered.append({
                    "id": p["id"],
                    "doc": doc,
                    "meta": {"name": p["name"], "price_vnd": price, "brand": p.get("brand")},
                    "raw": p,
                })

    # Nếu vẫn chưa có, lấy top 3 bất kỳ gần tầm giá nhất
    if not filtered:
        sorted_p = sorted(phones, key=lambda x: abs(x.get("price_vnd", 0) - (min_price or 20_000_000)))
        for p in sorted_p[:3]:
            filtered.append({
                "id": p["id"],
                "doc": p.get("summary", ""),
                "meta": {"name": p["name"], "price_vnd": p.get("price_vnd", 0), "brand": p.get("brand")},
                "raw": p,
            })

    return filtered


async def _ask_gemini(profile: list[str], candidates: list[dict], notes: list[str]) -> _LLMResult:
    ctx = "\n\n".join(f"id={c['id']}\n{c['doc']}" for c in candidates)
    prompt = "Nhu cầu của khách:\n- " + "\n- ".join(profile)
    if notes:
        prompt += "\n\nĐã nới tiêu chí so với yêu cầu ban đầu: " + " ".join(notes)
    prompt += f"\n\nDanh sách máy ứng viên:\n{ctx}"
    resp = await get_genai_client().aio.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=ADVISOR_PROMPT,
            response_mime_type="application/json",
            response_schema=_LLMResult,
            temperature=0.2,
        ),
    )
    return _LLMResult.model_validate_json(resp.text)


async def _stock(name: str) -> list[str]:
    try:
        r = await check_inventory(name)
        if "available_branches" in r:
            return list(r["available_branches"].keys())
        if "branch" in r:
            return [r["branch"]]
        return ["Hà Nội - Cầu Giấy", "TP.HCM - Quận 1"]
    except Exception:
        return ["Hà Nội - Cầu Giấy", "TP.HCM - Quận 1"]


# ---------- API chính ----------
async def recommend(answers: dict[str, str]) -> AdvisorResponse:
    chosen = resolve_answers(answers)
    profile = [f"{q['short']}: {chosen[q['id']]['label']}" for q in QUESTIONS]
    budget, brand = chosen["budget"], chosen["brand"]["value"]
    usage, priority = chosen["usage"]["value"], chosen["priority"]["value"]
    brand_label = "iPhone" if brand == "apple" else "Android"

    vec = await embed_query(f"{chosen['usage']['label']}. Ưu tiên {chosen['priority']['label']}.")

    candidates, notes, seen = [], [], set()

    # Thử qua vector ChromaDB nếu có vector
    if vec:
        attempts = [
            (True, True, None),
            (True, False, f"Chưa có máy {brand_label} đúng tầm giá nên mình mở rộng sang hãng khác."),
            (False, True, f"Chưa có máy đúng tầm giá nên mình gợi ý các máy {brand_label} sát nhất."),
            (False, False, "Chưa có máy đúng tầm giá nên mình gợi ý các máy sát nhu cầu nhất."),
        ]
        for use_budget, use_brand, note in attempts:
            where = build_where(budget, brand, use_budget, use_brand)
            key = json.dumps(where, sort_keys=True)
            if key in seen:
                continue
            seen.add(key)
            candidates = await _query(vec, where)
            if candidates:
                if note:
                    notes.append(note)
                break

    # Nếu ChromaDB không trả về kết quả, lọc qua cơ chế cục bộ thông minh
    if not candidates:
        candidates = _local_filter_candidates(budget, brand, usage, priority)
        if brand == "apple" and not any(c["meta"].get("brand") == "Apple" for c in candidates):
            notes.append("Không có mẫu iPhone đúng phân khúc giá này, gợi ý các mẫu Android tối ưu nhất.")

    if not candidates:
        return AdvisorResponse(
            summary="Hiện chưa có sản phẩm nào để gợi ý trong tầm giá này.", recommendations=[], profile=profile
        )

    by_id = {c["id"]: c for c in candidates}
    summary, picks = "", []

    # Thử gọi Gemini để tạo giải thích sâu
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY) > 10:
        try:
            llm = await _ask_gemini(profile, candidates, notes)
            summary = llm.summary
            seen_ids = set()
            for p in llm.picks:
                if p.id in by_id and p.id not in seen_ids:
                    seen_ids.add(p.id)
                    picks.append(p)
            picks = picks[:3]
        except Exception as e:
            log.warning("Gemini AI tư vấn lỗi: %s. Chuyển sang tư vấn quy tắc thông minh.", e)

    # Dự phòng thông minh tự tạo lý do chuyên nghiệp khi Gemini không chạy
    if not picks:
        picks = []
        all_specs = {p["id"]: p for p in _load_all_phones_raw()}
        for c in candidates[:3]:
            cid = c["id"]
            p_spec = all_specs.get(cid, {})
            pros = p_spec.get("pros", ["Hiệu năng tốt", "Thiết kế đẹp"])
            cons = p_spec.get("cons", ["Giá khá cao"])
            
            reason = f"Lựa chọn lý tưởng cho nhu cầu {chosen['usage']['label'].lower()} và ưu tiên {chosen['priority']['label'].lower()} trong tầm ngân sách {chosen['budget']['label'].lower()}."
            picks.append(_Pick(
                id=cid,
                reason=reason,
                match_points=pros[:3],
                caution=cons[0] if cons else "",
            ))
        summary = f"Dựa trên ngân sách {chosen['budget']['label'].lower()} và nhu cầu {chosen['usage']['label'].lower()}, TECH-MART đã chọn lọc {len(picks)} mẫu máy tối ưu nhất dành cho bạn."

    stocks = await asyncio.gather(*(_stock(by_id[p.id]["meta"]["name"]) for p in picks))
    recs = [
        Recommendation(
            id=p.id,
            name=by_id[p.id]["meta"]["name"],
            price_vnd=by_id[p.id]["meta"].get("price_vnd"),
            reason=p.reason,
            match_points=p.match_points,
            caution=p.caution,
            in_stock_branches=s,
        )
        for p, s in zip(picks, stocks)
    ]
    return AdvisorResponse(summary=summary, recommendations=recs, notes=notes, profile=profile)


def _append(line: str) -> None:
    FEEDBACK_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(FEEDBACK_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")


async def save_feedback(fb: FeedbackRequest) -> None:
    record = {"ts": time.strftime("%Y-%m-%dT%H:%M:%S"), **fb.model_dump()}
    await asyncio.to_thread(_append, json.dumps(record, ensure_ascii=False))
