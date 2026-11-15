# BÁO CÁO KẾ HOẠCH THỰC HIỆN BÀI TẬP LỚN

**Tên Dự Án:** Xây dựng website bán đồ điện tử và quản lý bán hàng tích hợp AI theo kiến trúc Microservices sử dụng Java Spring Boot và Next.js cho chuỗi bán lẻ thiết bị di động  
**Thời gian thực hiện:** Từ 30/10/2026 đến 12/12/2026 (Tổng cộng 7 tuần)  
**Quản lý dự án (Trưởng nhóm):** [Họ và tên Trưởng nhóm] - MSV: [Mã SV Trưởng nhóm]  
**Danh sách thành viên:**
1. [Họ và tên 1] - MSV: [Mã SV 1] (Quản lý dự án / Backend Lead: API Gateway & Identity Service)
2. [Họ và tên 2] - MSV: [Mã SV 2] (Backend Developer: Catalog Service & Inventory IMEI Service)
3. [Họ và tên 3] - MSV: [Mã SV 3] (Backend Developer: Order & Payment Service)
4. [Họ và tên 4] - MSV: [Mã SV 4] (AI Engineer: FastAPI, RAG Chatbot & ChromaDB)
5. [Họ và tên 5] - MSV: [Mã SV 5] (Frontend Lead: Next.js App Router, Tailwind CSS & Shadcn/UI)

**Công cụ quản lý:** GitHub Projects (Kanban Board), GitHub Monorepo, Postman (API Collections & Test Runner), Docker / Docker Compose.

---

## Kế Hoạch Thực Hiện Tổng Thể (Từ 30/10/2026 đến 12/12/2026)

