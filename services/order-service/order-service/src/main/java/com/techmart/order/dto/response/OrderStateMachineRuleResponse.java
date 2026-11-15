package com.techmart.order.dto.response;

import com.techmart.order.entity.OrderStatus;
import com.techmart.order.statemachine.OrderEvent;
import com.techmart.order.statemachine.OrderStateTransition;

public class OrderStateMachineRuleResponse {

    private OrderStatus fromStatus;
    private String fromStatusName;
    private OrderEvent event;
    private String eventDescription;
    private OrderStatus toStatus;
    private String toStatusName;
    private String description;

    public OrderStateMachineRuleResponse() {
    }

    public static OrderStateMachineRuleResponse fromTransition(OrderStateTransition t) {
        OrderStateMachineRuleResponse dto = new OrderStateMachineRuleResponse();
        dto.setFromStatus(t.getFromStatus());
        dto.setFromStatusName(t.getFromStatus().getDisplayName());
        dto.setEvent(t.getEvent());
        dto.setEventDescription(t.getEvent().getDescription());
        dto.setToStatus(t.getToStatus());
        dto.setToStatusName(t.getToStatus().getDisplayName());
        dto.setDescription(t.getDescription());
        return dto;
    }

    public OrderStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(OrderStatus fromStatus) { this.fromStatus = fromStatus; }
    public String getFromStatusName() { return fromStatusName; }
    public void setFromStatusName(String fromStatusName) { this.fromStatusName = fromStatusName; }
    public OrderEvent getEvent() { return event; }
    public void setEvent(OrderEvent event) { this.event = event; }
    public String getEventDescription() { return eventDescription; }
    public void setEventDescription(String eventDescription) { this.eventDescription = eventDescription; }
    public OrderStatus getToStatus() { return toStatus; }
    public void setToStatus(OrderStatus toStatus) { this.toStatus = toStatus; }
    public String getToStatusName() { return toStatusName; }
    public void setToStatusName(String toStatusName) { this.toStatusName = toStatusName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
