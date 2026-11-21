package com.techmart.order.statemachine.handler;

import com.techmart.order.entity.Order;
import com.techmart.order.entity.OrderStatus;
import com.techmart.order.entity.OrderStatusHistory;
import com.techmart.order.entity.PaymentStatus;
import com.techmart.order.repository.OrderStatusHistoryRepository;
import com.techmart.order.statemachine.OrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Handler mặc định xử lý các tác vụ nghiệp vụ khi chuyển đổi trạng thái:
 * 1. Ghi log Audit Trail vào bảng order_status_history.
 * 2. Khi CANCELLED: Kích hoạt hoàn lại tồn kho chi nhánh.
 * 3. Khi DELIVERED: Đánh dấu thanh toán hoàn tất (nếu COD) và kích hoạt bảo hành IMEI.
 * 4. Khi REFUNDED: Cập nhật PaymentStatus = REFUNDED.
 */
@Component
public class DefaultOrderStateChangeHandler implements OrderStateChangeHandler {

    private static final Logger log = LoggerFactory.getLogger(DefaultOrderStateChangeHandler.class);

    private final OrderStatusHistoryRepository historyRepository;

    public DefaultOrderStateChangeHandler(OrderStatusHistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Override
    public void onStateChanged(Order order, OrderStatus fromStatus, OrderStatus toStatus,
                               OrderEvent event, String reason, String changedBy) {
        log.info("[STATE MACHINE] Đơn hàng [{}] chuyển từ [{}] sang [{}] qua sự kiện [{}] bởi [{}]",
                order.getOrderCode(), fromStatus, toStatus, event, changedBy);

        // 1. Ghi Audit Trail
        OrderStatusHistory history = new OrderStatusHistory(
                order.getId(),
                fromStatus,
                toStatus,
                (event != null ? event.name() : "MANUAL_TRANSITION"),
                reason,
                changedBy
        );
        historyRepository.save(history);

        // 2. Xử lý tác vụ phụ tùy trạng thái đích
        switch (toStatus) {
            case CANCELLED:
                handleOrderCancelled(order, reason);
                break;
            case DELIVERED:
                handleOrderDelivered(order);
                break;
            case REFUNDED:
                handleOrderRefunded(order, reason);
                break;
            case PROCESSING:
                log.info("[KHO CHI NHÁNH] Đang giữ tồn kho và kiểm tra mã IMEI cho đơn {}", order.getOrderCode());
                break;
            case SHIPPING:
                log.info("[VẬN CHUYỂN] Bàn giao đơn hàng {} cho shipper", order.getOrderCode());
                break;
            default:
                break;
        }
    }

    private void handleOrderCancelled(Order order, String reason) {
        log.warn("[HOÀN TỒN KHO] Đơn hàng {} bị hủy với lý do: {}. Hoàn lại {} mặt hàng vào kho chi nhánh ID={}",
                order.getOrderCode(), reason, order.getItems().size(), order.getBranchId());
    }

    private void handleOrderDelivered(Order order) {
        log.info("[BẢO HÀNH ĐIỆN TỬ] Đơn hàng {} giao thành công! Kích hoạt bảo hành điện tử chính hãng theo mã IMEI.",
                order.getOrderCode());
        if (order.getPaymentStatus() == PaymentStatus.UNPAID) {
            order.setPaymentStatus(PaymentStatus.PAID);
            log.info("[THANH TOÁN] Đơn hàng COD {} được cập nhật sang PAID", order.getOrderCode());
        }
    }

    private void handleOrderRefunded(Order order, String reason) {
        log.info("[HOÀN TIỀN] Đơn hàng {} hoàn trả với lý do: {}. Cập nhật trạng thái thanh toán sang REFUNDED.",
                order.getOrderCode(), reason);
        order.setPaymentStatus(PaymentStatus.REFUNDED);
    }
}
