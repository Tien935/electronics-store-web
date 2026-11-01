# Website Bán Đồ Điện Tử & Quản Lý Bán Hàng Tích Hợp AI Theo Kiến Trúc Microservices

> **Đề tài Bài tập lớn:** Xây dựng website bán đồ điện tử và quản lý bán hàng tích hợp AI theo kiến trúc Microservices sử dụng Java Spring Boot và Next.js cho chuỗi bán lẻ thiết bị di động.  
> **Trường:** Đại học Công nghiệp Hà Nội (HaUI) - Trường Công nghệ Thông tin & Truyền thông  
> **Thời gian thực hiện:** 30/10/2026 – 12/12/2026 (7 tuần)

---

## 👥 Danh Sách Thành Viên & Phân Công Nhiệm Vụ

| STT | | Họ và Tên |
| :---: | | :--- | :--- | :--- |
| **1** | | **Đỗ Đức Tiền** | 
| **2** | | **Võ Xuân Quang** |
| **3** | | **Cao Đình Long** |
| **4** | | **Vũ Văn Dương** | 
| **5** | | **Nguyễn Ngọc Tú** 

---

## 🏛️ Kiến Trúc Hệ Thống (System Architecture)

Hệ thống được thiết kế theo mô hình **Microservices** phân tán kết hợp với ứng dụng giao diện **Next.js**:

```text
                               +-----------------------------+
                               |     Client Browser (Web)    |
                               |    Next.js 14/15 App Router |
                               +--------------+--------------+
                                              |
                                              v (HTTP / REST)
                               +-----------------------------+
                               |    Spring Cloud Gateway     | (Port: 8080)
                               |  - Rate Limiting, CORS      |
                               |  - JWT AuthenticationFilter |
                               +--------------+--------------+
                                              |
         +--------------------+---------------+--------------------+--------------------+
         | (REST/Feign)       | (REST/Feign)  | (REST/Feign)       | (REST/Feign)       | (SSE Streaming)
         v                    v               v                    v                    v
+------------------+ +------------------+ +------------------+ +------------------+ +------------------+
| identity-service | | catalog-service  | |inventory-service | |  order-service   | |    ai-service    |
| (Spring Boot 3)  | | (Spring Boot 3)  | | (Spring Boot 3)  | | (Spring Boot 3)  | | (Python FastAPI) |
| Port: 8081       | | Port: 8082       | | Port: 8083       | | Port: 8084       | | Port: 8085       |
+--------+---------+ +--------+---------+ +--------+---------+ +--------+---------+ +--------+---------+
         |                    |                    |                    |                    |
         v                    v                    v                    v                    v
+------------------+ +------------------+ +------------------+ +------------------+ +------------------+
| retail_identity  | |  retail_catalog  | | retail_inventory | |   retail_order   | |    ChromaDB      |
|    (MySQL 8.0)   | |    (MySQL 8.0)   | |    (MySQL 8.0)   | |    (MySQL 8.0)   | |  (Vector Store)  |
+------------------+ +------------------+ +------------------+ +------------------+ +------------------+
```

---

## 📁 Cấu Trúc Thư Mục Monorepo

```text
├── .github/                     # GitHub Actions CI/CD workflows
├── docs/                        # Tài liệu dự án, báo cáo BTL (BC01, BC02)
│   ├── BC01_Nxx_Bao cao BTL.docx
│   └── Nxx_bao cao KHTH.docx
├── frontend/                    # Ứng dụng Next.js (Storefront & Backoffice)
│   ├── app/
│   │   ├── (storefront)/        # Giao diện khách hàng mua online, chat AI
│   │   └── (backoffice)/        # Giao diện nhân viên kho & Admin duyệt đơn gán IMEI
│   └── components/ui/           # Shadcn/UI components
├── services/                    # Cụm Microservices Backend
│   ├── api-gateway/             # Spring Cloud Gateway
│   ├── identity-service/        # Xác thực JWT, User & Phân quyền RBAC
│   ├── catalog-service/         # Quản lý Sản phẩm, Biến thể màu/dung lượng, Thông số JSON
│   ├── inventory-service/       # Quản lý kho đa chi nhánh, Vòng đời IMEI & Bảo hành điện tử
│   ├── order-service/           # Giỏ hàng, Đơn hàng, Voucher & Cổng thanh toán VNPAY
│   └── ai-service/              # Trợ lý RAG Chatbot tư vấn cấu hình (FastAPI + Gemini)
├── docker-compose.infra.yml     # Khởi chạy hạ tầng DB (MySQL 8.0, ChromaDB) khi lập trình
└── docker-compose.yml           # Khởi chạy toàn bộ hệ thống "1-Click" khi nghiệm thu demo
```

