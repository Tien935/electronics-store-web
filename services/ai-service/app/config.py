from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent  # services/ai-service


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BASE_DIR / ".env", extra="ignore")

    # Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_DIM: int = 768

    # Cổng riêng của AI Service (Tránh tuyệt đối trùng với 8080-8084)
    PORT: int = 8085
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000,http://localhost:3001"

    # ChromaDB (Vector Store RAG)
    CHROMA_HOST: str = ""
    CHROMA_PORT: int = 8000
    CHROMA_PATH: str = str(BASE_DIR / "data" / "chroma_storage")
    CHROMA_COLLECTION: str = "phones"
    RAG_TOP_K: int = 4
    RAG_MAX_DISTANCE: float = 0.85

    # Dữ liệu tri thức nội bộ
    PHONES_SPEC_PATH: str = str(BASE_DIR / "data" / "phones_spec.json")

    # =========================================================================
    # KẾT NỐI TỚI CÁC MICROSERVICES KHÁC (BẢO ĐẢM KHÔNG XUNG ĐỘT CỔNG)
    # =========================================================================
    GATEWAY_URL: str = "http://localhost:8080"           # Spring Cloud Gateway (8080)
    IDENTITY_SERVICE_URL: str = "http://localhost:8081"  # User & Xác thực JWT (8081)
    CATALOG_SERVICE_URL: str = "http://localhost:8082"   # Danh mục sản phẩm & Giá (8082)
    INVENTORY_SERVICE_URL: str = "http://localhost:8083" # Kho hàng & Tồn kho chi nhánh (8083)
    ORDER_SERVICE_URL: str = "http://localhost:8084"     # Đơn hàng & Giỏ hàng (8084)
    DISCOVERY_SERVER_URL: str = "http://localhost:8761"  # Eureka Service Discovery (8761)
    FRONTEND_URL: str = "http://localhost:3000"          # Next.js Storefront (3000)

    # Chế độ dữ liệu dự phòng khi service khác chưa khởi chạy
    USE_MOCK_INVENTORY: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
