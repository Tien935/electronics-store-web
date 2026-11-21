package com.techmart.order.statemachine;

import com.techmart.order.entity.Order;
import com.techmart.order.entity.OrderStatus;
import com.techmart.order.exception.InvalidOrderStateException;
import com.techmart.order.statemachine.handler.OrderStateChangeHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

class OrderStateMachineTest {

    private OrderStateMachine stateMachine;
    private OrderStateChangeHandler mockHandler;

    @BeforeEach
    void setUp() {
        mockHandler = Mockito.mock(OrderStateChangeHandler.class);
        stateMachine = new OrderStateMachine(mockHandler);
    }

    @Test
    @DisplayName("Test chuyển đổi hợp lệ: PENDING -> CONFIRMED qua Event CONFIRM")
    void testValidTransition_PendingToConfirmed() {
        Order order = new Order();
        order.setOrderCode("ORD-TEST-001");
        order.setStatus(OrderStatus.PENDING);

        assertTrue(stateMachine.canTrigger(OrderStatus.PENDING, OrderEvent.CONFIRM));
        assertTrue(stateMachine.canTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED));

        stateMachine.sendEvent(order, OrderEvent.CONFIRM, "Nhân viên xác nhận", "STAFF_01");

        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
        verify(mockHandler).onStateChanged(eq(order), eq(OrderStatus.PENDING), eq(OrderStatus.CONFIRMED),
                eq(OrderEvent.CONFIRM), eq("Nhân viên xác nhận"), eq("STAFF_01"));
    }

    @Test
    @DisplayName("Test toàn bộ luồng thành công: PENDING -> CONFIRMED -> PROCESSING -> SHIPPING -> DELIVERED")
    void testFullHappyPath() {
        Order order = new Order();
        order.setOrderCode("ORD-TEST-002");
        order.setStatus(OrderStatus.PENDING);

        stateMachine.transitionTo(order, OrderStatus.CONFIRMED, "Duyệt đơn", "ADMIN");
        assertEquals(OrderStatus.CONFIRMED, order.getStatus());

        stateMachine.transitionTo(order, OrderStatus.PROCESSING, "Kho đóng gói máy", "KHO");
        assertEquals(OrderStatus.PROCESSING, order.getStatus());

        stateMachine.transitionTo(order, OrderStatus.SHIPPING, "Bàn giao shipper", "SHIPPER");
        assertEquals(OrderStatus.SHIPPING, order.getStatus());

        stateMachine.transitionTo(order, OrderStatus.DELIVERED, "Khách nhận máy thành công", "SHIPPER");
        assertEquals(OrderStatus.DELIVERED, order.getStatus());
    }

    @Test
    @DisplayName("Test hủy đơn hợp lệ từ PENDING, CONFIRMED, PROCESSING, SHIPPING")
    void testCancelFromAllowedStatuses() {
        for (OrderStatus st : List.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPING)) {
            Order order = new Order();
            order.setStatus(st);
            assertTrue(stateMachine.canTrigger(st, OrderEvent.CANCEL));
            stateMachine.sendEvent(order, OrderEvent.CANCEL, "Khách đổi ý", "CUSTOMER");
            assertEquals(OrderStatus.CANCELLED, order.getStatus());
        }
    }

    @Test
    @DisplayName("Test chuyển đổi không hợp lệ: DELIVERED không thể chuyển sang CANCELLED")
    void testInvalidTransition_DeliveredToCancelled() {
        Order order = new Order();
        order.setStatus(OrderStatus.DELIVERED);

        assertFalse(stateMachine.canTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED));

        InvalidOrderStateException ex = assertThrows(InvalidOrderStateException.class, () ->
                stateMachine.transitionTo(order, OrderStatus.CANCELLED, "Đòi hủy sau khi đã nhận máy", "CUSTOMER"));

        assertEquals(OrderStatus.DELIVERED, ex.getCurrentStatus());
        assertEquals(OrderStatus.CANCELLED, ex.getTargetStatus());
        assertTrue(ex.getAllowedNextStatuses().contains(OrderStatus.REFUNDED));
    }

    @Test
    @DisplayName("Test trạng thái kết thúc (Terminal): CANCELLED không thể chuyển sang bất kỳ trạng thái nào")
    void testTerminalState_Cancelled() {
        Order order = new Order();
        order.setStatus(OrderStatus.CANCELLED);

        List<OrderStatus> allowedNext = stateMachine.getAllowedNextStatuses(OrderStatus.CANCELLED);
        assertTrue(allowedNext.isEmpty(), "CANCELLED là trạng thái kết thúc, danh sách trạng thái kế tiếp phải rỗng");

        assertThrows(InvalidOrderStateException.class, () ->
                stateMachine.transitionTo(order, OrderStatus.CONFIRMED, "Khôi phục đơn", "ADMIN"));
    }

    @Test
    @DisplayName("Test chính sách đổi trả: DELIVERED có thể chuyển sang REFUNDED")
    void testRefundFromDelivered() {
        Order order = new Order();
        order.setStatus(OrderStatus.DELIVERED);

        assertTrue(stateMachine.canTrigger(OrderStatus.DELIVERED, OrderEvent.REFUND));
        stateMachine.sendEvent(order, OrderEvent.REFUND, "Máy lỗi màn hình đổi trả 30 ngày", "CUSTOMER");

        assertEquals(OrderStatus.REFUNDED, order.getStatus());
    }
}