| Tuần | Thời gian | Mục tiêu chính | Công việc dự kiến |
| :---: | :---: | :--- | :--- |
| **Tuần 1** | 30/10/2026 – 01/11/2026 | **Khởi động dự án, thành lập nhóm và phân công nhiệm vụ** | - Họp nhóm thống nhất đề tài, bầu trưởng nhóm, thiết lập kênh làm việc (Zalo, GitHub/Trello).<br>- Phân định vai trò kỹ thuật: 1 FE, 3 BE, 1 AI.<br>- Xây dựng kế hoạch triển khai tổng thể và nộp Báo cáo kế hoạch thực hiện (`BC02`) vào Chủ nhật 01/11/2026. |
| **Tuần 2** | 02/11/2026 – 08/11/2026 | **Phân tích yêu cầu, khảo sát nghiệp vụ và Thiết kế kiến trúc hệ thống** | - Khảo sát chi tiết chuỗi di động: Sản phẩm đa biến thể, quản lý vòng đời IMEI và bán hàng online.<br>- Phân rã 5 Microservices + 1 AI Service; thiết kế CSDL MySQL 8.0 (4 databases logic).<br>- Thống nhất API Contracts (Swagger / Postman Mock) để FE và BE làm việc độc lập.<br>- Khởi tạo GitHub Monorepo và Wireframe giao diện. |
| **Tuần 3** | 09/11/2026 – 15/11/2026 | **Thiết lập nền tảng hạ tầng (Foundation) và Dịch vụ cơ sở** | - Dựng `docker-compose.infra.yml` (MySQL 8.0, ChromaDB).<br>- BE1: Xây dựng Spring Cloud Gateway & Identity Service (Spring Security, JWT Stateless, RBAC 3 roles).<br>- BE2 & BE3: Tạo khung project Spring Boot cho Catalog, Inventory và Order Service.<br>- AI: Dựng khung FastAPI, nạp dữ liệu thông số điện thoại mẫu vào ChromaDB.<br>- FE: Khởi tạo Next.js 14/15 App Router, cấu hình Tailwind CSS + Shadcn/UI, dựng Layout Storefront & Backoffice. |
| **Tuần 4** | 16/11/2026 – 22/11/2026 | **Lập trình nghiệp vụ cốt lõi (Core Business Services)** | - BE2: Hoàn thiện CRUD Sản phẩm, Biến thể, Thông số JSON (Catalog) và cấu trúc quản lý danh sách IMEI theo chi nhánh (Inventory).<br>- BE3: Hoàn thiện Giỏ hàng và luồng Tạo đơn hàng Online (Order Service).<br>- AI: Phát triển RAG Chatbot tư vấn cấu hình bằng Gemini API và triển khai Streaming SSE endpoint.<br>- FE: Ghép API hiển thị Trang chủ, Danh mục lọc nâng cao, Chi tiết sản phẩm đa biến thể và giỏ hàng. |
| **Tuần 5** | 23/11/2026 – 29/11/2026 | **Hoàn thiện nghiệp vụ nâng cao (Fulfillment IMEI, Thanh toán VNPAY & Tích hợp AI)** | - BE2: Viết nghiệp vụ Nhân viên kho quét/chọn mã IMEI thực tế khi đóng gói đơn hàng và tự động kích hoạt bảo hành điện tử 12 tháng khi giao thành công.<br>- BE3: Tích hợp cổng thanh toán trực tuyến Sandbox VNPAY và áp dụng mã giảm giá (Voucher).<br>- FE: Xây dựng màn hình Backoffice quản lý đơn hàng & giao diện gán IMEI; nhúng khung chat AI trực tiếp vào Storefront.<br>- AI: Tích hợp Function Calling / Tools cho Chatbot tự động tra cứu tồn kho thực tế từ Catalog/Inventory API. |
| **Tuần 6** | 30/11/2026 – 06/12/2026 | **Tích hợp toàn hệ thống qua Gateway và Kiểm thử (Integration & Testing)** | - Kết nối toàn bộ luồng Next.js -> API Gateway -> Microservices -> MySQL / AI Service.<br>- BE: Viết Unit Test (JUnit 5 + Mockito); chạy kiểm thử API tự động bằng Postman Collection Runner.<br>- FE: Tối ưu trải nghiệm (Loading skeleton, Toast thông báo, Responsive giao diện).<br>- Cả nhóm kiểm thử E2E: Mua hàng online -> Thanh toán VNPAY -> Nhân viên gán IMEI đóng hàng -> Tra cứu bảo hành điện tử theo IMEI -> Hỏi đáp trợ lý AI. |
| **Tuần 7** | 07/12/2026 – 12/12/2026 | **Đóng gói Docker Compose, Hoàn thiện Báo cáo BTL & Nghiệm thu bảo vệ** | - Đóng gói toàn bộ hệ thống vào file `docker-compose.yml` (chạy 1 lệnh duy nhất lên toàn bộ Web, Services, DB, AI).<br>- Hoàn thiện toàn bộ Báo cáo BTL (`BC01`) và Báo cáo KHTH (`BC02`).<br>- Soạn Slide thuyết trình, quay video minh chứng chạy thực tế toàn bộ hệ thống.<br>- Nộp sản phẩm và tiến hành bảo vệ trước hội đồng. |

---

## Báo Cáo Chung Toàn Quá Trình (Từ 30/10/2026 đến 12/12/2026)

| TT | Họ tên | Vai trò | Nội dung công việc chính hoàn thành | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | Quản lý dự án & Backend 1 | - Quản lý tiến độ GitHub/Jira, tổng hợp báo cáo tuần.<br>- Xây dựng API Gateway, Identity & User Service (JWT, RBAC).<br>- Viết báo cáo BC01, BC02 và đóng gói Docker Compose tổng thể. | 9.5/10 | 9.5/10 |
| 2 | [Họ và tên 2] | Backend 2 | - Xây dựng Catalog Service (Sản phẩm, biến thể, thông số JSON).<br>- Xây dựng Inventory Service (Quản lý kho đa chi nhánh, vòng đời IMEI, kích hoạt bảo hành).<br>- Viết tài liệu CSDL và Unit test/Postman cho Catalog & Inventory. | 9.0/10 | 9.0/10 |
| 3 | [Họ và tên 3] | Backend 3 | - Xây dựng Order Service (Giỏ hàng, tạo đơn hàng, quản lý trạng thái).<br>- Tích hợp cổng thanh toán VNPAY Sandbox và Service Voucher/Khuyến mãi.<br>- Viết Unit test/Postman và tài liệu luồng giao dịch đơn hàng. | 9.0/10 | 9.0/10 |
| 4 | [Họ và tên 4] | AI Engineer | - Xây dựng AI Service bằng Python FastAPI.<br>- Xây dựng mô hình RAG Chatbot tư vấn cấu hình, so sánh máy bằng Gemini API + ChromaDB.<br>- Triển khai Tool Calling kiểm tra tồn kho và phản hồi dạng Streaming SSE. | 9.5/10 | 9.0/10 |
| 5 | [Họ và tên 5] | Frontend Lead | - Khởi tạo kiến trúc Next.js App Router (Storefront + Backoffice).<br>- Thiết kế toàn bộ giao diện bằng Tailwind CSS + Shadcn/UI.<br>- Tích hợp toàn bộ REST API từ Gateway và Widget Chatbot AI. | 9.5/10 | 9.5/10 |

