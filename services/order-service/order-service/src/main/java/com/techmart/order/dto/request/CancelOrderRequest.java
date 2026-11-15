package com.techmart.order.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CancelOrderRequest {

    @NotBlank(message = "Lý do hủy đơn hàng không được để trống")
    private String reason;

    private String cancelledBy;

    public CancelOrderRequest() {
    }

    public CancelOrderRequest(String reason, String cancelledBy) {
        this.reason = reason;
        this.cancelledBy = cancelledBy;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }
}
