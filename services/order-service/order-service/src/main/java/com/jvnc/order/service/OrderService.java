package com.jvnc.order.service;

import com.jvnc.order.dto.request.CancelOrderRequest;
import com.jvnc.order.dto.request.ChangeOrderStatusRequest;
import com.jvnc.order.dto.request.CreateOrderRequest;
import com.jvnc.order.dto.response.OrderResponse;
import com.jvnc.order.dto.response.OrderStatusHistoryResponse;
import com.jvnc.order.model.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    OrderResponse getOrderById(Long id);

    OrderResponse getOrderByCode(String orderCode);

    List<OrderResponse> getOrdersByUserId(Long userId);

    List<OrderResponse> getAllOrders();

    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    OrderResponse changeOrderStatus(Long id, ChangeOrderStatusRequest request);

    OrderResponse cancelOrder(Long id, CancelOrderRequest request);

    List<OrderStatusHistoryResponse> getOrderHistory(Long orderId);

    List<OrderStatus> getAllowedNextStatuses(Long orderId);
}
