package com.jvnc.order.dto.request;

import com.jvnc.order.model.OrderStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChangeOrderStatusRequest {

    @NotNull(message = "Trạng thái đích không được để trống")
    private OrderStatus targetStatus;

    @NotBlank(message = "Lý do chuyển trạng thái không được để trống")
    private String reason;

    @NotBlank(message = "Người thực hiện không được để trống")
    private String changedBy;

    public OrderStatus getTargetStatus() { return targetStatus; }
    public void setTargetStatus(OrderStatus targetStatus) { this.targetStatus = targetStatus; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
}
