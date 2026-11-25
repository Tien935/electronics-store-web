package com.jvnc.order.service;

import com.jvnc.order.model.Order;
import com.jvnc.order.model.OrderEvent;
import com.jvnc.order.model.OrderStatus;

import java.util.List;
import java.util.Map;

public interface OrderStateMachine {

    boolean canTransition(OrderStatus currentStatus, OrderStatus targetStatus);

    List<OrderStatus> getAllowedNextStatuses(OrderStatus currentStatus);

    void transitionTo(Order order, OrderStatus targetStatus, String reason, String changedBy);

    void sendEvent(Order order, OrderEvent event, String reason, String changedBy);

    Map<OrderStatus, List<OrderStatus>> getStateMachineMatrix();
}
