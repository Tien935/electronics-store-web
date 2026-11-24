package com.jvnc.order.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CancelOrderRequest {

    @NotBlank(message = "Lý do hủy đơn không được để trống")
    private String reason;

    @NotBlank(message = "Người hủy không được để trống")
    private String cancelledBy;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getCancelledBy() { return cancelledBy; }
    public void setCancelledBy(String cancelledBy) { this.cancelledBy = cancelledBy; }
}
