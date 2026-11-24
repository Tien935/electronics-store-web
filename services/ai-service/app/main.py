import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import advisor, chat
from app.config import settings
from app.core.tools import check_all_ports_status
from app.db.chromadb_client import get_collection
from app.db.seed_data import seed

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
log = logging.getLogger("ai-service")


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Tự động nạp dữ liệu tri thức vào ChromaDB lần đầu
    try:
        col = get_collection()
        if col.count() == 0:
            n = await asyncio.to_thread(seed)
            log.info("Khởi tạo seed dữ liệu ChromaDB thành công: %d sản phẩm", n)
        else:
            log.info("ChromaDB đã sẵn sàng với %d sản phẩm", col.count())
    except Exception as e:
        log.warning("ChromaDB khởi động với cấu hình dự phòng nội bộ: %s", e)
    yield


app = FastAPI(
    title="TECH-MART AI Service - Trợ lý tư vấn & Chatbot RAG",
    version="1.2.0",
    description="Microservice cung cấp API tư vấn sản phẩm thông minh và kết nối liên microservices",
    lifespan=lifespan,
)

# Cấu hình CORS toàn diện: hỗ trợ tất cả các cổng của Next.js (3000, 3001, v.v.) và Gateway (8080)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$",
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:8085",
        "http://127.0.0.1:8085",
        *settings.cors_origin_list,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Khớp đường dẫn tiêu chuẩn khi Frontend gọi trực tiếp (:8085)
app.include_router(chat.router, prefix="/api/v1")
app.include_router(advisor.router, prefix="/api/v1")

# 2. Khớp đường dẫn khi đi qua Spring Cloud Gateway (:8080/api/ai) hoặc khi cấu hình AI_PREFIX=/api/ai
app.include_router(chat.router, prefix="/api/ai")
app.include_router(advisor.router, prefix="/api/ai")

# 3. Khớp đường dẫn gốc trực tiếp không tiền tố (/chat, /advisor)
app.include_router(chat.router)
app.include_router(advisor.router)


@app.get("/ports")
@app.get("/api/v1/ports")
@app.get("/api/ai/ports")
async def get_ports_status():
    """Kiểm tra tình trạng kết nối tới tất cả các cổng microservices trong hệ thống."""
    return await check_all_ports_status()


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "ai-service",
        "port": settings.PORT,
        "mode": "standalone_resilient",
        "ports_connected": {
            "gateway": settings.GATEWAY_URL,
            "identity": settings.IDENTITY_SERVICE_URL,
            "catalog": settings.CATALOG_SERVICE_URL,
            "inventory": settings.INVENTORY_SERVICE_URL,
            "order": settings.ORDER_SERVICE_URL,
            "discovery": settings.DISCOVERY_SERVER_URL,
        },
    }


@app.get("/")
async def root():
    return {
        "message": "Chào mừng đến với TECH-MART AI Service API",
        "port": settings.PORT,
        "endpoints": {
            "health": "/health",
            "ports_diagnostic": "/ports",
            "chat_stream": ["/api/v1/chat/stream", "/api/ai/chat/stream"],
            "advisor_questions": ["/api/v1/advisor/questions", "/api/ai/advisor/questions"],
            "advisor_recommend": ["/api/v1/advisor/recommend", "/api/ai/advisor/recommend"],
            "advisor_feedback": ["/api/v1/advisor/feedback", "/api/ai/advisor/feedback"],
        },
    }
