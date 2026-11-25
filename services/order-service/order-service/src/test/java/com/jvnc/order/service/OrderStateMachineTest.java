package com.jvnc.order.service;

import com.jvnc.order.dao.OrderStatusHistoryDao;
import com.jvnc.order.exception.InvalidOrderStateException;
import com.jvnc.order.model.Order;
import com.jvnc.order.model.OrderEvent;
import com.jvnc.order.model.OrderStatus;
import com.jvnc.order.service.impl.OrderStateMachineImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class OrderStateMachineTest {

    @Mock
    private OrderStatusHistoryDao historyDao;

    @Mock
    private OrderStateChangeHandler stateChangeHandler;

    @InjectMocks
    private OrderStateMachineImpl stateMachine;

    private Order testOrder;

    @BeforeEach
    void setUp() {
        testOrder = new Order();
        testOrder.setId(100L);
        testOrder.setOrderCode("ORD-SM-TEST");
        testOrder.setStatus(OrderStatus.PENDING);
    }

    @Test
    @DisplayName("PENDING chỉ được phép chuyển sang CONFIRMED hoặc CANCELLED")
    void testAllowedNextStatuses_FromPending() {
        List<OrderStatus> allowed = stateMachine.getAllowedNextStatuses(OrderStatus.PENDING);
        assertEquals(2, allowed.size());
        assertTrue(allowed.contains(OrderStatus.CONFIRMED));
        assertTrue(allowed.contains(OrderStatus.CANCELLED));
    }

    @Test
    @DisplayName("Chuyển trạng thái hợp lệ: PENDING -> CONFIRMED")
    void testValidTransition_PendingToConfirmed() {
        assertTrue(stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED));
        stateMachine.transitionTo(testOrder, OrderStatus.CONFIRMED, "Nhân viên xác nhận", "STAFF_01");
        assertEquals(OrderStatus.CONFIRMED, testOrder.getStatus());
    }

    @Test
    @DisplayName("Chuyển trạng thái hợp lệ: CONFIRMED -> PROCESSING")
    void testValidTransition_ConfirmedToProcessing() {
        testOrder.setStatus(OrderStatus.CONFIRMED);
        assertTrue(stateMachine.canTransition(OrderStatus.CONFIRMED, OrderStatus.PROCESSING));
        stateMachine.transitionTo(testOrder, OrderStatus.PROCESSING, "Bắt đầu đóng gói", "STAFF_KHO");
        assertEquals(OrderStatus.PROCESSING, testOrder.getStatus());
    }

    @Test
    @DisplayName("Chuyển trạng thái hợp lệ: PROCESSING -> SHIPPING")
    void testValidTransition_ProcessingToShipping() {
        testOrder.setStatus(OrderStatus.PROCESSING);
        assertTrue(stateMachine.canTransition(OrderStatus.PROCESSING, OrderStatus.SHIPPING));
        stateMachine.transitionTo(testOrder, OrderStatus.SHIPPING, "Bàn giao vận chuyển", "STAFF_KHO");
        assertEquals(OrderStatus.SHIPPING, testOrder.getStatus());
    }

    @Test
    @DisplayName("Chặn vi phạm: Không được nhảy cóc PENDING sang DELIVERED (ném InvalidOrderStateException)")
    void testInvalidTransition_PendingToDelivered_ThrowsException() {
        assertFalse(stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.DELIVERED));
        assertThrows(InvalidOrderStateException.class, () ->
                stateMachine.transitionTo(testOrder, OrderStatus.DELIVERED, "Nhảy cóc", "USER"));
    }

    @Test
    @DisplayName("Chặn vi phạm: Không được phép hủy đơn hàng khi đã DELIVERED")
    void testInvalidTransition_DeliveredToCancelled_ThrowsException() {
        testOrder.setStatus(OrderStatus.DELIVERED);
        assertFalse(stateMachine.canTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED));
        assertThrows(InvalidOrderStateException.class, () ->
                stateMachine.transitionTo(testOrder, OrderStatus.CANCELLED, "Cố tình hủy", "USER"));
    }
}
