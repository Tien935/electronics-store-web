package com.techmart.order.repository;

import com.techmart.order.entity.Order;
import com.techmart.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository cho Order.
 * Cung cấp các phương thức truy vấn cơ bản và nâng cao cho nghiệp vụ bán lẻ.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByBranchId(Long branchId);

    List<Order> findByStatusAndBranchId(OrderStatus status, Long branchId);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findOrdersInDateRange(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countOrdersByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.status = com.techmart.order.entity.OrderStatus.DELIVERED")
    BigDecimal calculateTotalDeliveredRevenue();
}
