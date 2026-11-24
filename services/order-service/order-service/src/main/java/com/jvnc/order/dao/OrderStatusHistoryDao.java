package com.jvnc.order.dao;

import com.jvnc.order.model.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryDao extends JpaRepository<OrderStatusHistory, Long> {

    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtAsc(Long orderId);

    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtDesc(Long orderId);
}
