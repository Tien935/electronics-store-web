-- Schema initialization for Product Service
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(100),
    logo_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    category_id BIGINT NOT NULL,
    brand_id BIGINT NOT NULL,
    base_price DECIMAL(15, 2) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(255),
    specs_json TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES brands(id)
);

CREATE TABLE IF NOT EXISTS product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    sku VARCHAR(80) NOT NULL UNIQUE,
    variant_name VARCHAR(150) NOT NULL,
    color VARCHAR(60) NOT NULL,
    storage VARCHAR(50),
    ram VARCHAR(30),
    price DECIMAL(15, 2) NOT NULL,
    original_price DECIMAL(15, 2),
    image_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS device_imeis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    imei VARCHAR(18) NOT NULL UNIQUE,
    variant_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_STOCK',
    import_price DECIMAL(15, 2),
    warranty_months INT NOT NULL DEFAULT 12,
    import_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sold_date TIMESTAMP NULL,
    order_code VARCHAR(50),
    customer_phone VARCHAR(20),
    note VARCHAR(255),
    CONSTRAINT fk_imei_variant FOREIGN KEY (variant_id) REFERENCES product_variants(id),
    CONSTRAINT fk_imei_branch FOREIGN KEY (branch_id) REFERENCES branches(id)
);
