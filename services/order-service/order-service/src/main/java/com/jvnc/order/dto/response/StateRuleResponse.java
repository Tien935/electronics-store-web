package com.jvnc.order.dto.response;

import com.jvnc.order.model.OrderStatus;
import java.util.List;

public class StateRuleResponse {

    private OrderStatus currentStatus;
    private String displayName;
    private List<OrderStatus> allowedNextStatuses;

    public StateRuleResponse(OrderStatus currentStatus, List<OrderStatus> allowedNextStatuses) {
        this.currentStatus = currentStatus;
        this.displayName = currentStatus.getDisplayName();
        this.allowedNextStatuses = allowedNextStatuses;
    }

    public OrderStatus getCurrentStatus() { return currentStatus; }
    public String getDisplayName() { return displayName; }
    public List<OrderStatus> getAllowedNextStatuses() { return allowedNextStatuses; }
}
