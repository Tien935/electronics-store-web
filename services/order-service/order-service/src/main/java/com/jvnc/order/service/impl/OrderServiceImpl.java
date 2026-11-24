package com.jvnc.order.service.impl;

import com.jvnc.order.dao.OrderDao;
import com.jvnc.order.dao.OrderStatusHistoryDao;
import com.jvnc.order.dto.request.CancelOrderRequest;
import com.jvnc.order.dto.request.ChangeOrderStatusRequest;
import com.jvnc.order.dto.request.CreateOrderRequest;
import com.jvnc.order.dto.response.OrderItemResponse;
import com.jvnc.order.dto.response.OrderResponse;
import com.jvnc.order.dto.response.OrderStatusHistoryResponse;
import com.jvnc.order.exception.ResourceNotFoundException;
import com.jvnc.order.model.*;
import com.jvnc.order.service.OrderService;
import com.jvnc.order.service.OrderStateMachine;
import com.jvnc.order.service.VoucherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderDao orderDao;
    private final OrderStatusHistoryDao historyDao;
    private final OrderStateMachine stateMachine;
    private final VoucherService voucherService;

    public OrderServiceImpl(OrderDao orderDao,
                            OrderStatusHistoryDao historyDao,
                            OrderStateMachine stateMachine,
                            VoucherService voucherService) {
        this.orderDao = orderDao;
        this.historyDao = historyDao;
        this.stateMachine = stateMachine;
        this.voucherService = voucherService;
    }

    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setUserId(request.getUserId());
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setCustomerEmail(request.getCustomerEmail());
        order.setShippingAddress(request.getShippingAddress());
        order.setBranchId(request.getBranchId());
        order.setBranchName(request.getBranchName());
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setNote(request.getNote());

        BigDecimal totalAmount = BigDecimal.ZERO;
        if (request.getItems() != null) {
            for (var itemReq : request.getItems()) {
                OrderItem item = new OrderItem();
                item.setProductId(itemReq.getProductId());
                item.setSku(itemReq.getSku());
                item.setProductName(itemReq.getProductName());
                item.setProductImage(itemReq.getProductImage());
                item.setVariantName(itemReq.getVariantName());
                item.setImei(itemReq.getImei());
                item.setUnitPrice(itemReq.getUnitPrice());
                item.setQuantity(itemReq.getQuantity());

                BigDecimal lineTotal = itemReq.getUnitPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                item.setTotalPrice(lineTotal);

                order.addItem(item);
                totalAmount = totalAmount.add(lineTotal);
            }
        }
        order.setTotalAmount(totalAmount);

        BigDecimal discount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            String vCode = request.getVoucherCode().trim().toUpperCase();
            discount = voucherService.calculateDiscount(vCode, totalAmount);
            order.setVoucherCode(vCode);
            voucherService.recordVoucherUsage(vCode);
        } else if (request.getDiscountAmount() != null && request.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discount = request.getDiscountAmount();
        }

        order.setDiscountAmount(discount);
        BigDecimal finalAmount = totalAmount.subtract(discount);
        order.setFinalAmount(finalAmount.compareTo(BigDecimal.ZERO) > 0 ? finalAmount : BigDecimal.ZERO);

        Order saved = orderDao.save(order);

        OrderStatusHistory history = new OrderStatusHistory(
                saved.getId(),
                null,
                OrderStatus.PENDING,
                "CREATE_ORDER",
                saved.getVoucherCode() != null ?
                        "Khởi tạo đơn hàng online thành công (Áp dụng mã giảm giá: " + saved.getVoucherCode() + ")" :
                        "Khởi tạo đơn hàng online thành công",
                "CUSTOMER"
        );
        historyDao.save(history);

        log.info("[ORDER SERVICE] Đã tạo đơn hàng thành công: Mã đơn=[{}], Khách=[{}], Tổng tiền=[{}], Giảm giá=[{}], Thanh toán=[{}]",
                saved.getOrderCode(), saved.getCustomerName(), saved.getTotalAmount(), saved.getDiscountAmount(), saved.getFinalAmount());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        Order order = orderDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID=" + id));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderDao.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng mã=" + orderCode));
        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderDao.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderDao.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderDao.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OrderResponse changeOrderStatus(Long id, ChangeOrderStatusRequest request) {
        Order order = orderDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID=" + id));

        stateMachine.transitionTo(order, request.getTargetStatus(), request.getReason(), request.getChangedBy());

        if (order.getStatus() == OrderStatus.DELIVERED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        Order saved = orderDao.save(order);
        return mapToResponse(saved);
    }

    @Override
    public OrderResponse cancelOrder(Long id, CancelOrderRequest request) {
        Order order = orderDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID=" + id));

        stateMachine.sendEvent(order, OrderEvent.CANCEL, request.getReason(), request.getCancelledBy());

        Order saved = orderDao.save(order);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatusHistoryResponse> getOrderHistory(Long orderId) {
        if (!orderDao.existsById(orderId)) {
            throw new ResourceNotFoundException("Không tìm thấy đơn hàng ID=" + orderId);
        }
        return historyDao.findByOrderIdOrderByCreatedAtDesc(orderId).stream()
                .map(this::mapHistoryToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderStatus> getAllowedNextStatuses(Long orderId) {
        Order order = orderDao.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng ID=" + orderId));
        return stateMachine.getAllowedNextStatuses(order.getStatus());
    }

    private String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randPart = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "ORD-" + datePart + "-" + randPart;
    }

    private OrderResponse mapToResponse(Order o) {
        OrderResponse res = new OrderResponse();
        res.setId(o.getId());
        res.setOrderCode(o.getOrderCode());
        res.setUserId(o.getUserId());
        res.setCustomerName(o.getCustomerName());
        res.setCustomerPhone(o.getCustomerPhone());
        res.setCustomerEmail(o.getCustomerEmail());
        res.setShippingAddress(o.getShippingAddress());
        res.setBranchId(o.getBranchId());
        res.setBranchName(o.getBranchName());
        res.setStatus(o.getStatus());
        res.setStatusDescription(o.getStatus() != null ? o.getStatus().getDescription() : null);
        res.setPaymentMethod(o.getPaymentMethod());
        res.setPaymentStatus(o.getPaymentStatus());
        res.setVoucherCode(o.getVoucherCode());
        res.setTotalAmount(o.getTotalAmount());
        res.setDiscountAmount(o.getDiscountAmount());
        res.setFinalAmount(o.getFinalAmount());
        res.setNote(o.getNote());
        res.setCreatedAt(o.getCreatedAt());
        res.setUpdatedAt(o.getUpdatedAt());

        if (o.getItems() != null) {
            List<OrderItemResponse> itemResponses = o.getItems().stream().map(it -> {
                OrderItemResponse ir = new OrderItemResponse();
                ir.setId(it.getId());
                ir.setProductId(it.getProductId());
                ir.setProductCode(it.getSku());
                ir.setSku(it.getSku());
                ir.setProductName(it.getProductName());
                ir.setProductImage(it.getProductImage());
                ir.setVariantName(it.getVariantName());
                ir.setImei(it.getImei());
                ir.setUnitPrice(it.getUnitPrice());
                ir.setQuantity(it.getQuantity());
                ir.setTotalPrice(it.getTotalPrice());
                return ir;
            }).collect(Collectors.toList());
            res.setItems(itemResponses);
        }

        res.setAllowedNextStatuses(stateMachine.getAllowedNextStatuses(o.getStatus()));
        return res;
    }

    private OrderStatusHistoryResponse mapHistoryToResponse(OrderStatusHistory h) {
        return OrderStatusHistoryResponse.fromEntity(h);
    }
}
