-- Dữ liệu mẫu đơn hàng khởi tạo ban đầu cho chuỗi bán lẻ TECH-MART
INSERT INTO orders (id, order_code, user_id, customer_name, customer_phone, customer_email, shipping_address, branch_id, branch_name, status, payment_method, payment_status, total_amount, discount_amount, final_amount, note, created_at, updated_at)
VALUES 
(1, 'ORD-20261114-001', 1, 'Nguyễn Văn An', '0912345678', 'an.nguyen@techmart.vn', '79B Kim Ngưu, Hai Bà Trưng, Hà Nội', 1, 'FPT Shop 79B Kim Ngưu', 'PENDING', 'COD', 'UNPAID', 34990000.00, 500000.00, 34490000.00, 'Giao giờ hành chính, gọi trước khi đến', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'ORD-20261114-002', 2, 'Trần Thị Bích', '0987654321', 'bich.tran@techmart.vn', 'Số 12 Cầu Giấy, Hà Nội', 2, 'TECH-MART Cầu Giấy', 'CONFIRMED', 'VNPAY', 'PAID', 28990000.00, 0.00, 28990000.00, 'Nhận tại quầy chi nhánh', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'ORD-20261114-003', 3, 'Lê Hoàng Nam', '0905123456', 'nam.le@techmart.vn', '45 Lê Duẩn, Hải Châu, Đà Nẵng', 3, 'TECH-MART Đà Nẵng', 'SHIPPING', 'MOMO', 'PAID', 41990000.00, 1000000.00, 40990000.00, 'Kiểm tra máy kỹ trước khi giao', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Chi tiết đơn hàng mẫu (kèm mã IMEI thiết bị phục vụ O2O)
INSERT INTO order_items (id, order_id, product_id, product_code, product_name, product_image, variant_name, imei, unit_price, quantity, total_price)
VALUES
(1, 1, 101, 'IP16PM-256-DT', 'iPhone 16 Pro Max 256GB', 'https://techmart.vn/img/ip16pm-desert.png', 'Desert Titanium / 256GB', '356789123456781', 34990000.00, 1, 34990000.00),
(2, 2, 102, 'SS-S24U-512-TB', 'Samsung Galaxy S24 Ultra 512GB', 'https://techmart.vn/img/s24u-gray.png', 'Titanium Black / 512GB', '358901234567892', 28990000.00, 1, 28990000.00),
(3, 3, 103, 'MBP-M3PRO-18-512', 'MacBook Pro 14 M3 Pro', 'https://techmart.vn/img/mbp14-spaceblack.png', 'Space Black / 18GB / 512GB', 'C02G1234MD6R', 41990000.00, 1, 41990000.00);

-- Lịch sử trạng thái đơn hàng mẫu
INSERT INTO order_status_history (id, order_id, previous_status, current_status, action_event, reason, changed_by, created_at)
VALUES
(1, 1, NULL, 'PENDING', 'CREATE_ORDER', 'Khách hàng tạo đơn hàng trực tuyến O2O', 'CUSTOMER', CURRENT_TIMESTAMP),
(2, 2, NULL, 'PENDING', 'CREATE_ORDER', 'Khách hàng tạo đơn hàng', 'CUSTOMER', CURRENT_TIMESTAMP),
(3, 2, 'PENDING', 'CONFIRMED', 'CONFIRM', 'Nhân viên xác nhận đơn và giữ tồn kho chi nhánh', 'STAFF_01', CURRENT_TIMESTAMP),
(4, 3, NULL, 'PENDING', 'CREATE_ORDER', 'Khách hàng tạo đơn hàng', 'CUSTOMER', CURRENT_TIMESTAMP),
(5, 3, 'PENDING', 'CONFIRMED', 'CONFIRM', 'Xác nhận thanh toán MoMo thành công', 'SYSTEM', CURRENT_TIMESTAMP),
(6, 3, 'CONFIRMED', 'PROCESSING', 'START_PROCESSING', 'Kho đóng gói và quét mã IMEI máy', 'STAFF_KHO', CURRENT_TIMESTAMP),
(7, 3, 'PROCESSING', 'SHIPPING', 'DISPATCH', 'Bàn giao cho đơn vị vận chuyển Viettel Post', 'SHIPPER_05', CURRENT_TIMESTAMP);
