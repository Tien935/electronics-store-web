CREATE TABLE categories (
                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                            name VARCHAR(100) NOT NULL,
                            slug VARCHAR(120) NOT NULL UNIQUE,
                            description VARCHAR(500),
                            status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE brands (
                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        slug VARCHAR(120) NOT NULL UNIQUE,
                        logo_url VARCHAR(500),
                        status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE products (
                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                          sku VARCHAR(50) NOT NULL UNIQUE,
                          name VARCHAR(200) NOT NULL,
                          description TEXT,
                          price DECIMAL(15,2) NOT NULL,
                          image_url VARCHAR(500),
                          category_id BIGINT NOT NULL,
                          brand_id BIGINT NOT NULL,
                          status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

                          CONSTRAINT fk_products_category
                              FOREIGN KEY (category_id) REFERENCES categories(id),

                          CONSTRAINT fk_products_brand
                              FOREIGN KEY (brand_id) REFERENCES brands(id),

                          CONSTRAINT chk_products_price CHECK (price >= 0)
);