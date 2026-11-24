# 🤖 AI Service — TECH-MART

> **Microservice tư vấn thông minh** · FastAPI · Gemini AI · ChromaDB RAG · SSE Streaming  
> Cổng mặc định: **`:8085`**

---

## 📋 Mục lục

- [Tổng quan](#-tổng-quan)
- [Cổng & Kết nối](#-cổng--kết-nối)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Cài đặt & Khởi chạy](#-cài-đặt--khởi-chạy)
- [Cấu hình .env](#-cấu-hình-env)
- [API Endpoints](#-api-endpoints)
- [Luồng xử lý RAG](#-luồng-xử-lý-rag)
- [Chạy Docker](#-chạy-docker)
- [Troubleshooting](#-troubleshooting)

---

## 📌 Tổng quan

`ai-service` là microservice Python xử lý toàn bộ tính năng AI của hệ thống TECH-MART:

| Tính năng | Mô tả |
|-----------|-------|
| **Chat SSE Streaming** | Trả lời câu hỏi tư vấn sản phẩm theo thời gian thực qua Server-Sent Events |
| **Tư vấn 4 bước (Advisor Quiz)** | Nhận bộ trả lời (ngân sách / nhu cầu / hãng / ưu tiên) → gợi ý top 3 sản phẩm phù hợp nhất |
| **RAG (Retrieval-Augmented Generation)** | Tìm kiếm vector ChromaDB + Gemini LLM để trả lời chính xác theo dữ liệu thực |
| **Kiểm tra tồn kho** | Mock inventory 150 chi nhánh (Hà Nội, TP.HCM, Đà Nẵng) |
| **Fallback thông minh** | Tự động hoạt động ngay cả khi Gemini API hoặc ChromaDB không khả dụng |

---

## 🔌 Sơ Đồ Cổng & Kết Nối Liên Microservices (Tránh Xung Đột)

`ai-service` được gán cố định tại cổng **`8085`**, hoàn toàn cách ly và không trùng với bất kỳ service nào trong hệ thống:

```
                                  ┌────────────────────────┐
                                  │  Discovery Server      │
                                  │  (Eureka :8761)        │
                                  └──────────▲─────────────┘
                                             │
                                  ┌──────────┴─────────────┐
                                  │  Spring Cloud Gateway  │
                                  │  (:8080)               │
                                  └──────────▲─────────────┘
                                             │
      ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
      │                  │                   │                   │                  │
┌─────▼──────────┐ ┌─────▼──────────┐  ┌─────▼──────────┐  ┌─────▼──────────┐ ┌─────▼──────────┐
│identity-service│ │catalog-service │  │inventory-service│ │ order-service  │ │   ai-service     │
│  (Port :8081)  │ │  (Port :8082)  │  │  (Port :8083)  │  │ (Port :8084)   │ │  (Port :8085)   │
└────────────────┘ └────────┬───────┘  └────────┬───────┘  └────────┬───────┘ └─────▲──────────┘
                            │                   │                   │               │
                            └───────────────────┼───────────────────┴───────────────┘
                                                │ (Gọi HTTP REST lấy dữ liệu thật)
                                       Khi các service khác
                                         chạy xong cổng
```

### Bảng phân bổ cổng toàn hệ thống:

| Cổng | Microservice | Công nghệ | Nhiệm vụ đối với AI Service | Trạng thái kết nối |
|:---:|:---|:---|:---|:---:|
| **`:8085`** | **ai-service** | Python FastAPI | Cổng riêng của AI, cung cấp API Chat & Tư vấn | ✅ **Cố định, không trùng** |
| **`:3000`** | **frontend** | Next.js 16 | Gọi trực tiếp `:8085` hoặc qua Gateway | ✅ **Đã kết nối & CORS** |
| **`:8080`** | **api-gateway** | Spring Cloud | Route `/api/ai/**` chuyển tiếp sang `:8085` | ✅ **Đã định tuyến** |
| **`:8081`** | **identity-service** | Spring Boot | Xác thực khách hàng & hạng thành viên (S-Member) | 🔌 **Đã nối sẵn trong code** |
| **`:8082`** | **catalog-service** | Spring Boot | Cung cấp giá bán & thông số sản phẩm thời gian thực | 🔌 **Đã nối sẵn trong code** |
| **`:8083`** | **inventory-service** | Spring Boot | Cung cấp số lượng tồn kho theo từng chi nhánh/thành phố | 🔌 **Đã nối sẵn trong code** |
| **`:8084`** | **order-service** | Spring Boot | Tra cứu tình trạng & tiến độ đơn hàng | 🔌 **Đã nối sẵn trong code** |
| **`:8761`** | **discovery-server** | Netflix Eureka | Service Registry quản lý địa chỉ microservices | 🔌 **Đã nối sẵn URL** |

> 💡 **Cơ chế tự động phát hiện (Auto-fallback):**
> Trong file `app/core/tools.py`, AI Service **luôn tự động thăm dò cổng thật trước**. Khi bạn hoặc đồng đội hoàn thành và bật bất kỳ service nào (`:8081`, `:8082`, `:8083`, `:8084`), AI Service sẽ tự động lấy dữ liệu từ service đó mà **không cần chỉnh sửa hay cấu hình lại bất kỳ dòng code nào**. Nếu service chưa bật, AI tự động dùng dữ liệu nội bộ để đảm bảo chatbot luôn mượt mà.

### Kiểm tra sức khỏe toàn bộ cổng:
Truy cập `http://localhost:8085/ports` (hoặc `/api/v1/ports`) để xem bảng chẩn đoán trực tiếp trạng thái kết nối của từng cổng trong cluster.

---

## 📂 Cấu trúc thư mục

```
ai-service/
├── app/
│   ├── main.py                  # FastAPI app, CORS, mount routes (3 prefix)
│   ├── config.py                # Pydantic Settings đọc từ .env
│   ├── api/
│   │   └── v1/
│   │       ├── chat.py          # POST /chat/stream  (SSE) & POST /chat
│   │       └── advisor.py       # GET /advisor/questions, POST /recommend, POST /feedback
│   ├── core/
│   │   ├── rag_engine.py        # Pipeline RAG: embed → ChromaDB → Gemini stream
│   │   ├── advisor.py           # Logic tư vấn 4 bước + Gemini JSON structured output
│   │   └── tools.py             # Mock inventory: check_inventory() 150 chi nhánh
│   ├── db/
│   │   ├── chromadb_client.py   # Kết nối ChromaDB (PersistentClient hoặc HttpClient)
│   │   └── seed_data.py         # Nạp phones_spec.json vào ChromaDB lần đầu
│   └── models/
│       └── schemas.py           # Pydantic schemas: ChatRequest, AdvisorResponse, ...
├── data/
│   ├── phones_spec.json         # 9 mẫu điện thoại phủ đầy đủ phân khúc giá
│   ├── chroma_storage/          # Dữ liệu vector ChromaDB (tự tạo khi chạy lần đầu)
│   └── feedback.jsonl           # Log phản hồi người dùng (tự tạo)
├── tests/                       # pytest test cases
├── .env                         # Biến môi trường thực (không commit lên git)
├── .env.example                 # Mẫu cấu hình
├── requirements.txt             # Dependencies Python
├── Dockerfile
├── docker-compose.yml
└── pytest.ini
```

---

## 🚀 Cài đặt & Khởi chạy

### Yêu cầu
- Python **3.11+** (khuyến nghị 3.12)
- pip
- (Tuỳ chọn) Docker Desktop — để chạy ChromaDB container

### Bước 1 — Tạo và kích hoạt môi trường ảo

```powershell
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

### Bước 2 — Cài dependencies

```bash
pip install -r requirements.txt
```

### Bước 3 — Cấu hình môi trường
.\venv\Scripts\Activate.ps1
```bash

# Mở .env và điền API Key
# GEMINI_API_KEY=your_key_here
```

### Bước 4 — Khởi chạy server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8085 --reload
```

### Kiểm tra hoạt động

```
http://localhost:8085/health   →  {"status": "ok", "service": "ai-service", ...}
http://localhost:8085/docs     →  Swagger UI tương tác
http://localhost:8085/         →  Danh sách tất cả endpoints
```

> ✅ **Service hoạt động ngay cả khi không có Gemini API Key** — tự động dùng bộ lọc quy tắc từ `phones_spec.json` làm phương án dự phòng. Không crash, không lỗi 500.

---

## ⚙️ Cấu hình .env

```env
# ── GEMINI AI ──────────────────────────────────────────
GEMINI_API_KEY=your_gemini_key_here   # Lấy tại https://ai.google.dev
GEMINI_MODEL=gemini-2.5-flash         # Model LLM (hỗ trợ structured output)
EMBEDDING_MODEL=gemini-embedding-001  # Model nhúng vector
EMBEDDING_DIM=768                     # Chiều vector embedding

# ── SERVER ─────────────────────────────────────────────
PORT=8085
CORS_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000,http://localhost:3001

# ── CHROMADB ───────────────────────────────────────────
CHROMA_HOST=          # Để trống → dùng file local tại data/chroma_storage/
                      # Điền "localhost" → kết nối container ChromaDB qua HTTP
CHROMA_PORT=8000
CHROMA_COLLECTION=phones
RAG_TOP_K=4           # Số tài liệu lấy ra mỗi lần truy vấn vector
RAG_MAX_DISTANCE=0.85 # Ngưỡng khoảng cách (thấp hơn = chính xác hơn)

# ── BACKEND SERVICES (nếu không dùng mock) ─────────────
USE_MOCK_INVENTORY=true            # true = dùng kho giả 150 chi nhánh
INVENTORY_SERVICE_URL=http://localhost:8083
CATALOG_SERVICE_URL=http://localhost:8082
```

---

## 📡 API Endpoints

Tất cả endpoint hoạt động trên **3 prefix** (tương thích cả gọi thẳng lẫn qua Gateway):

| Prefix | Dùng khi |
|--------|----------|
| `/api/v1/...` | Frontend gọi thẳng `:8085` |
| `/api/ai/...` | Qua Spring Cloud Gateway `:8080` |
| `/...` (không prefix) | Test trực tiếp / tích hợp đơn giản |

### Health & Info

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/health` | Health check — trả trạng thái service |
| `GET` | `/` | Liệt kê tất cả endpoints có sẵn |
| `GET` | `/docs` | Swagger UI tương tác |

### Chat (SSE Streaming)

| Method | Path | Mô tả |
|--------|------|-------|
| `POST` | `/api/v1/chat/stream` | **Chat SSE** — stream `text/event-stream` |
| `POST` | `/api/v1/chat` | Chat không streaming (dùng cho test) |

**Request body:**
```json
{
  "message": "So sánh iPhone 16 Pro Max và Galaxy S24 Ultra",
  "history": [
    {"role": "user", "content": "Câu hỏi trước"},
    {"role": "assistant", "content": "Câu trả lời trước"}
  ]
}
```

**SSE Response events:**
```
data: {"type": "tool_start", "data": "Đang tra cứu kho..."}
data: {"type": "token", "data": "iPhone 16 Pro Max "}
data: {"type": "token", "data": "có chip A18 Pro..."}
data: {"type": "sources", "data": [{"id": "iphone_16_pro_max", "name": "...", "price_vnd": 29990000}]}
data: [DONE]
```

### Advisor (Tư vấn 4 bước)

| Method | Path | Mô tả |
|--------|------|-------|
| `GET` | `/api/v1/advisor/questions` | Lấy danh sách câu hỏi wizard |
| `POST` | `/api/v1/advisor/recommend` | Nhận bộ trả lời → trả top 3 gợi ý |
| `POST` | `/api/v1/advisor/feedback` | Gửi phản hồi (lưu `data/feedback.jsonl`) |

**Request body `/recommend`:**
```json
{
  "answers": {
    "budget": "10_20",
    "usage": "camera",
    "brand": "android",
    "priority": "display"
  }
}
```

**Giá trị hợp lệ:**

| Câu hỏi | Các lựa chọn |
|---------|-------------|
| `budget` | `under_10` / `10_20` / `20_30` / `over_30` |
| `usage` | `gaming` / `camera` / `work` / `basic` |
| `brand` | `apple` / `android` / `any` |
| `priority` | `battery` / `display` / `performance` / `price` |

---

## 🔄 Luồng xử lý RAG

```
Client gửi message
      │
      ▼
rag_engine.py
      │
      ├─► embed_query(message)          ← Gemini Embedding API
      │         │
      │         ▼
      ├─► ChromaDB.query(vector, top_k) ← Tìm tài liệu tương đồng
      │         │
      │         ▼
      ├─► check_inventory(product_name) ← Tools: Mock 150 chi nhánh
      │         │
      │         ▼
      └─► Gemini LLM stream             ← Sinh câu trả lời có nguồn
                │
                ▼
         SSE events → Frontend
         (token by token + sources)

─── Fallback khi Gemini/ChromaDB lỗi ───────────────────────
      │
      └─► Keyword search trong phones_spec.json
          → Trả câu trả lời dựa trên quy tắc, không crash
```

---

## 🐳 Chạy Docker

```bash
# Chỉ chạy ai-service
docker-compose up --build

# Chạy kèm ChromaDB container
docker-compose up --build chromadb ai-service
```

Cấu hình `docker-compose.yml`:
- Map cổng `8085:8085`
- Mount `./app` để hot-reload khi sửa code
- Volume `chroma_data` giữ dữ liệu ChromaDB qua các lần restart

---

## 🛠️ Troubleshooting

### ❌ `uvicorn: command not found`
```bash
# Đảm bảo đã kích hoạt venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate     # Linux

pip install -r requirements.txt
```

### ❌ AI trả lời chung chung, không có thông tin sản phẩm
```
Nguyên nhân 1: GEMINI_API_KEY sai hoặc hết quota
  → Lấy key mới tại https://ai.google.dev

Nguyên nhân 2: ChromaDB chưa được seed dữ liệu
  → Xóa thư mục data/chroma_storage/ và restart service
  → Dữ liệu sẽ được tự động nạp từ phones_spec.json
```

### ❌ CORS error trên trình duyệt
```
Kiểm tra CORS_ORIGINS trong .env có chứa đúng origin của frontend
Ví dụ: CORS_ORIGINS=http://localhost:3000,...
Khởi động lại service sau khi sửa .env
```

### ❌ `ChromaDB khởi động với cấu hình dự phòng nội bộ`
```
Đây là cảnh báo bình thường, không phải lỗi nghiêm trọng.
Service vẫn chạy được với bộ lọc JSON local.
Để dùng ChromaDB đầy đủ: docker-compose up chromadb
```

### ❌ `422 Unprocessable Entity` khi gọi /advisor/recommend
```
Kiểm tra body JSON có đủ 4 trường: budget, usage, brand, priority
Và mỗi value phải đúng với danh sách hợp lệ ở trên
```

---

## 📦 Dependencies

| Package | Phiên bản | Vai trò |
|---------|-----------|---------|
| `fastapi` | 0.115.x | Web framework async |
| `uvicorn[standard]` | 0.32.x | ASGI server |
| `google-genai` | ≥ 1.0.0 | Gemini API SDK (LLM + Embedding) |
| `chromadb` | ≥ 0.5.5 | Vector database local/remote |
| `pydantic` | ≥ 2.8 | Data validation & schemas |
| `pydantic-settings` | ≥ 2.4 | Đọc cấu hình từ `.env` |
| `httpx` | ≥ 0.27 | HTTP client async (gọi backend services) |
| `python-dotenv` | ≥ 1.0 | Load file `.env` |
| `pytest` | ≥ 8.0 | Test framework |
| `pytest-asyncio` | ≥ 0.24 | Test async functions |