---

## Báo Cáo Chi Tiết Theo Tuần

### TUẦN 1 (Từ 30/10/2026 đến 01/11/2026): Khởi động dự án, thành lập nhóm & Phân công nhiệm vụ

| TT | Họ tên | Nội dung công việc | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | - Chủ trì họp nhóm thành lập dự án, thống nhất phạm vi đề tài Bán hàng online chuỗi thiết bị di động.<br>- Phân công cơ cấu nhân sự: 1 FE, 3 BE, 1 AI; thiết lập kênh liên lạc Zalo và bảng quản lý GitHub Projects.<br>- Soạn thảo khung Kế hoạch thực hiện dự án BTL và hoàn thiện báo cáo Tuần 1. | 9/10 | 9/10 |
| 2 | [Họ và tên 2] | - Khảo sát sơ bộ yêu cầu nghiệp vụ quản lý sản phẩm điện thoại đa biến thể và đặc thù quản lý kho theo mã IMEI.<br>- Thảo luận cùng nhóm về định hướng thiết kế CSDL MySQL dùng chung chia theo logical databases. | 9/10 | 9/10 |
| 3 | [Họ và tên 3] | - Tìm hiểu quy trình thương mại điện tử đặt hàng online, phương thức thanh toán VNPAY và cơ chế giữ chỗ tồn kho.<br>- Đề xuất luồng xử lý giao dịch đơn hàng qua Spring Cloud OpenFeign. | 9/10 | 9/10 |
| 4 | [Họ và tên 4] | - Nghiên cứu tính khả thi của mô hình AI tư vấn bán hàng thông minh (RAG Chatbot).<br>- Đánh giá và lựa chọn bộ công nghệ: Python FastAPI kết hợp Google Gemini API và ChromaDB. | 9/10 | 9/10 |
| 5 | [Họ và tên 5] | - Nghiên cứu kiến trúc Next.js 14/15 App Router và bộ giao diện Tailwind CSS + Shadcn/UI.<br>- Đề xuất cấu trúc phân chia Route Groups cho Storefront khách hàng và Dashboard quản trị/kho. | 9/10 | 9/10 |

**Minh chứng các hoạt động của nhóm Tuần 1:**
* *Minh chứng 1:* Biên bản họp nhóm thành lập và phân công nhiệm vụ ngày 30/10/2026 (ảnh chụp họp online hoặc biên bản có chữ ký các thành viên).
* *Minh chứng 2:* Ảnh chụp nhóm trao đổi Zalo dự án và bảng công việc GitHub Projects / Trello vừa thiết lập.
* *Minh chứng 3:* File kế hoạch BTL hoàn thiện nộp ngày Chủ nhật 01/11/2026 lên Google Drive và Zalo lớp.

---

### TUẦN 2 (Từ 02/11/2026 đến 08/11/2026): Phân tích yêu cầu & Thiết kế hệ thống

