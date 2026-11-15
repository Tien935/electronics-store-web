package com.techmart.order.statemachine;

import com.techmart.order.entity.Order;
import com.techmart.order.entity.OrderStatus;
import com.techmart.order.exception.InvalidOrderStateException;
import com.techmart.order.statemachine.handler.OrderStateChangeHandler;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Cốt lõi của Order State Machine:
 * Quản lý Ma trận trạng thái, kiểm duyệt tính hợp lệ (Guard Rules),
 * ngăn chặn chuyển đổi trái phép và kích hoạt State Change Handlers.
 */
@Component
public class OrderStateMachine {

    private final List<OrderStateTransition> transitions = new ArrayList<>();
    private final OrderStateChangeHandler stateChangeHandler;

    public OrderStateMachine(OrderStateChangeHandler stateChangeHandler) {
        this.stateChangeHandler = stateChangeHandler;
        initTransitions();
    }

    /**
     * Khởi tạo Ma trận chuyển đổi trạng thái hợp lệ của Đơn hàng:
     * PENDING    --(CONFIRM)----------> CONFIRMED
     * PENDING    --(CANCEL)-----------> CANCELLED
     * CONFIRMED  --(START_PROCESSING)-> PROCESSING
     * CONFIRMED  --(CANCEL)-----------> CANCELLED
     * PROCESSING --(DISPATCH)---------> SHIPPING
     * PROCESSING --(CANCEL)-----------> CANCELLED
     * SHIPPING   --(DELIVER)----------> DELIVERED
     * SHIPPING   --(CANCEL)-----------> CANCELLED (Giao thất bại / hoàn hàng)
     * DELIVERED  --(REFUND)-----------> REFUNDED   (Đổi trả bảo hành trong 30 ngày)
     */
    private void initTransitions() {
        // Từ PENDING
        addRule(OrderStatus.PENDING, OrderEvent.CONFIRM, OrderStatus.CONFIRMED, "Xác nhận đơn hàng và giữ hàng tồn kho");
        addRule(OrderStatus.PENDING, OrderEvent.CANCEL, OrderStatus.CANCELLED, "Hủy đơn hàng khi chưa xác nhận");

        // Từ CONFIRMED
        addRule(OrderStatus.CONFIRMED, OrderEvent.START_PROCESSING, OrderStatus.PROCESSING, "Kho bắt đầu đóng gói và quét mã IMEI");
        addRule(OrderStatus.CONFIRMED, OrderEvent.CANCEL, OrderStatus.CANCELLED, "Hủy đơn hàng đã xác nhận, hoàn lại tồn kho");

        // Từ PROCESSING
        addRule(OrderStatus.PROCESSING, OrderEvent.DISPATCH, OrderStatus.SHIPPING, "Bàn giao đơn hàng cho đơn vị vận chuyển");
        addRule(OrderStatus.PROCESSING, OrderEvent.CANCEL, OrderStatus.CANCELLED, "Hủy đơn hàng trong quá trình đóng gói");

        // Từ SHIPPING
        addRule(OrderStatus.SHIPPING, OrderEvent.DELIVER, OrderStatus.DELIVERED, "Giao hàng thành công cho khách hàng");
        addRule(OrderStatus.SHIPPING, OrderEvent.CANCEL, OrderStatus.CANCELLED, "Giao hàng không thành công / khách từ chối nhận máy");

        // Từ DELIVERED
        addRule(OrderStatus.DELIVERED, OrderEvent.REFUND, OrderStatus.REFUNDED, "Đổi trả sản phẩm và hoàn tiền trong chính sách bảo hành");

        // CANCELLED và REFUNDED là Terminal States (Trạng thái kết thúc), không cho phép chuyển tiếp bất kỳ trạng thái nào!
    }

    private void addRule(OrderStatus from, OrderEvent event, OrderStatus to, String desc) {
        transitions.add(new OrderStateTransition(from, event, to, desc));
    }

