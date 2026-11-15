package com.techmart.order.dto.request;

import com.techmart.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class ChangeOrderStatusRequest {

    @NotNull(message = "Trạng thái mới không được để trống")
    private OrderStatus targetStatus;

    private String reason;
    private String changedBy;

    public ChangeOrderStatusRequest() {
    }

    public ChangeOrderStatusRequest(OrderStatus targetStatus, String reason, String changedBy) {
        this.targetStatus = targetStatus;
        this.reason = reason;
        this.changedBy = changedBy;
    }

    public OrderStatus getTargetStatus() { return targetStatus; }
    public void setTargetStatus(OrderStatus targetStatus) { this.targetStatus = targetStatus; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
}
