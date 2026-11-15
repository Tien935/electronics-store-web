package com.techmart.order.service.impl;

import com.techmart.order.dto.request.CancelOrderRequest;
import com.techmart.order.dto.request.ChangeOrderStatusRequest;
import com.techmart.order.dto.request.CreateOrderRequest;
import com.techmart.order.dto.request.OrderItemRequest;
import com.techmart.order.dto.response.OrderResponse;
import com.techmart.order.dto.response.OrderStatusHistoryResponse;
import com.techmart.order.entity.Order;
import com.techmart.order.entity.OrderItem;
import com.techmart.order.entity.OrderStatus;
import com.techmart.order.entity.OrderStatusHistory;
import com.techmart.order.exception.ResourceNotFoundException;
import com.techmart.order.repository.OrderRepository;
import com.techmart.order.repository.OrderStatusHistoryRepository;
import com.techmart.order.service.OrderService;
import com.techmart.order.statemachine.OrderEvent;
import com.techmart.order.statemachine.OrderStateMachine;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * Hiện thực hóa nghiệp vụ Đơn hàng kết hợp Order State Machine và Spring Data JPA.
 */
@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final OrderStateMachine stateMachine;

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderStatusHistoryRepository historyRepository,
                            OrderStateMachine stateMachine) {
        this.orderRepository = orderRepository;
        this.historyRepository = historyRepository;
        this.stateMachine = stateMachine;
    }

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = new Order(
                request.getUserId(),
                request.getCustomerName(),
                request.getCustomerPhone(),
                request.getCustomerEmail(),
                request.getShippingAddress(),
                request.getBranchId(),
                request.getBranchName(),
                request.getPaymentMethod(),
                request.getNote()
        );

        order.setOrderCode(generateOrderCode());
        if (request.getDiscountAmount() != null) {
            order.setDiscountAmount(request.getDiscountAmount());
        }

        for (OrderItemRequest itemReq : request.getItems()) {
            OrderItem item = new OrderItem(
                    itemReq.getProductId(),
                    itemReq.getProductCode(),
                    itemReq.getProductName(),
                    itemReq.getProductImage(),
                    itemReq.getVariantName(),
                    itemReq.getImei(),
                    itemReq.getUnitPrice(),
                    itemReq.getQuantity()
            );
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);

        // Ghi Audit Trail khởi tạo
        OrderStatusHistory initialHistory = new OrderStatusHistory(
                savedOrder.getId(),
                null,
                OrderStatus.PENDING,
                "CREATE_ORDER",
                "Khách hàng đặt hàng mới qua cổng O2O",
                "USER_" + request.getUserId()
        );
        historyRepository.save(initialHistory);

        return OrderResponse.fromEntity(savedOrder, stateMachine.getAllowedNextStatuses(savedOrder.getStatus()));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = findOrder(id);
        return OrderResponse.fromEntity(order, stateMachine.getAllowedNextStatuses(order.getStatus()));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với mã: " + orderCode));
        return OrderResponse.fromEntity(order, stateMachine.getAllowedNextStatuses(order.getStatus()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(o -> OrderResponse.fromEntity(o, stateMachine.getAllowedNextStatuses(o.getStatus())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(o -> OrderResponse.fromEntity(o, stateMachine.getAllowedNextStatuses(o.getStatus())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status).stream()
                .map(o -> OrderResponse.fromEntity(o, stateMachine.getAllowedNextStatuses(o.getStatus())))
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse changeOrderStatus(Long id, ChangeOrderStatusRequest request) {
        Order order = findOrder(id);
        String changer = (request.getChangedBy() != null && !request.getChangedBy().isBlank())
                ? request.getChangedBy() : "STAFF";

        // Chuyển trạng thái thông qua State Machine Engine
        stateMachine.transitionTo(order, request.getTargetStatus(), request.getReason(), changer);

        Order updatedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(updatedOrder, stateMachine.getAllowedNextStatuses(updatedOrder.getStatus()));
    }

    @Override
    public OrderResponse cancelOrder(Long id, CancelOrderRequest request) {
        Order order = findOrder(id);
        String changer = (request.getCancelledBy() != null && !request.getCancelledBy().isBlank())
                ? request.getCancelledBy() : "CUSTOMER";

        stateMachine.sendEvent(order, OrderEvent.CANCEL, request.getReason(), changer);

        Order updatedOrder = orderRepository.save(order);
        return OrderResponse.fromEntity(updatedOrder, stateMachine.getAllowedNextStatuses(updatedOrder.getStatus()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse> getOrderHistory(Long orderId) {
        // Kiểm tra xem đơn hàng có tồn tại không
        findOrder(orderId);
        return historyRepository.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(OrderStatusHistoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatus> getAllowedNextStatuses(Long orderId) {
        Order order = findOrder(orderId);
        return stateMachine.getAllowedNextStatuses(order.getStatus());
    }

    private Order findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID: " + id));
    }

    private String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = 1000 + new Random().nextInt(9000);
        return "ORD-" + datePart + "-" + randomPart;
    }
}
