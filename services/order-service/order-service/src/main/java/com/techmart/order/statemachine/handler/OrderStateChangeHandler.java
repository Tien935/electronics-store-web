package com.techmart.order.statemachine.handler;

import com.techmart.order.entity.Order;
import com.techmart.order.entity.OrderStatus;
import com.techmart.order.statemachine.OrderEvent;

/**
 * Interface cho các Side-effect Handlers khi trạng thái đơn hàng thay đổi.
 * Tích hợp hoàn kho, cập nhật thanh toán và bảo hành IMEI.
 */
public interface OrderStateChangeHandler {

    void onStateChanged(Order order, OrderStatus fromStatus, OrderStatus toStatus,
                        OrderEvent event, String reason, String changedBy);
}
