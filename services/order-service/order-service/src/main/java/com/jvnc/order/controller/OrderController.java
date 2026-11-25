package com.jvnc.order.controller;

import com.jvnc.order.dto.request.CancelOrderRequest;
import com.jvnc.order.dto.request.ChangeOrderStatusRequest;
import com.jvnc.order.dto.request.CreateOrderRequest;
import com.jvnc.order.dto.response.ApiResponse;
import com.jvnc.order.dto.response.OrderResponse;
import com.jvnc.order.dto.response.OrderStatusHistoryResponse;
import com.jvnc.order.model.OrderStatus;
import com.jvnc.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Đặt hàng thành công", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(id)));
    }

    @GetMapping("/code/{orderCode}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByCode(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByCode(orderCode)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrdersByUserId(userId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrders(
            @RequestParam(required = false) OrderStatus status) {
        List<OrderResponse> result = (status != null) ? orderService.getOrdersByStatus(status) : orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> changeOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeOrderStatusRequest request) {
        OrderResponse response = orderService.changeOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Chuyển trạng thái đơn hàng thành công", response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request) {
        OrderResponse response = orderService.cancelOrder(id, request);
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công", response));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<OrderStatusHistoryResponse>>> getOrderHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderHistory(id)));
    }

    @GetMapping("/{id}/allowed-next-statuses")
    public ResponseEntity<ApiResponse<List<OrderStatus>>> getAllowedNextStatuses(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllowedNextStatuses(id)));
    }
}
