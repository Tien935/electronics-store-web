-- ========================================================
-- 1. CATEGORIES (Danh mục đồ điện tử)
-- ========================================================
MERGE INTO categories (id, name, slug, description, icon_url, is_active) KEY(id) VALUES
(1, 'Điện thoại thông minh', 'dien-thoai-thong-minh', 'Smartphone chính hãng Apple, Samsung, Xiaomi...', 'https://techmart.vn/icons/phone.png', TRUE),
(2, 'Máy tính bảng (Tablet)', 'may-tinh-bang', 'iPad, Galaxy Tab, Xiaomi Pad...', 'https://techmart.vn/icons/tablet.png', TRUE),
(3, 'Đồng hồ thông minh', 'dong-ho-thong-minh', 'Apple Watch, Galaxy Watch, Garmin...', 'https://techmart.vn/icons/watch.png', TRUE),
(4, 'Phụ kiện di động', 'phu-kien-di-dong', 'Củ sạc nhanh, Cáp sạc, Tai nghe, Ốp lưng...', 'https://techmart.vn/icons/accessories.png', TRUE);

-- ========================================================
-- 2. BRANDS (Thương hiệu công nghệ)
-- ========================================================
MERGE INTO brands (id, name, code, country, logo_url, is_active) KEY(id) VALUES
(1, 'Apple', 'APPLE', 'USA', 'https://techmart.vn/brands/apple.png', TRUE),
(2, 'Samsung', 'SAMSUNG', 'South Korea', 'https://techmart.vn/brands/samsung.png', TRUE),
(3, 'Xiaomi', 'XIAOMI', 'China', 'https://techmart.vn/brands/xiaomi.png', TRUE),
(4, 'OPPO', 'OPPO', 'China', 'https://techmart.vn/brands/oppo.png', TRUE);

-- ========================================================
-- 3. BRANCHES (Hệ thống cửa hàng chuỗi bán lẻ O2O)
-- ========================================================
MERGE INTO branches (id, branch_code, name, address, phone, is_active) KEY(id) VALUES
(1, 'HN-KIMNGUU', 'FPT Shop 79B Kim Ngưu', '79B Kim Ngưu, Thanh Lương, Hai Bà Trưng, Hà Nội', '02473001234', TRUE),
(2, 'HN-THAIHA', 'FPT Shop 216 Thái Hà', '216 Thái Hà, Trung Liệt, Đống Đa, Hà Nội', '02473005678', TRUE),
(3, 'HN-CAUGIAY', 'FPT Shop 378 Cầu Giấy', '378 Cầu Giấy, Dịch Vọng, Cầu Giấy, Hà Nội', '02473009999', TRUE),
(4, 'HCM-CMT8', 'FPT Shop 149 Cách Mạng Tháng 8', '149 Cách Mạng Tháng 8, Phường 5, Quận 3, TP.HCM', '02873004321', TRUE);

