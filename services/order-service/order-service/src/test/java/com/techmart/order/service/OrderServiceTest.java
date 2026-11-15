package com.techmart.order.service;

import com.techmart.order.dto.request.CancelOrderRequest;
import com.techmart.order.dto.request.ChangeOrderStatusRequest;
import com.techmart.order.dto.request.CreateOrderRequest;
import com.techmart.order.dto.request.OrderItemRequest;
import com.techmart.order.dto.response.OrderResponse;
import com.techmart.order.entity.Order;
import com.techmart.order.entity.OrderStatus;
import com.techmart.order.entity.PaymentMethod;
import com.techmart.order.entity.PaymentStatus;
import com.techmart.order.repository.OrderRepository;
import com.techmart.order.repository.OrderStatusHistoryRepository;
import com.techmart.order.service.impl.OrderServiceImpl;
import com.techmart.order.statemachine.OrderEvent;
import com.techmart.order.statemachine.OrderStateMachine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderStatusHistoryRepository historyRepository;

    @Mock
    private OrderStateMachine stateMachine;

    @InjectMocks
    private OrderServiceImpl orderService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    @DisplayName("Test tạo đơn hàng thành công")
    void testCreateOrder_Success() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(1L);
        request.setCustomerName("Nguyễn Văn An");
        request.setCustomerPhone("0912345678");
        request.setShippingAddress("79B Kim Ngưu, Hà Nội");
        request.setPaymentMethod(PaymentMethod.COD);

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(101L);
        item.setProductCode("IP16PM");
        item.setProductName("iPhone 16 Pro Max");
        item.setUnitPrice(new BigDecimal("34990000"));
        item.setQuantity(1);
        request.setItems(List.of(item));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(10L);
            return o;
        });

        when(stateMachine.getAllowedNextStatuses(any())).thenReturn(List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));

        OrderResponse res = orderService.createOrder(request);

        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("Nguyễn Văn An", res.getCustomerName());
        assertEquals(OrderStatus.PENDING, res.getStatus());
        assertEquals(new BigDecimal("34990000"), res.getFinalAmount());

        verify(orderRepository).save(any(Order.class));
        verify(historyRepository).save(any());
    }

    @Test
    @DisplayName("Test đổi trạng thái đơn hàng qua State Machine")
    void testChangeOrderStatus_Success() {
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderCode("ORD-TEST");
        mockOrder.setStatus(OrderStatus.PENDING);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);
        when(stateMachine.getAllowedNextStatuses(any())).thenReturn(List.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED));

        ChangeOrderStatusRequest req = new ChangeOrderStatusRequest(OrderStatus.CONFIRMED, "Xác nhận kho", "STAFF_01");
        OrderResponse res = orderService.changeOrderStatus(1L, req);

        assertNotNull(res);
        verify(stateMachine).transitionTo(mockOrder, OrderStatus.CONFIRMED, "Xác nhận kho", "STAFF_01");
        verify(orderRepository).save(mockOrder);
    }

    @Test
    @DisplayName("Test hủy đơn hàng thành công")
    void testCancelOrder_Success() {
        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setOrderCode("ORD-TEST");
        mockOrder.setStatus(OrderStatus.CONFIRMED);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(mockOrder);

        CancelOrderRequest req = new CancelOrderRequest("Khách hủy đơn", "CUSTOMER");
        orderService.cancelOrder(1L, req);

        verify(stateMachine).sendEvent(mockOrder, OrderEvent.CANCEL, "Khách hủy đơn", "CUSTOMER");
        verify(orderRepository).save(mockOrder);
    }
}
