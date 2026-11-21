package com.techmart.order.statemachine;

/**
 * Danh mục các Sự kiện / Hành động (Events) kích hoạt chuyển đổi trạng thái trong Order State Machine.
 */
public enum OrderEvent {
    CONFIRM("Xác nhận đơn hàng và giữ hàng tồn kho"),
    START_PROCESSING("Bắt đầu chuẩn bị hàng và dán tem IMEI"),
    DISPATCH("Bàn giao cho đơn vị vận chuyển"),
    DELIVER("Giao hàng thành công cho khách hàng"),
    CANCEL("Hủy đơn hàng và hoàn lại tồn kho"),
    REFUND("Khách trả hàng / hoàn tiền theo chính sách O2O");

    private final String description;

    OrderEvent(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