---

## 🛠️ Ngăn Xếp Công Nghệ (Technology Stack)

*   **Backend:** Java 17/21, Spring Boot 3.x, Spring Cloud Gateway, Spring Cloud OpenFeign, Spring Security 6, JWT Stateless, Resilience4j.
*   **Database:** MySQL 8.0 (Phân chia logical databases: `retail_identity_db`, `retail_catalog_db`, `retail_inventory_db`, `retail_order_db`).
*   **Frontend:** Next.js 14/15 (App Router), TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons, TanStack Query, Axios.
*   **AI Service:** Python 3.11+, FastAPI, Google Gemini API, ChromaDB (Vector Store), LangChain / LlamaIndex, Server-Sent Events (SSE).
*   **DevOps & Testing:** Docker, Docker Compose, Postman Collections & Test Runner, JUnit 5, Mockito.

---

## 📅 Lộ Trình 7 Tuần Triển Khai (30/10/2026 – 12/12/2026)

*   **Tuần 1 (30/10 – 01/11/2026):** Khởi động dự án, thành lập nhóm, phân công nhiệm vụ và nộp Báo cáo KHTH (`BC02`).
*   **Tuần 2 (02/11 – 08/11/2026):** Khảo sát chi tiết, phân tích yêu cầu (SRS), thiết kế kiến trúc Microservices và schema CSDL MySQL 8.0.
*   **Tuần 3 (09/11 – 15/11/2026):** Thiết lập nền tảng hạ tầng (Monorepo, Gateway, Identity JWT, Shell Next.js, FastAPI & ChromaDB).
*   **Tuần 4 (16/11 – 22/11/2026):** Lập trình nghiệp vụ cốt lõi (Catalog, Kho IMEI, Giỏ hàng, Đơn hàng, RAG Chatbot, UI Storefront).
*   **Tuần 5 (23/11 – 29/11/2026):** Nghiệp vụ nâng cao (Fulfillment gán IMEI khi đóng gói, VNPAY Sandbox, Backoffice Dashboard, Streaming AI).
*   **Tuần 6 (30/11 – 06/12/2026):** Tích hợp toàn hệ thống qua Gateway, Viết Unit Test JUnit 5 & Chạy Postman Collection Runner, Kiểm thử E2E.
*   **Tuần 7 (07/12 – 12/12/2026):** Đóng gói Docker Compose, hoàn thiện báo cáo BC01/BC02, soạn Slide và video demo, nghiệm thu bảo vệ.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Cục Bộ (Local Dev)

### 1. Khởi chạy hạ tầng dữ liệu (MySQL 8.0 & ChromaDB)
```bash
docker compose -f docker-compose.infra.yml up -d
```

### 2. Khởi chạy AI Service (FastAPI)
```bash
cd services/ai-service
python -m venv venv
# Kích hoạt venv (Windows: .\venv\Scripts\activate | Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --reload --port 8085
```

### 3. Khởi chạy các Spring Boot Microservices
Mở từng project trong thư mục `services/` bằng IntelliJ IDEA và khởi chạy theo thứ tự:
1. `api-gateway` (Port 8080)
2. `identity-service` (Port 8081)
3. `catalog-service` (Port 8082)
4. `inventory-service` (Port 8083)
5. `order-service` (Port 8084)

### 4. Khởi chạy Frontend Next.js
```bash
cd frontend
pnpm install
pnpm dev
```
Truy cập giao diện tại: `http://localhost:3000`

---
*© 2026 Nhóm BTL - Trường Công nghệ Thông tin & Truyền thông, Đại học Công nghiệp Hà Nội.*
