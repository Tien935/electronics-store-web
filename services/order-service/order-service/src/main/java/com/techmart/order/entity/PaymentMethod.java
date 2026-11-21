package com.techmart.order.entity;

public enum PaymentMethod {
    COD("Thanh toán tiền mặt khi nhận hàng (COD)"),
    VNPAY("Thanh toán qua cổng VNPAY (QR / Thẻ ATM / Visa)"),
    MOMO("Thanh toán qua Ví điện tử MoMo"),
    BANK_TRANSFER("Chuyển khoản trực tiếp ngân hàng");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
