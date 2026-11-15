package com.techmart.order.controller;

import com.techmart.order.dto.response.ApiResponse;
import com.techmart.order.dto.response.OrderStateMachineRuleResponse;
import com.techmart.order.entity.OrderStatus;
import com.techmart.order.statemachine.OrderEvent;
import com.techmart.order.statemachine.OrderStateMachine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller cung cấp thông tin metadata về Order State Machine:
 * Các trạng thái, sự kiện và ma trận quy tắc chuyển đổi hợp lệ.
 */
@RestController
@RequestMapping("/api/order-state-machine")
public class OrderStateMachineController {

    private final OrderStateMachine stateMachine;

    public OrderStateMachineController(OrderStateMachine stateMachine) {
        this.stateMachine = stateMachine;
    }

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<OrderStateMachineRuleResponse>>> getAllRules() {
        List<OrderStateMachineRuleResponse> rules = stateMachine.getAllTransitions().stream()
                .map(OrderStateMachineRuleResponse::fromTransition)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Danh sách quy tắc chuyển trạng thái của Order State Machine", rules));
    }

    @GetMapping("/statuses")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllStatuses() {
        List<Map<String, Object>> statuses = Arrays.stream(OrderStatus.values())
                .map(s -> Map.<String, Object>of(
                        "code", s.name(),
                        "displayName", s.getDisplayName(),
                        "description", s.getDescription(),
                        "isTerminal", s.isTerminal(),
                        "allowedNextStatuses", stateMachine.getAllowedNextStatuses(s)
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(statuses));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getAllEvents() {
        List<Map<String, String>> events = Arrays.stream(OrderEvent.values())
                .map(e -> Map.of(
                        "code", e.name(),
                        "description", e.getDescription()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/next-statuses/{status}")
    public ResponseEntity<ApiResponse<List<OrderStatus>>> getNextStatuses(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success(stateMachine.getAllowedNextStatuses(status)));
    }
}
