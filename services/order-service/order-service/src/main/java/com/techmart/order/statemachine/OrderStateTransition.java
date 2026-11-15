package com.techmart.order.statemachine;

import com.techmart.order.entity.OrderStatus;

import java.util.Objects;

/**
 * Định nghĩa một quy tắc chuyển trạng thái hợp lệ trong State Machine:
 * (CurrentStatus) --[Event]--> (TargetStatus)
 */
public class OrderStateTransition {

    private final OrderStatus fromStatus;
    private final OrderEvent event;
    private final OrderStatus toStatus;
    private final String description;

    public OrderStateTransition(OrderStatus fromStatus, OrderEvent event, OrderStatus toStatus, String description) {
        this.fromStatus = fromStatus;
        this.event = event;
        this.toStatus = toStatus;
        this.description = description;
    }

    public OrderStatus getFromStatus() {
        return fromStatus;
    }

    public OrderEvent getEvent() {
        return event;
    }

    public OrderStatus getToStatus() {
        return toStatus;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderStateTransition that = (OrderStateTransition) o;
        return fromStatus == that.fromStatus && event == that.event;
    }

    @Override
    public int hashCode() {
        return Objects.hash(fromStatus, event);
    }

    @Override
    public String toString() {
        return String.format("[%s] --(%s)--> [%s]", fromStatus, event, toStatus);
    }
}
