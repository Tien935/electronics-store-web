package com.techmart.product.entity;

public enum ImeiStatus {
    IN_STOCK("Trong kho chi nhánh"),
    RESERVED("Đang giữ chỗ cho đơn hàng"),
    SOLD("Đã bán cho khách hàng"),
    DEFECTIVE("Máy lỗi kỹ thuật / Đổi trả"),
    TRANSIT("Đang luân chuyển kho");

    private final String description;

    ImeiStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
