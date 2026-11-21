package com.techmart.order.service;

import com.techmart.order.dto.request.CancelOrderRequest;
import com.techmart.order.dto.request.ChangeOrderStatusRequest;
import com.techmart.order.dto.request.CreateOrderRequest;
import com.techmart.order.dto.response.OrderResponse;
import com.techmart.order.dto.response.OrderStatusHistoryResponse;
import com.techmart.order.entity.OrderStatus;

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