| TT | Họ tên | Nội dung công việc | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | - Khảo sát yêu cầu phi chức năng, kiến trúc Microservices và cơ chế JWT qua Gateway.<br>- Viết Chương 1 và mục 2.1 (Khảo sát sơ bộ) trong báo cáo `BC01`.<br>- Chuẩn hóa các quy ước Git (Branching, Commit message convention). | 9/10 | 9/10 |
| 2 | [Họ và tên 2] | - Thiết kế chi tiết CSDL `retail_catalog_db` và `retail_inventory_db` trên MySQL 8.0.<br>- Xây dựng bảng từ điển dữ liệu (Data Dictionary) cho sản phẩm, biến thể và vòng đời IMEI.<br>- Soạn thảo tài liệu đặc tả API cho Catalog và Inventory. | 9/10 | 9/10 |
| 3 | [Họ và tên 3] | - Thiết kế chi tiết CSDL `retail_order_db` trên MySQL 8.0 (Đơn hàng, Chi tiết đơn hàng, Voucher).<br>- Soạn thảo tài liệu đặc tả luồng giao dịch đặt hàng, giữ kho và hủy đơn.<br>- Định nghĩa API Contract cho Order Service. | 9/10 | 9/10 |
| 4 | [Họ và tên 4] | - Thu thập tập dữ liệu mẫu thông số kỹ thuật các dòng điện thoại phổ biến (Apple, Samsung, Xiaomi).<br>- Thiết kế cấu trúc tài liệu metadata và chunking văn bản phục vụ truy vấn ngữ nghĩa trong ChromaDB.<br>- Viết tài liệu thiết kế giải pháp RAG Chatbot. | 9/10 | 9/10 |
| 5 | [Họ và tên 5] | - Vẽ Wireframe/Mockup các màn hình chính trên Figma/Draw.io (Trang chủ, Chi tiết máy, Giỏ hàng, Quản trị đơn gán IMEI).<br>- Thống nhất bảng mã màu, UI Component với Shadcn/UI.<br>- Viết mục 3.4 (Mô hình hóa giao diện) trong báo cáo `BC01`. | 9/10 | 9/10 |

**Minh chứng các hoạt động của nhóm Tuần 2:**
* *Minh chứng 1:* Ảnh chụp sơ đồ kiến trúc Microservices và lược đồ quan hệ CSDL (ERD) trên MySQL Workbench.
* *Minh chứng 2:* Bộ tài liệu Mock API Contracts (Swagger / Postman Collection) thống nhất giữa BE và FE.
* *Minh chứng 3:* Ảnh chụp Wireframe/Mockup thiết kế giao diện trên Figma.

---

### TUẦN 3 (Từ 09/11/2026 đến 15/11/2026): Khởi tạo nền tảng hạ tầng & Dịch vụ cơ sở

| TT | Họ tên | Nội dung công việc | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | - Khởi tạo GitHub Monorepo, viết file `docker-compose.infra.yml` (MySQL 8.0, ChromaDB).<br>- Dựng `api-gateway` (Spring Cloud Gateway, cấu hình CORS, Routing).<br>- Hoàn thiện `identity-service` (Đăng ký, Đăng nhập, cấp phát Access/Refresh JWT, phân quyền 3 roles). | 9.5/10 | 9.5/10 |
| 2 | [Họ và tên 2] | - Khởi tạo project Spring Boot cho `catalog-service` và `inventory-service`.<br>- Cấu hình Spring Data JPA kết nối database MySQL logic tương ứng.<br>- Viết API quản lý Hãng sản xuất (Brand) và Danh mục (Category). | 8.5/10 | 8.5/10 |
| 3 | [Họ và tên 3] | - Khởi tạo project Spring Boot cho `order-service`.<br>- Cấu hình Spring Data JPA, viết entity và repository cơ bản cho Đơn hàng và Chi tiết đơn hàng.<br>- Viết khung mã nguồn xử lý trạng thái đơn hàng (Order State Machine). | 8.5/10 | 8.5/10 |
| 4 | [Họ và tên 4] | - Khởi tạo project `ai-service` bằng Python FastAPI.<br>- Viết module nhúng (Embedding) tập dữ liệu thông số điện thoại vào ChromaDB.<br>- Viết API kiểm tra kết nối với Google Gemini API và truy vấn vector cơ bản. | 9/10 | 9/10 |
| 5 | [Họ và tên 5] | - Dựng khung Next.js 14/15, cài đặt Tailwind CSS, Shadcn/UI, Lucide Icons, Axios.<br>- Xây dựng khung Layout Storefront (Header, Navbar, Footer, Floating Cart Icon).<br>- Xây dựng khung Layout Backoffice (Sidebar điều hướng, Header hiển thị thông tin nhân viên). | 9/10 | 9/10 |

**Minh chứng các hoạt động của nhóm Tuần 3:**
* *Minh chứng 1:* Ảnh chụp lịch sử Git Commit trên GitHub Monorepo của 5 thành viên.
* *Minh chứng 2:* Ảnh chụp Postman kiểm thử API Đăng nhập và trích xuất JWT Token thành công từ `identity-service`.
* *Minh chứng 3:* Ảnh chụp giao diện khung vỏ (Shell UI) của Storefront và Backoffice trên trình duyệt.

