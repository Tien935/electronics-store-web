package com.techmart.order.exception;

import com.techmart.order.entity.OrderStatus;

import java.util.List;

/**
 * Ngoại lệ ném ra khi cố tình chuyển trạng thái đơn hàng trái với quy tắc Order State Machine.
 */
public class InvalidOrderStateException extends RuntimeException {

    private final OrderStatus currentStatus;
    private final OrderStatus targetStatus;
    private final List<OrderStatus> allowedNextStatuses;

    public InvalidOrderStateException(OrderStatus currentStatus, OrderStatus targetStatus, List<OrderStatus> allowedNextStatuses) {
        super(String.format("Không thể chuyển trạng thái đơn hàng từ [%s] sang [%s]. Các trạng thái hợp lệ tiếp theo: %s",
                currentStatus.getDisplayName(),
                (targetStatus != null ? targetStatus.getDisplayName() : "UNKNOWN"),
                allowedNextStatuses));
        this.currentStatus = currentStatus;
        this.targetStatus = targetStatus;
        this.allowedNextStatuses = allowedNextStatuses;
    }

    public OrderStatus getCurrentStatus() {
        return currentStatus;
    }

    public OrderStatus getTargetStatus() {
        return targetStatus;
    }

    public List<OrderStatus> getAllowedNextStatuses() {
        return allowedNextStatuses;
    }
}