-- ========================================================
-- 4. PRODUCTS & THÔNG SỐ JSON (Specs JSON chi tiết)
-- ========================================================
MERGE INTO products (id, product_code, name, slug, category_id, brand_id, base_price, description, thumbnail_url, specs_json, status, created_at, updated_at) KEY(id) VALUES
(1, 'IP16PM', 'iPhone 16 Pro Max', 'iphone-16-pro-max', 1, 1, 34990000.00, 
 'Flagship cao cấp nhất của Apple năm 2024 với viền Titan siêu mỏng, Chip A18 Pro mạnh mẽ và nút điều khiển Camera Control đột phá.', 
 'https://techmart.vn/products/ip16pm-thumb.png',
 '{"screen":"6.9 inch OLED Super Retina XDR, 120Hz ProMotion, 2000 nits","chipset":"Apple A18 Pro (3nm, 6-core GPU)","ram":"8GB","rear_camera":"48MP Fusion + 48MP Ultra-wide + 12MP Telephoto 5x","front_camera":"12MP TrueDepth","battery":"4685 mAh, Sạc nhanh MagSafe 25W","os":"iOS 18","connectivity":"5G Sub-6GHz, Wi-Fi 7, Bluetooth 5.3, USB-C 3.0 (10Gbps)","weight":"227g","water_resistance":"IP68"}', 
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(2, 'SS-S24U', 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 1, 2, 29990000.00,
 'Đỉnh cao trí tuệ nhân tạo Galaxy AI, khung viền Titan bền bỉ, màn hình phẳng chống chói 2600 nits và bút S-Pen tích hợp.',
 'https://techmart.vn/products/s24u-thumb.png',
 '{"screen":"6.8 inch Dynamic AMOLED 2X, 120Hz, QHD+, 2600 nits","chipset":"Snapdragon 8 Gen 3 for Galaxy (4nm)","ram":"12GB","rear_camera":"200MP Main + 50MP Periscope 5x + 12MP Ultra-wide + 10MP Telephoto 3x","front_camera":"12MP Dual Pixel","battery":"5000 mAh, Sạc nhanh có dây 45W","features":"Bút S-Pen tích hợp, Galaxy AI (Khoanh vùng tìm kiếm, Phiên dịch trực tiếp)","os":"Android 14, One UI 6.1","connectivity":"5G, Wi-Fi 7, Bluetooth 5.3, USB-C 3.2","weight":"232g"}',
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3, 'MI-14U', 'Xiaomi 14 Ultra', 'xiaomi-14-ultra', 1, 3, 27990000.00,
 'Chuyên gia nhiếp ảnh di động hợp tác cùng Leica, cảm biến chính 1-inch biến thiên khẩu độ và màn hình cong nhẹ WQHD+.',
 'https://techmart.vn/products/mi14u-thumb.png',
 '{"screen":"6.73 inch LTPO AMOLED, 120Hz, WQHD+, 3000 nits","chipset":"Qualcomm Snapdragon 8 Gen 3 (4nm)","ram":"16GB","rear_camera":"Hệ thống 4 camera Leica 50MP cảm biến 1-inch LYT-900","front_camera":"32MP","battery":"5000 mAh, Sạc siêu nhanh có dây 90W HyperCharge, sạc không dây 80W","os":"Xiaomi HyperOS (Android 14)","weight":"220g"}',
 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ========================================================
-- 5. PRODUCT VARIANTS (Biến thể màu sắc & dung lượng)
-- ========================================================
MERGE INTO product_variants (id, product_id, sku, variant_name, color, storage, ram, price, original_price, image_url, is_active) KEY(id) VALUES
-- iPhone 16 Pro Max variants
(101, 1, 'IP16PM-256-DESERT', 'iPhone 16 Pro Max 256GB Sa Mạc', 'Desert Titanium', '256GB', '8GB', 34990000.00, 34990000.00, 'https://techmart.vn/img/ip16pm-desert.png', TRUE),
(102, 1, 'IP16PM-512-DESERT', 'iPhone 16 Pro Max 512GB Sa Mạc', 'Desert Titanium', '512GB', '8GB', 40990000.00, 40990000.00, 'https://techmart.vn/img/ip16pm-desert.png', TRUE),
(103, 1, 'IP16PM-256-NATURAL', 'iPhone 16 Pro Max 256GB Titan Tự Nhiên', 'Natural Titanium', '256GB', '8GB', 34990000.00, 34990000.00, 'https://techmart.vn/img/ip16pm-natural.png', TRUE),
(104, 1, 'IP16PM-256-BLACK', 'iPhone 16 Pro Max 256GB Titan Đen', 'Black Titanium', '256GB', '8GB', 34990000.00, 34990000.00, 'https://techmart.vn/img/ip16pm-black.png', TRUE),

-- Samsung Galaxy S24 Ultra variants
(201, 2, 'SS-S24U-256-GRAY', 'Galaxy S24 Ultra 256GB Xám Titan', 'Titanium Gray', '256GB', '12GB', 29990000.00, 33990000.00, 'https://techmart.vn/img/s24u-gray.png', TRUE),
(202, 2, 'SS-S24U-512-GRAY', 'Galaxy S24 Ultra 512GB Xám Titan', 'Titanium Gray', '512GB', '12GB', 33990000.00, 37990000.00, 'https://techmart.vn/img/s24u-gray.png', TRUE),
(203, 2, 'SS-S24U-256-BLACK', 'Galaxy S24 Ultra 256GB Đen Titan', 'Titanium Black', '256GB', '12GB', 29990000.00, 33990000.00, 'https://techmart.vn/img/s24u-black.png', TRUE),

-- Xiaomi 14 Ultra variants
(301, 3, 'MI-14U-512-WHITE', 'Xiaomi 14 Ultra 512GB Trắng Da', 'White Vegan Leather', '512GB', '16GB', 27990000.00, 29990000.00, 'https://techmart.vn/img/mi14u-white.png', TRUE),
(302, 3, 'MI-14U-512-BLACK', 'Xiaomi 14 Ultra 512GB Đen Da', 'Black Vegan Leather', '512GB', '16GB', 27990000.00, 29990000.00, 'https://techmart.vn/img/mi14u-black.png', TRUE);

-- ========================================================
-- 6. DEVICE IMEIS (Quản lý từng thiết bị cụ thể trong kho)
-- ========================================================
MERGE INTO device_imeis (id, imei, variant_id, branch_id, status, import_price, warranty_months, import_date, sold_date, order_code, customer_phone, note) KEY(id) VALUES
-- iPhone 16 Pro Max 256GB Desert (variant 101)
(1, '356789123456781', 101, 1, 'IN_STOCK', 31500000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Lô hàng Apple VN/A nguyên seal'),
(2, '356789123456782', 101, 1, 'IN_STOCK', 31500000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Lô hàng Apple VN/A nguyên seal'),
(3, '356789123456783', 101, 2, 'IN_STOCK', 31500000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Hàng trưng bày trải nghiệm'),
(4, '356789123456784', 101, 3, 'IN_STOCK', 31500000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Kho Cầu Giấy'),
(5, '356789123456785', 101, 1, 'SOLD', 31500000.00, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'ORD-20261114-001', '0987654321', 'Đã bán cho khách Đỗ Đức Tiền'),

-- iPhone 16 Pro Max 512GB Desert (variant 102)
(6, '356789123456786', 102, 1, 'IN_STOCK', 36800000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Bản dung lượng cao 512GB'),
(7, '356789123456787', 102, 2, 'IN_STOCK', 36800000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Kho Thái Hà'),

-- Samsung S24 Ultra 256GB Gray (variant 201)
(8, '864201234567891', 201, 1, 'IN_STOCK', 26000000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Chính hãng Samsung Vina'),
(9, '864201234567892', 201, 2, 'IN_STOCK', 26000000.00, 12, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Chính hãng Samsung Vina'),
(10, '864201234567893', 201, 1, 'RESERVED', 26000000.00, 12, CURRENT_TIMESTAMP, NULL, 'ORD-20261114-002', '0912345678', 'Đang giữ hàng chờ khách qua lấy máy tại shop'),

-- Xiaomi 14 Ultra (variant 301)
(11, '861357924681351', 301, 3, 'IN_STOCK', 24500000.00, 18, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Bảo hành chính hãng Digiworld 18 tháng'),
(12, '861357924681352', 301, 4, 'IN_STOCK', 24500000.00, 18, CURRENT_TIMESTAMP, NULL, NULL, NULL, 'Chi nhánh HCM');
