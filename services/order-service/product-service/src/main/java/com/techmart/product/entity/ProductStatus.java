package com.techmart.product.entity;

public enum ProductStatus {
    ACTIVE("Đang kinh doanh"),
    INACTIVE("Ngừng kinh doanh"),
    OUT_OF_STOCK("Tạm hết hàng");

    private final String description;

    ProductStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
