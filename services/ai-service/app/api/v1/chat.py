import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.rag_engine import stream_answer
from app.models.schemas import ChatRequest, ChatResponse, Source

router = APIRouter(prefix="/chat", tags=["chat"])


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"


@router.post("/stream")
async def chat_stream(req: ChatRequest):
    """SSE: mỗi dòng `data: {"type": "...", "data": ...}`."""

    async def gen():
        async for event in stream_answer(req.message, req.history):
            yield _sse(event)

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # tắt buffer nếu có Nginx phía trước
        },
    )


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Bản không streaming, dùng cho test / tích hợp đơn giản."""
    answer, sources = [], []
    async for event in stream_answer(req.message, req.history):
        if event["type"] == "token":
            answer.append(event["data"])
        elif event["type"] == "sources":
            sources = [Source(**s) for s in event["data"]]
        elif event["type"] == "error":
            answer.append(event["data"])
    return ChatResponse(answer="".join(answer), sources=sources)