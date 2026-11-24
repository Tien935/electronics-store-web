package com.jvnc.order.dto.response;

import com.jvnc.order.model.OrderStatus;
import com.jvnc.order.model.OrderStatusHistory;
import java.time.LocalDateTime;

public class OrderStatusHistoryResponse {

    private Long id;
    private Long orderId;
    private OrderStatus previousStatus;
    private String previousStatusDisplayName;
    private OrderStatus currentStatus;
    private String currentStatusDisplayName;
    private String actionEvent;
    private String reason;
    private String changedBy;
    private LocalDateTime createdAt;

    public OrderStatusHistoryResponse() {}

    public static OrderStatusHistoryResponse fromEntity(OrderStatusHistory history) {
        OrderStatusHistoryResponse dto = new OrderStatusHistoryResponse();
        dto.setId(history.getId());
        dto.setOrderId(history.getOrderId());
        dto.setPreviousStatus(history.getPreviousStatus());
        dto.setPreviousStatusDisplayName(history.getPreviousStatus() != null ? history.getPreviousStatus().getDisplayName() : "Khởi tạo");
        dto.setCurrentStatus(history.getCurrentStatus());
        dto.setCurrentStatusDisplayName(history.getCurrentStatus() != null ? history.getCurrentStatus().getDisplayName() : null);
        dto.setActionEvent(history.getActionEvent());
        dto.setReason(history.getReason());
        dto.setChangedBy(history.getChangedBy());
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public OrderStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(OrderStatus previousStatus) { this.previousStatus = previousStatus; }
    public String getPreviousStatusDisplayName() { return previousStatusDisplayName; }
    public void setPreviousStatusDisplayName(String previousStatusDisplayName) { this.previousStatusDisplayName = previousStatusDisplayName; }
    public OrderStatus getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(OrderStatus currentStatus) { this.currentStatus = currentStatus; }
    public String getCurrentStatusDisplayName() { return currentStatusDisplayName; }
    public void setCurrentStatusDisplayName(String currentStatusDisplayName) { this.currentStatusDisplayName = currentStatusDisplayName; }
    public String getActionEvent() { return actionEvent; }
    public void setActionEvent(String actionEvent) { this.actionEvent = actionEvent; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
