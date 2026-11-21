package com.techmart.order.entity;

/**
 * Trạng thái của đơn hàng trong vòng đời e-commerce.
 * Quản lý bởi OrderStateMachine.
 */
public enum OrderStatus {
    PENDING("Chờ xác nhận", "Đơn hàng mới tạo, đang chờ xác nhận thông tin hoặc thanh toán", false),
    CONFIRMED("Đã xác nhận", "Đơn hàng đã được duyệt, hệ thống giữ tồn kho cho đơn", false),
    PROCESSING("Đang xử lý / Đóng gói", "Chi nhánh chuẩn bị thiết bị, kiểm tra và dán mã IMEI", false),
    SHIPPING("Đang giao hàng", "Đơn hàng đã bàn giao cho đơn vị vận chuyển", false),
    DELIVERED("Giao thành công", "Khách hàng đã nhận máy, kích hoạt bảo hành điện tử chính hãng", true),
    CANCELLED("Đã hủy", "Đơn hàng bị hủy trước khi giao, hoàn lại tồn kho chi nhánh", true),
    REFUNDED("Đã hoàn tiền / Đổi trả", "Khách đổi trả máy trong 30 ngày theo chính sách O2O", true);

    private final String displayName;
    private final String description;
    private final boolean terminal;

    OrderStatus(String displayName, String description, boolean terminal) {
        this.displayName = displayName;
        this.description = description;
        this.terminal = terminal;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean isTerminal() {
        return terminal;
    }
}
