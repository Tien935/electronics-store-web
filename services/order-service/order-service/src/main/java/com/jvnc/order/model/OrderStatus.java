package com.jvnc.order.model;

public enum OrderStatus {
    PENDING("Chờ xác nhận"),
    CONFIRMED("Đã xác nhận"),
    PROCESSING("Đang xử lý / Đóng gói"),
    SHIPPING("Đang giao hàng"),
    DELIVERED("Giao thành công"),
    CANCELLED("Đã hủy"),
    REFUNDED("Đã hoàn tiền");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return displayName;
    }
}
