package com.jvnc.order.service;

import com.jvnc.order.model.Order;
import com.jvnc.order.model.OrderEvent;
import com.jvnc.order.model.OrderStatus;

public interface OrderStateChangeHandler {

    void onStateChanged(Order order, OrderStatus previousStatus, OrderStatus currentStatus,
                        OrderEvent event, String reason, String changedBy);
}
