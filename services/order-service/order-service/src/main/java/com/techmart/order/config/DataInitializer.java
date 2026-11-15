package com.techmart.order.config;

import com.techmart.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Khởi tạo dữ liệu mẫu và kiểm tra kết nối CSDL khi ứng dụng khởi động.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final OrderRepository orderRepository;

    public DataInitializer(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void run(String... args) {
        long count = orderRepository.count();
        log.info("========================================================================");
        log.info(" [TECH-MART] ORDER SERVICE ĐÃ KHỞI ĐỘNG THÀNH CÔNG TRÊN CỔNG 8084");
        log.info(" Số lượng đơn hàng hiện có trong CSDL: {}", count);
        log.info(" H2 Database Web Console: http://localhost:8084/h2-console");
        log.info(" State Machine Rules API : http://localhost:8084/api/order-state-machine/rules");
        log.info(" Orders REST API         : http://localhost:8084/api/orders");
        log.info("========================================================================");
    }
}
