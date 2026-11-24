from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)


class Source(BaseModel):
    id: str
    name: str
    price_vnd: int | None = None


class ChatResponse(BaseModel):
    answer: str
    sources: list[Source] = []


class ProductSpec(BaseModel):
    id: str
    name: str
    brand: str
    price_vnd: int
    os: str
    chipset: str
    ram_gb: int
    storage_gb: list[int]
    display: str
    camera: str
    battery_mah: int
    charging: str
    pros: list[str]
    cons: list[str]
    summary: str


# ---------- Tư vấn theo lựa chọn (advisor) ----------
class AdvisorRequest(BaseModel):
    # {"budget": "10_20", "usage": "gaming", ...} -> giá trị lấy từ GET /advisor/questions
    answers: dict[str, str]


class Recommendation(BaseModel):
    id: str
    name: str
    price_vnd: int | None = None
    reason: str
    match_points: list[str] = []
    caution: str = ""
    in_stock_branches: list[str] = []


class AdvisorResponse(BaseModel):
    summary: str
    recommendations: list[Recommendation]
    notes: list[str] = []      # vd: "Chưa có iPhone đúng tầm giá nên mở rộng sang hãng khác"
    profile: list[str] = []    # vd: ["Ngân sách: 10 – 20 triệu", ...]


class FeedbackRequest(BaseModel):
    product_id: str
    verdict: Literal["like", "dislike"]
    answers: dict[str, str] = {}
    comment: str | None = Field(default=None, max_length=500)