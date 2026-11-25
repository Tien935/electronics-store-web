package com.jvnc.order.controller;

import com.jvnc.order.dto.response.ApiResponse;
import com.jvnc.order.dto.response.StateRuleResponse;
import com.jvnc.order.model.OrderStatus;
import com.jvnc.order.service.OrderStateMachine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/order-state-machine")
@CrossOrigin(origins = "*")
public class OrderStateMachineController {

    private final OrderStateMachine stateMachine;

    public OrderStateMachineController(OrderStateMachine stateMachine) {
        this.stateMachine = stateMachine;
    }

    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<StateRuleResponse>>> getAllRules() {
        Map<OrderStatus, List<OrderStatus>> matrix = stateMachine.getStateMachineMatrix();
        List<StateRuleResponse> rules = matrix.entrySet().stream()
                .map(entry -> new StateRuleResponse(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(rules));
    }

    @GetMapping("/allowed-transitions/{status}")
    public ResponseEntity<ApiResponse<List<OrderStatus>>> getAllowedTransitions(@PathVariable OrderStatus status) {
        List<OrderStatus> allowed = stateMachine.getAllowedNextStatuses(status);
        return ResponseEntity.ok(ApiResponse.success(allowed));
    }
}
