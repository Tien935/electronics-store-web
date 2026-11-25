package com.jvnc.order.service;

import com.jvnc.order.dao.OrderDao;
import com.jvnc.order.dao.OrderStatusHistoryDao;
import com.jvnc.order.dto.request.CancelOrderRequest;
import com.jvnc.order.dto.request.ChangeOrderStatusRequest;
import com.jvnc.order.dto.request.CreateOrderRequest;
import com.jvnc.order.dto.response.OrderResponse;
import com.jvnc.order.model.Order;
import com.jvnc.order.model.OrderEvent;
import com.jvnc.order.model.OrderStatus;
import com.jvnc.order.model.PaymentMethod;
import com.jvnc.order.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderDao orderDao;

    @Mock
    private OrderStatusHistoryDao historyDao;

    @Mock
    private OrderStateMachine stateMachine;

    @Mock
    private VoucherService voucherService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Order sampleOrder;

    @BeforeEach
    void setUp() {
        sampleOrder = new Order();
        sampleOrder.setId(1L);
        sampleOrder.setOrderCode("ORD-TEST");
        sampleOrder.setUserId(1L);
        sampleOrder.setCustomerName("Nguyễn Văn An");
        sampleOrder.setCustomerPhone("0987654321");
        sampleOrder.setShippingAddress("Hà Nội");
        sampleOrder.setStatus(OrderStatus.PENDING);
        sampleOrder.setPaymentMethod(PaymentMethod.COD);
        sampleOrder.setTotalAmount(new BigDecimal("34990000"));
        sampleOrder.setFinalAmount(new BigDecimal("34490000"));
    }

    @Test
    @DisplayName("Tạo đơn hàng mới thành công với trạng thái khởi tạo PENDING")
    void testCreateOrder_Success() {
        CreateOrderRequest request = new CreateOrderRequest();
        request.setUserId(1L);
        request.setCustomerName("Nguyễn Văn An");
        request.setCustomerPhone("0987654321");
        request.setShippingAddress("Hà Nội");
        request.setPaymentMethod(PaymentMethod.COD);

        when(orderDao.save(any(Order.class))).thenReturn(sampleOrder);

        OrderResponse response = orderService.createOrder(request);

        assertNotNull(response);
        assertEquals(OrderStatus.PENDING, response.getStatus());
        assertEquals("ORD-TEST", response.getOrderCode());
        verify(orderDao, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Chuyển trạng thái đơn hàng hợp lệ PENDING sang CONFIRMED")
    void testChangeOrderStatus_ValidTransition() {
        when(orderDao.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderDao.save(any(Order.class))).thenReturn(sampleOrder);

        ChangeOrderStatusRequest request = new ChangeOrderStatusRequest();
        request.setTargetStatus(OrderStatus.CONFIRMED);
        request.setReason("Nhân viên xác nhận đơn");
        request.setChangedBy("STAFF_01");

        doAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setStatus(OrderStatus.CONFIRMED);
            return null;
        }).when(stateMachine).transitionTo(any(Order.class), eq(OrderStatus.CONFIRMED), anyString(), anyString());

        OrderResponse response = orderService.changeOrderStatus(1L, request);

        assertNotNull(response);
        assertEquals(OrderStatus.CONFIRMED, response.getStatus());
        verify(stateMachine, times(1)).transitionTo(any(Order.class), eq(OrderStatus.CONFIRMED), anyString(), anyString());
    }

    @Test
    @DisplayName("Hủy đơn hàng thành công")
    void testCancelOrder_Success() {
        sampleOrder.setStatus(OrderStatus.CONFIRMED);
        when(orderDao.findById(1L)).thenReturn(Optional.of(sampleOrder));
        when(orderDao.save(any(Order.class))).thenReturn(sampleOrder);

        CancelOrderRequest request = new CancelOrderRequest();
        request.setReason("Khách hủy đơn");
        request.setCancelledBy("CUSTOMER");

        doAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setStatus(OrderStatus.CANCELLED);
            return null;
        }).when(stateMachine).sendEvent(any(Order.class), eq(OrderEvent.CANCEL), anyString(), anyString());

        OrderResponse response = orderService.cancelOrder(1L, request);

        assertNotNull(response);
        assertEquals(OrderStatus.CANCELLED, response.getStatus());
        verify(stateMachine, times(1)).sendEvent(any(Order.class), eq(OrderEvent.CANCEL), anyString(), anyString());
    }
}