---

### TUẦN 4 (Từ 16/11/2026 đến 22/11/2026): Lập trình nghiệp vụ cốt lõi

| TT | Họ tên | Nội dung công việc | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | - Viết Gateway Global Filter xác thực JWT, trích xuất `X-User-Id` và `X-User-Role` chuyển tiếp cho các service.<br>- Cấu hình giới hạn tần suất gọi API (Rate Limiting).<br>- Hỗ trợ tích hợp FE gọi API Auth qua Gateway. | 9/10 | 9/10 |
| 2 | [Họ và tên 2] | - Hoàn thiện API Sản phẩm: Quản lý biến thể (Màu sắc, Dung lượng), lưu thông số kỹ thuật dạng JSON.<br>- Xây dựng API Quản lý danh sách mã IMEI trong `inventory-service` (trạng thái: `AVAILABLE`, `RESERVED`, `SOLD`).<br>- Viết API tra cứu tồn kho theo từng chi nhánh cửa hàng. | 9/10 | 9/10 |
| 3 | [Họ và tên 3] | - Hoàn thiện API Giỏ hàng (Redis / Database) cho khách hàng.<br>- Viết API Tạo đơn hàng Online (tính tổng tiền, áp dụng giữ chỗ số lượng tồn kho `quantity`).<br>- Viết OpenFeign Client kết nối từ `order-service` sang `catalog-service` để lấy giá máy. | 9/10 | 9/10 |
| 4 | [Họ và tên 4] | - Xây dựng luồng RAG hoàn chỉnh: Tiếp nhận câu hỏi -> Truy vấn thông số từ ChromaDB -> Prompt Engineering -> Gọi Gemini API sinh phản hồi.<br>- Triển khai endpoint Streaming phản hồi theo chuẩn Server-Sent Events (SSE). | 9.5/10 | 9.5/10 |
| 5 | [Họ và tên 5] | - Xây dựng trang Chủ (Banner, Sản phẩm hot, lọc nhanh theo giá/hãng).<br>- Xây dựng trang Danh mục sản phẩm với bộ lọc đa tiêu chí (RAM, ROM, Màn hình, Hãng).<br>- Xây dựng trang Chi tiết sản phẩm: Tự động đổi giá khi click chọn biến thể màu sắc/dung lượng. | 9.5/10 | 9/10 |

**Minh chứng các hoạt động của nhóm Tuần 4:**
* *Minh chứng 1:* Ảnh chụp Postman kiểm thử trọn bộ API Sản phẩm đa biến thể và API Giỏ hàng.
* *Minh chứng 2:* Video/GIF hoặc ảnh chụp màn hình Postman / Terminal kiểm thử Streaming SSE từ AI Service.
* *Minh chứng 3:* Ảnh chụp màn hình trang Chi tiết sản phẩm và Giỏ hàng trên giao diện Next.js đã đổ dữ liệu từ API.

---

### TUẦN 5 (Từ 23/11/2026 đến 29/11/2026): Nghiệp vụ nâng cao, Gán IMEI, Thanh toán & Tích hợp AI

