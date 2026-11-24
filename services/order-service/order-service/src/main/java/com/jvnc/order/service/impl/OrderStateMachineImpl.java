package com.jvnc.order.service.impl;

import com.jvnc.order.dao.OrderStatusHistoryDao;
import com.jvnc.order.exception.InvalidOrderStateException;
import com.jvnc.order.model.Order;
import com.jvnc.order.model.OrderEvent;
import com.jvnc.order.model.OrderStatus;
import com.jvnc.order.model.OrderStatusHistory;
import com.jvnc.order.service.OrderStateChangeHandler;
import com.jvnc.order.service.OrderStateMachine;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class OrderStateMachineImpl implements OrderStateMachine {

    private final OrderStatusHistoryDao historyDao;
    private final OrderStateChangeHandler stateChangeHandler;

    private static final Map<OrderStatus, List<OrderStatus>> STATE_MATRIX = new EnumMap<>(OrderStatus.class);

    static {
        STATE_MATRIX.put(OrderStatus.PENDING, Arrays.asList(OrderStatus.CONFIRMED, OrderStatus.CANCELLED));
        STATE_MATRIX.put(OrderStatus.CONFIRMED, Arrays.asList(OrderStatus.PROCESSING, OrderStatus.CANCELLED));
        STATE_MATRIX.put(OrderStatus.PROCESSING, Arrays.asList(OrderStatus.SHIPPING, OrderStatus.CANCELLED));
        STATE_MATRIX.put(OrderStatus.SHIPPING, Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CANCELLED));
        STATE_MATRIX.put(OrderStatus.DELIVERED, Collections.singletonList(OrderStatus.REFUNDED));
        STATE_MATRIX.put(OrderStatus.CANCELLED, Collections.emptyList());
        STATE_MATRIX.put(OrderStatus.REFUNDED, Collections.emptyList());
    }

    public OrderStateMachineImpl(OrderStatusHistoryDao historyDao, OrderStateChangeHandler stateChangeHandler) {
        this.historyDao = historyDao;
        this.stateChangeHandler = stateChangeHandler;
    }

    @Override
    public boolean canTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == null || targetStatus == null) return false;
        List<OrderStatus> allowed = STATE_MATRIX.getOrDefault(currentStatus, Collections.emptyList());
        return allowed.contains(targetStatus);
    }

    @Override
    public List<OrderStatus> getAllowedNextStatuses(OrderStatus currentStatus) {
        if (currentStatus == null) return Collections.emptyList();
        return STATE_MATRIX.getOrDefault(currentStatus, Collections.emptyList());
    }

    @Override
    public void transitionTo(Order order, OrderStatus targetStatus, String reason, String changedBy) {
        OrderStatus current = order.getStatus();
        if (!canTransition(current, targetStatus)) {
            throw new InvalidOrderStateException(current, targetStatus, getAllowedNextStatuses(current));
        }

        OrderEvent event = deduceEvent(current, targetStatus);
        order.setStatus(targetStatus);

        OrderStatusHistory history = new OrderStatusHistory(
                order.getId(), current, targetStatus, event.name(), reason, changedBy
        );
        historyDao.save(history);

        if (stateChangeHandler != null) {
            stateChangeHandler.onStateChanged(order, current, targetStatus, event, reason, changedBy);
        }
    }

    @Override
    public void sendEvent(Order order, OrderEvent event, String reason, String changedBy) {
        OrderStatus target = deduceTargetStatus(order.getStatus(), event);
        transitionTo(order, target, reason, changedBy);
    }

    @Override
    public Map<OrderStatus, List<OrderStatus>> getStateMachineMatrix() {
        return Collections.unmodifiableMap(STATE_MATRIX);
    }

    private OrderEvent deduceEvent(OrderStatus from, OrderStatus to) {
        if (to == OrderStatus.CANCELLED) return OrderEvent.CANCEL;
        if (to == OrderStatus.REFUNDED) return OrderEvent.REFUND;
        if (from == OrderStatus.PENDING && to == OrderStatus.CONFIRMED) return OrderEvent.CONFIRM;
        if (from == OrderStatus.CONFIRMED && to == OrderStatus.PROCESSING) return OrderEvent.START_PROCESSING;
        if (from == OrderStatus.PROCESSING && to == OrderStatus.SHIPPING) return OrderEvent.DISPATCH;
        if (from == OrderStatus.SHIPPING && to == OrderStatus.DELIVERED) return OrderEvent.DELIVER;
        return OrderEvent.CONFIRM;
    }

    private OrderStatus deduceTargetStatus(OrderStatus current, OrderEvent event) {
        switch (event) {
            case CONFIRM: return OrderStatus.CONFIRMED;
            case START_PROCESSING: return OrderStatus.PROCESSING;
            case DISPATCH: return OrderStatus.SHIPPING;
            case DELIVER: return OrderStatus.DELIVERED;
            case CANCEL: return OrderStatus.CANCELLED;
            case REFUND: return OrderStatus.REFUNDED;
            default:
                throw new InvalidOrderStateException(current, null, getAllowedNextStatuses(current));
        }
    }
}
