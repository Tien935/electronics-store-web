-- 1. BẢNG MÃ KHUYẾN MÃI / VOUCHER
CREATE TABLE IF NOT EXISTS vouchers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'PERCENTAGE', 'FIXED_AMOUNT'
    discount_value DECIMAL(15, 2) NOT NULL,
    min_order_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    max_discount_amount DECIMAL(15, 2),
    usage_limit INT NOT NULL DEFAULT 100,
    used_count INT NOT NULL DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(191),
    shipping_address VARCHAR(255) NOT NULL,
    branch_id BIGINT,
    branch_name VARCHAR(150),
    status VARCHAR(30) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    payment_status VARCHAR(30) NOT NULL,
    voucher_code VARCHAR(50),
    total_amount DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    final_amount DECIMAL(15, 2) NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. BẢNG CHI TIẾT ĐƠN HÀNG (ORDER_ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    sku VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    product_image VARCHAR(500),
    variant_name VARCHAR(150),
    imei VARCHAR(50),
    unit_price DECIMAL(15, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL,
    CONSTRAINT fk_order_items_orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 4. BẢNG AUDIT TRAIL LỊCH SỬ CHUYỂN TRẠNG THÁI (ORDER_STATUS_HISTORY)
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    previous_status VARCHAR(30),
    current_status VARCHAR(30) NOT NULL,
    action_event VARCHAR(50) NOT NULL,
    reason VARCHAR(500),
    changed_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_orders FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
