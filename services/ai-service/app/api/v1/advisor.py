from fastapi import APIRouter, HTTPException

from app.core import advisor
from app.models.schemas import AdvisorRequest, AdvisorResponse, FeedbackRequest

router = APIRouter(prefix="/advisor", tags=["advisor"])


@router.get("/questions")
async def get_questions():
    """Danh sách câu hỏi + lựa chọn để frontend dựng wizard."""
    return {"questions": advisor.QUESTIONS}


@router.post("/recommend", response_model=AdvisorResponse)
async def recommend(req: AdvisorRequest):
    try:
        return await advisor.recommend(req.answers)
    except advisor.AnswerError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/feedback", status_code=204)
async def feedback(req: FeedbackRequest):
    await advisor.save_feedback(req)