    /**
     * Kiểm tra xem sự kiện có thể thực thi từ trạng thái hiện tại hay không.
     */
    public boolean canTrigger(OrderStatus currentStatus, OrderEvent event) {
        return transitions.stream()
                .anyMatch(t -> t.getFromStatus() == currentStatus && t.getEvent() == event);
    }

    /**
     * Kiểm tra xem có thể chuyển trực tiếp từ currentStatus sang targetStatus hay không.
     */
    public boolean canTransition(OrderStatus currentStatus, OrderStatus targetStatus) {
        if (currentStatus == targetStatus) {
            return true;
        }
        return transitions.stream()
                .anyMatch(t -> t.getFromStatus() == currentStatus && t.getToStatus() == targetStatus);
    }

    /**
     * Tìm trạng thái kế tiếp khi kích hoạt Event.
     */
    public Optional<OrderStatus> getNextStatus(OrderStatus currentStatus, OrderEvent event) {
        return transitions.stream()
                .filter(t -> t.getFromStatus() == currentStatus && t.getEvent() == event)
                .map(OrderStateTransition::getToStatus)
                .findFirst();
    }

    /**
     * Lấy danh sách các trạng thái tiếp theo hợp lệ từ trạng thái hiện tại.
     */
    public List<OrderStatus> getAllowedNextStatuses(OrderStatus currentStatus) {
        return transitions.stream()
                .filter(t -> t.getFromStatus() == currentStatus)
                .map(OrderStateTransition::getToStatus)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách các sự kiện hợp lệ có thể kích hoạt từ trạng thái hiện tại.
     */
    public List<OrderEvent> getAllowedEvents(OrderStatus currentStatus) {
        return transitions.stream()
                .filter(t -> t.getFromStatus() == currentStatus)
                .map(OrderStateTransition::getEvent)
                .distinct()
                .collect(Collectors.toList());
    }

    /**
     * Tìm Event tương ứng để chuyển từ current sang target.
     */
    public Optional<OrderEvent> findEventForTransition(OrderStatus current, OrderStatus target) {
        return transitions.stream()
                .filter(t -> t.getFromStatus() == current && t.getToStatus() == target)
                .map(OrderStateTransition::getEvent)
                .findFirst();
    }

    /**
     * Thực hiện chuyển trạng thái đơn hàng theo Event.
     * Ném InvalidOrderStateException nếu chuyển đổi không hợp lệ.
     */
    public void sendEvent(Order order, OrderEvent event, String reason, String changedBy) {
        OrderStatus current = order.getStatus();
        Optional<OrderStatus> nextOpt = getNextStatus(current, event);

        if (nextOpt.isEmpty()) {
            throw new InvalidOrderStateException(current, null, getAllowedNextStatuses(current));
        }

        OrderStatus target = nextOpt.get();
        executeTransition(order, current, target, event, reason, changedBy);
    }

    /**
     * Thực hiện chuyển trạng thái đơn hàng trực tiếp sang targetStatus (với kiểm tra quy tắc).
     */
    public void transitionTo(Order order, OrderStatus targetStatus, String reason, String changedBy) {
        OrderStatus current = order.getStatus();
        if (current == targetStatus) {
            return;
        }

        if (!canTransition(current, targetStatus)) {
            throw new InvalidOrderStateException(current, targetStatus, getAllowedNextStatuses(current));
        }

        OrderEvent event = findEventForTransition(current, targetStatus).orElse(null);
        executeTransition(order, current, targetStatus, event, reason, changedBy);
    }

    private void executeTransition(Order order, OrderStatus from, OrderStatus to,
                                   OrderEvent event, String reason, String changedBy) {
        order.setStatus(to);
        if (stateChangeHandler != null) {
            stateChangeHandler.onStateChanged(order, from, to, event, reason, changedBy);
        }
    }

    public List<OrderStateTransition> getAllTransitions() {
        return Collections.unmodifiableList(transitions);
    }
}
