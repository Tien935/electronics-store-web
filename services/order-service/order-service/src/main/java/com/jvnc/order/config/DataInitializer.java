package com.jvnc.order.config;

import com.jvnc.order.dao.OrderDao;
import com.jvnc.order.dao.VoucherDao;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final OrderDao orderDao;
    private final VoucherDao voucherDao;

    public DataInitializer(OrderDao orderDao, VoucherDao voucherDao) {
        this.orderDao = orderDao;
        this.voucherDao = voucherDao;
    }

    @Override
    public void run(String... args) {
        long orderCount = orderDao.count();
        long voucherCount = voucherDao.count();
        log.info("========================================================================");
        log.info(" [JVNC] ORDER SERVICE ĐÃ KHỞI ĐỘNG THÀNH CÔNG TRÊN CỔNG 8084");
        log.info(" Số lượng đơn hàng hiện có trong CSDL: {}", orderCount);
        log.info(" Số lượng mã khuyến mãi (Voucher): {}", voucherCount);
        log.info(" H2 Database Web Console: http://localhost:8084/h2-console");
        log.info(" Vouchers API           : http://localhost:8084/api/vouchers");
        log.info(" State Machine Rules API: http://localhost:8084/api/order-state-machine/rules");
        log.info(" Orders REST API        : http://localhost:8084/api/orders");
        log.info("========================================================================");
    }
}
