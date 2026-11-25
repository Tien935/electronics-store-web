package com.jvnc.order.service.impl;

import com.jvnc.order.model.Order;
import com.jvnc.order.model.OrderEvent;
import com.jvnc.order.model.OrderStatus;
import com.jvnc.order.service.OrderStateChangeHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DefaultOrderStateChangeHandler implements OrderStateChangeHandler {

    private static final Logger log = LoggerFactory.getLogger(DefaultOrderStateChangeHandler.class);

    @Override
    public void onStateChanged(Order order, OrderStatus previousStatus, OrderStatus currentStatus,
                               OrderEvent event, String reason, String changedBy) {
        log.info("[STATE MACHINE] Đơn hàng [{}] chuyển từ [{}] sang [{}] qua sự kiện [{}] bởi [{}]",
                order.getOrderCode(), previousStatus, currentStatus, event, changedBy);

        switch (currentStatus) {
            case CONFIRMED:
                log.info("[GIỮ TỒN KHO] Đơn hàng {} đã xác nhận. Khóa IMEI/tồn kho tại chi nhánh ID={}",
                        order.getOrderCode(), order.getBranchId());
                break;
            case PROCESSING:
                log.info("[ĐÓNG GÓI] Kho chi nhánh {} bắt đầu kiểm tra máy và dán tem bảo hành đơn {}",
                        order.getBranchName(), order.getOrderCode());
                break;
            case SHIPPING:
                log.info("[VẬN CHUYỂN] Bàn giao đơn hàng {} cho đối tác giao hàng", order.getOrderCode());
                break;
            case DELIVERED:
                log.info("[KÍCH HOẠT BẢO HÀNH] Đơn hàng {} giao thành công. Kích hoạt bảo hành điện tử theo IMEI",
                        order.getOrderCode());
                break;
            case CANCELLED:
                log.warn("[HOÀN TỒN KHO] Đơn hàng {} bị hủy với lý do: {}. Hoàn lại {} mặt hàng vào kho chi nhánh ID={}",
                        order.getOrderCode(), reason, order.getItems() != null ? order.getItems().size() : 0, order.getBranchId());
                break;
            case REFUNDED:
                log.info("[HOÀN TIỀN] Khởi tạo yêu cầu hoàn tiền cho đơn hàng {}", order.getOrderCode());
                break;
            default:
                break;
        }
    }
}
