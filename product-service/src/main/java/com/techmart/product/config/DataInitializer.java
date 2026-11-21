package com.techmart.product.config;

import com.techmart.product.repository.BranchRepository;
import com.techmart.product.repository.DeviceImeiRepository;
import com.techmart.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProductRepository productRepository;
    private final DeviceImeiRepository imeiRepository;
    private final BranchRepository branchRepository;

    public DataInitializer(ProductRepository productRepository,
                           DeviceImeiRepository imeiRepository,
                           BranchRepository branchRepository) {
        this.productRepository = productRepository;
        this.imeiRepository = imeiRepository;
        this.branchRepository = branchRepository;
    }

    @Override
    public void run(String... args) {
        long productCount = productRepository.count();
        long imeiCount = imeiRepository.count();
        long branchCount = branchRepository.count();

        log.info("========================================================================");
        log.info(" [TECH-MART] PRODUCT SERVICE (CATALOG & INVENTORY) RUNNING ON PORT 8082 ");
        log.info(" Số lượng Sản phẩm hiện có: {}", productCount);
        log.info(" Số lượng Thiết bị IMEI trong kho: {}", imeiCount);
        log.info(" Số lượng Chi nhánh O2O: {}", branchCount);
        log.info(" H2 Database Web Console : http://localhost:8082/h2-console");
        log.info(" Products REST API       : http://localhost:8082/api/products");
        log.info(" Inventory IMEI REST API : http://localhost:8082/api/inventory/imeis");
        log.info("========================================================================");
    }
}
