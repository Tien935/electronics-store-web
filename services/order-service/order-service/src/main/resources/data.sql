-- =========================================================================
-- DỮ LIỆU MẪU MÃ KHUYẾN MÃI (VOUCHERS)
-- =========================================================================
MERGE INTO vouchers (id, code, title, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, start_date, end_date, status, created_at) KEY(id) VALUES
(1, 'CHAOBANMOI', 'Mã Chào Bạn Mới Giảm 500K', 'FIXED_AMOUNT', 500000.00, 10000000.00, NULL, 500, 12, CURRENT_TIMESTAMP, DATEADD('DAY', 60, CURRENT_TIMESTAMP), 'ACTIVE', CURRENT_TIMESTAMP),
(2, 'GIAM10', 'Giảm 10% Tối Đa 1 Triệu', 'PERCENTAGE', 10.00, 5000000.00, 1000000.00, 200, 45, CURRENT_TIMESTAMP, DATEADD('DAY', 30, CURRENT_TIMESTAMP), 'ACTIVE', CURRENT_TIMESTAMP),
(3, 'TECHMART1TR', 'Khuyến Mãi Flagship Giảm 1 Triệu', 'FIXED_AMOUNT', 1000000.00, 25000000.00, NULL, 100, 5, CURRENT_TIMESTAMP, DATEADD('DAY', 45, CURRENT_TIMESTAMP), 'ACTIVE', CURRENT_TIMESTAMP),
(4, 'IPHONE16', 'Ưu Đãi Đặc Quyền Mua iPhone 16 Series Giảm 800K', 'FIXED_AMOUNT', 800000.00, 20000000.00, NULL, 300, 18, CURRENT_TIMESTAMP, DATEADD('DAY', 90, CURRENT_TIMESTAMP), 'ACTIVE', CURRENT_TIMESTAMP);

-- =========================================================================
-- DỮ LIỆU MẪU ĐƠN HÀNG (ORDERS)
-- =========================================================================
MERGE INTO orders (id, order_code, user_id, customer_name, customer_phone, customer_email, shipping_address, branch_id, branch_name, status, payment_method, payment_status, voucher_code, total_amount, discount_amount, final_amount, note, created_at, updated_at) KEY(id) VALUES
(1, 'ORD-20261114-001', 1, 'Đỗ Đức Tiền', '0987654321', 'tien.do@techmart.vn', '79B Kim Ngưu, Thanh Lương, Hai Bà Trưng, Hà Nội', 1, 'FPT Shop 79B Kim Ngưu', 'DELIVERED', 'COD', 'PAID', 'GIAM10', 34990000.00, 1000000.00, 33990000.00, 'Giao giờ hành chính, gọi trước khi giao', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'ORD-20261114-002', 2, 'Cao Đình Long', '0912345678', 'long.cao@techmart.vn', '216 Thái Hà, Đống Đa, Hà Nội', 2, 'FPT Shop 216 Thái Hà', 'CONFIRMED', 'VNPAY', 'PAID', 'CHAOBANMOI', 29990000.00, 500000.00, 29490000.00, 'Khách đến nhận máy trực tiếp tại quầy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'ORD-20261114-003', 3, 'Võ Xuân Quang', '0977889900', 'quang.vo@techmart.vn', '378 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội', 3, 'FPT Shop 378 Cầu Giấy', 'PENDING', 'COD', 'UNPAID', NULL, 27990000.00, 0.00, 27990000.00, 'Đơn hàng mới tạo, đang chờ xác nhận', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =========================================================================
-- DỮ LIỆU MẪU CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS - Khớp SKU từ Catalog)
-- =========================================================================
MERGE INTO order_items (id, order_id, product_id, sku, product_name, product_image, variant_name, imei, unit_price, quantity, total_price) KEY(id) VALUES
(1, 1, 1, 'IP16PM-256-DESERT', 'iPhone 16 Pro Max', 'https://techmart.vn/img/ip16pm-desert.png', 'Desert Titanium / 256GB', '356789123456785', 34990000.00, 1, 34990000.00),
(2, 2, 2, 'SS-S24U-256-GRAY', 'Samsung Galaxy S24 Ultra', 'https://techmart.vn/img/s24u-gray.png', 'Titanium Gray / 256GB', '864201234567893', 29990000.00, 1, 29990000.00),
(3, 3, 3, 'MI-14U-512-WHITE', 'Xiaomi 14 Ultra', 'https://techmart.vn/img/mi14u-white.png', 'White Vegan Leather / 512GB', '861357924681351', 27990000.00, 1, 27990000.00);

-- =========================================================================
-- DỮ LIỆU MẪU AUDIT TRAIL LỊCH SỬ CHUYỂN TRẠNG THÁI
-- =========================================================================
MERGE INTO order_status_history (id, order_id, previous_status, current_status, action_event, reason, changed_by, created_at) KEY(id) VALUES
(1, 1, NULL, 'PENDING', 'CREATE_ORDER', 'Khởi tạo đơn hàng online thành công', 'CUSTOMER', CURRENT_TIMESTAMP),
(2, 1, 'PENDING', 'CONFIRMED', 'CONFIRM', 'Nhân viên trực tổng đài gọi xác nhận và giữ hàng tồn kho chi nhánh', 'STAFF_TIEN', CURRENT_TIMESTAMP),
(3, 1, 'CONFIRMED', 'PROCESSING', 'START_PROCESSING', 'Kho đóng gói sản phẩm và quét dán tem IMEI thiết bị', 'STAFF_KHO', CURRENT_TIMESTAMP),
(4, 1, 'PROCESSING', 'SHIPPING', 'DISPATCH', 'Bàn giao kiện hàng cho đơn vị vận chuyển Viettel Post', 'SHIPPER', CURRENT_TIMESTAMP),
(5, 1, 'SHIPPING', 'DELIVERED', 'DELIVER', 'Khách đã nhận máy và thanh toán tiền COD thành công, kích hoạt bảo hành điện tử', 'SHIPPER', CURRENT_TIMESTAMP),
(6, 2, NULL, 'PENDING', 'CREATE_ORDER', 'Khởi tạo đơn hàng và thanh toán qua cổng VNPAY Sandbox', 'CUSTOMER', CURRENT_TIMESTAMP),
(7, 2, 'PENDING', 'CONFIRMED', 'CONFIRM', 'Thanh toán thành công, hệ thống tự động xác nhận đơn hàng', 'SYSTEM_VNPAY', CURRENT_TIMESTAMP),
(8, 3, NULL, 'PENDING', 'CREATE_ORDER', 'Khởi tạo đơn hàng COD chờ xác nhận', 'CUSTOMER', CURRENT_TIMESTAMP);