| TT | Họ tên | Nội dung công việc | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | - Xây dựng tính năng Quản lý Người dùng và phân quyền chi nhánh cho Admin trong `identity-service`.<br>- Viết kịch bản kiểm thử bảo mật (Security Tests) và phân quyền RBAC qua Gateway.<br>- Soạn thảo mục 3.1 và 3.2 (Đặc tả Use Case) trong báo cáo `BC01`. | 9/10 | 9/10 |
| 2 | [Họ và tên 2] | - Viết API cho Nhân viên kho: Quét/chọn mã IMEI thực tế khi đóng gói đơn hàng -> chuyển IMEI sang `PACKED`.<br>- Viết API cập nhật `SOLD` khi giao hàng thành công và tự động kích hoạt bảo hành điện tử 12 tháng.<br>- Viết API cho phép khách hàng tra cứu thông tin bảo hành điện tử theo số IMEI. | 9.5/10 | 9.5/10 |
| 3 | [Họ và tên 3] | - Tích hợp cổng thanh toán Sandbox VNPAY (sinh URL thanh toán, xử lý VNPAY IPN Callback và Return URL).<br>- Xây dựng Service Voucher / Mã giảm giá (kiểm tra điều kiện đơn hàng, trừ số lượng mã).<br>- Xử lý luồng hủy đơn hàng và hoàn trả số lượng kho. | 9.5/10 | 9.5/10 |
| 4 | [Họ và tên 4] | - Phát triển Function Calling / Tool Calling: Cho phép Chatbot AI tự động gọi API Catalog & Inventory để kiểm tra máy còn hàng ở chi nhánh nào trong chuỗi.<br>- Tối ưu hóa prompt để câu trả lời ngắn gọn, chuyên nghiệp, kèm thẻ sản phẩm gợi ý. | 9/10 | 9/10 |
| 5 | [Họ và tên 5] | - Xây dựng màn hình Backoffice Đơn hàng: Cho phép nhân viên chọn mã IMEI thực tế từ kho để gán vào đơn đóng gói.<br>- Xây dựng trang Tra cứu bảo hành điện tử theo IMEI.<br>- Tích hợp Widget Chatbot AI góc màn hình với hiệu ứng chữ chạy thời gian thực (Streaming SSE). | 9.5/10 | 9.5/10 |

**Minh chứng các hoạt động của nhóm Tuần 5:**
* *Minh chứng 1:* Ảnh chụp màn hình giao dịch chuyển tiền thử nghiệm thành công qua cổng thanh toán VNPAY Sandbox.
* *Minh chứng 2:* Ảnh chụp màn hình giao diện Nhân viên kho chọn/gán mã IMEI thực tế vào đơn hàng.
* *Minh chứng 3:* Ảnh chụp màn hình Widget Chatbot AI trên Next.js tư vấn cấu hình và đưa ra link sản phẩm trực tiếp.

---

### TUẦN 6 (Từ 30/11/2026 đến 06/12/2026): Tích hợp toàn hệ thống & Kiểm thử

| TT | Họ tên | Nội dung công việc | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | - Viết các Unit Test (JUnit 5 + Mockito) cho Gateway và Identity Service.<br>- Lập Postman Collection hoàn chỉnh cho toàn bộ hệ sinh thái Microservices.<br>- Kiểm tra và tối ưu hiệu năng gọi liên dịch vụ qua OpenFeign (Circuit Breaker). | 9/10 | 9/10 |
| 2 | [Họ và tên 2] | - Viết Unit Test cho Catalog & Inventory Service.<br>- Kiểm thử kịch bản chống bán vượt tồn kho (Overselling) và xử lý tranh chấp mã IMEI.<br>- Lập bảng từ điển dữ liệu và mô hình vật lý CSDL cho mục 3.5 của báo cáo `BC01`. | 9/10 | 9/10 |
| 3 | [Họ và tên 3] | - Viết Unit Test cho Order & Payment Service.<br>- Kiểm thử toàn diện các trường hợp: Thanh toán thành công, Hủy thanh toán, Đặt hàng khi hết mã giảm giá.<br>- Viết các biểu đồ trình tự (Sequence Diagrams) cho mục 3.3 báo cáo `BC01`. | 9/10 | 9/10 |
| 4 | [Họ và tên 4] | - Kiểm thử độ chính xác của RAG Chatbot với 50 câu hỏi thử nghiệm (về ngân sách, cấu hình, so sánh, tồn kho).<br>- Đo lường thời gian phản hồi (Latency) và xử lý ngoại lệ khi mất mạng hoặc API bên ngoài bị lỗi.<br>- Viết phần tài liệu kỹ thuật về mô hình AI cho báo cáo. | 9/10 | 9/10 |
| 5 | [Họ và tên 5] | - Rà soát toàn bộ giao diện Next.js, khắc phục lỗi hiển thị trên thiết bị di động (Responsive UI).<br>- Thêm hiệu ứng Skeleton Loading, Modal xác nhận hủy đơn, Toast thông báo trạng thái.<br>- Cùng cả nhóm chạy kiểm thử luồng End-to-End từ mua hàng đến gán IMEI và tra cứu bảo hành. | 9.5/10 | 9.5/10 |

