package com.jvnc.order.model;

public enum OrderEvent {
    CONFIRM("Nhân viên xác nhận đơn hàng"),
    START_PROCESSING("Kho bắt đầu đóng gói và dán tem IMEI"),
    DISPATCH("Bàn giao kiện hàng cho đơn vị vận chuyển"),
    DELIVER("Giao hàng thành công đến tay khách hàng"),
    CANCEL("Hủy đơn hàng và hoàn trả tồn kho chi nhánh"),
    REFUND("Hoàn tiền đơn hàng đã thanh toán");

    private final String description;

    OrderEvent(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