**Minh chứng các hoạt động của nhóm Tuần 6:**
* *Minh chứng 1:* Ảnh chụp kết quả chạy Postman Collection Runner (100% Tests Passed) với đầy đủ mã phản hồi 200/201.
* *Minh chứng 2:* Ảnh chụp bảng kết quả chạy JUnit 5 Test Coverage trên IntelliJ IDEA.
* *Minh chứng 3:* Biên bản kiểm thử tích hợp toàn bộ luồng nghiệp vụ với các kịch bản thành công và ngoại lệ.

---

### TUẦN 7 (Từ 07/12/2026 đến 12/12/2026): Đóng gói Docker, Hoàn thiện Báo cáo & Bảo vệ đề tài

| TT | Họ tên | Nội dung công việc | Tự đánh giá | Đánh giá của nhóm |
| :---: | :--- | :--- | :---: | :---: |
| 1 | [Họ và tên 1] | - Viết file `docker-compose.yml` tổng thể đóng gói toàn bộ hệ thống (chạy một lệnh `docker compose up -d`).<br>- Tổng hợp và rà soát toàn bộ nội dung Báo cáo BTL (`BC01`) và Báo cáo KHTH (`BC02`).<br>- Thiết kế Slide thuyết trình bảo vệ đề tài. | 10/10 | 10/10 |
| 2 | [Họ và tên 2] | - Rà soát tính toàn vẹn dữ liệu mẫu (Data Seeding) trong MySQL: tạo sẵn 10 điện thoại mẫu, 3 chi nhánh, 50 mã IMEI.<br>- Hoàn thiện các biểu đồ lớp phân tích (Analysis Class Diagrams) trong báo cáo `BC01`.<br>- Chuẩn bị kịch bản demo tính năng quản lý kho và gán IMEI. | 9.5/10 | 9.5/10 |
| 3 | [Họ và tên 3] | - Kiểm tra tài khoản Sandbox VNPAY, chuẩn bị dữ liệu mẫu cho các đơn hàng ở các trạng thái khác nhau.<br>- Hoàn thiện mục Kịch bản kiểm thử (Test Scenarios) trong Chương 4 của báo cáo `BC01`.<br>- Chuẩn bị kịch bản demo luồng đặt hàng và thanh toán trực tuyến. | 9.5/10 | 9.5/10 |
| 4 | [Họ và tên 4] | - Chuẩn bị sẵn bộ câu hỏi demo tương tác trực tiếp với Chatbot AI (so sánh máy, hỏi máy theo giá, kiểm tra kho).<br>- Tối ưu hóa file Dockerfile cho `ai-service` để khởi động nhanh.<br>- Chuẩn bị phần trình bày kỹ thuật AI trong Slide. | 9.5/10 | 9.5/10 |
| 5 | [Họ và tên 5] | - Tối ưu build Next.js (Standalone build), kiểm tra hiệu năng trang web.<br>- Quay video minh chứng chạy demo toàn bộ hệ thống (dài 5-7 phút) làm tài liệu nộp kèm.<br>- Hỗ trợ nhóm trưởng hoàn thiện hình ảnh minh họa giao diện cho báo cáo `BC01`. | 10/10 | 9.5/10 |

**Minh chứng các hoạt động của nhóm Tuần 7:**
* *Minh chứng 1:* Ảnh chụp Terminal chạy lệnh `docker compose up -d` thành công tất cả các container.
* *Minh chứng 2:* File tài liệu hoàn chỉnh `BC01_Nxx_Bao cao BTL.docx` và `Nxx_bao cao KHTH.docx`.
* *Minh chứng 3:* Slide thuyết trình PowerPoint và link video demo toàn bộ hệ thống đã tải lên Google Drive.

---

### LƯU Ý QUAN TRỌNG KHI NỘP BÁO CÁO:
1. **Quy ước đặt tên file:** File kế hoạch và báo cáo tiến độ phải được lưu đúng định dạng:  
   `<Nhóm số>_bao cao KHTH.docx` (Ví dụ: `N05_bao cao KHTH.docx`).
2. **Kênh và Thời hạn nộp:**  
   Báo cáo tiến độ thực hiện và minh chứng tương ứng của từng tuần **phải được gửi vào Chủ nhật hàng tuần** vào cả **Google Drive do Giảng viên chỉ định** và **nhóm Zalo** của lớp học phần.
