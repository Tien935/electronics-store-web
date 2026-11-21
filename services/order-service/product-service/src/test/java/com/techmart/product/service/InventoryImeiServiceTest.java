package com.techmart.product.service;

import com.techmart.product.dto.request.BulkImportImeiRequest;
import com.techmart.product.dto.request.ChangeImeiStatusRequest;
import com.techmart.product.dto.response.DeviceImeiResponse;
import com.techmart.product.dto.response.StockReportResponse;
import com.techmart.product.entity.*;
import com.techmart.product.repository.BranchRepository;
import com.techmart.product.repository.DeviceImeiRepository;
import com.techmart.product.repository.ProductVariantRepository;
import com.techmart.product.service.impl.InventoryImeiServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InventoryImeiServiceTest {

    @Mock
    private DeviceImeiRepository imeiRepository;
    @Mock
    private ProductVariantRepository variantRepository;
    @Mock
    private BranchRepository branchRepository;

    private InventoryImeiServiceImpl inventoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        inventoryService = new InventoryImeiServiceImpl(imeiRepository, variantRepository, branchRepository);
    }

    @Test
    @DisplayName("Test nhập lô mã IMEI vào kho chi nhánh")
    void testBulkImportImeis_Success() {
        ProductVariant variant = new ProductVariant();
        variant.setId(101L);
        variant.setVariantName("iPhone 16 Pro Max 256GB");
        variant.setSku("IP16PM-256");

        Branch branch = new Branch(1L, "HN-KIMNGUU", "FPT Shop Kim Ngưu", "79B Kim Ngưu", "02473001234", true);

        when(variantRepository.findById(101L)).thenReturn(Optional.of(variant));
        when(branchRepository.findById(1L)).thenReturn(Optional.of(branch));
        when(imeiRepository.existsByImei(anyString())).thenReturn(false);

        when(imeiRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        BulkImportImeiRequest req = new BulkImportImeiRequest();
        req.setVariantId(101L);
        req.setBranchId(1L);
        req.setImeis(List.of("356789123456781", "356789123456782"));
        req.setImportPrice(new BigDecimal("31000000"));

        List<DeviceImeiResponse> res = inventoryService.bulkImportImeis(req);

        assertEquals(2, res.size());
        assertEquals("356789123456781", res.get(0).getImei());
        assertEquals(ImeiStatus.IN_STOCK, res.get(0).getStatus());
        assertEquals("FPT Shop Kim Ngưu", res.get(0).getBranchName());
    }

    @Test
    @DisplayName("Test cập nhật trạng thái IMEI khi bán máy cho khách")
    void testChangeImeiStatus_Sold() {
        ProductVariant variant = new ProductVariant();
        variant.setId(101L);
        variant.setVariantName("iPhone 16 Pro Max 256GB");

        Branch branch = new Branch(1L, "HN-KIMNGUU", "FPT Shop Kim Ngưu", "79B Kim Ngưu", "02473001234", true);

        DeviceImei device = new DeviceImei();
        device.setId(1L);
        device.setImei("356789123456781");
        device.setVariant(variant);
        device.setBranch(branch);
        device.setStatus(ImeiStatus.IN_STOCK);

        when(imeiRepository.findByImei("356789123456781")).thenReturn(Optional.of(device));
        when(imeiRepository.save(any(DeviceImei.class))).thenReturn(device);

        ChangeImeiStatusRequest req = new ChangeImeiStatusRequest(ImeiStatus.SOLD, "ORD-20261121-001", "0987654321", "Bán trực tiếp");
        DeviceImeiResponse res = inventoryService.changeImeiStatus("356789123456781", req);

        assertNotNull(res);
        assertEquals(ImeiStatus.SOLD, device.getStatus());
        assertEquals("ORD-20261121-001", device.getOrderCode());
        assertEquals("0987654321", device.getCustomerPhone());
        assertNotNull(device.getSoldDate());
    }

    @Test
    @DisplayName("Test lập báo cáo tồn kho O2O theo từng chi nhánh")
    void testGetStockReport_Success() {
        ProductVariant variant = new ProductVariant();
        variant.setId(101L);
        variant.setSku("IP16PM-256");
        variant.setVariantName("iPhone 16 Pro Max 256GB");

        when(variantRepository.findById(101L)).thenReturn(Optional.of(variant));
        when(imeiRepository.countByVariantIdAndStatus(101L, ImeiStatus.IN_STOCK)).thenReturn(5L);

        Object[] row1 = new Object[]{1L, "FPT Shop Kim Ngưu", 3L};
        Object[] row2 = new Object[]{2L, "FPT Shop Thái Hà", 2L};
        when(imeiRepository.countStockGroupedByBranch(101L, ImeiStatus.IN_STOCK)).thenReturn(List.of(row1, row2));

        StockReportResponse report = inventoryService.getStockReport(101L);

        assertNotNull(report);
        assertEquals(5L, report.getTotalInStock());
        assertEquals(2, report.getBranchStocks().size());
        assertEquals("FPT Shop Kim Ngưu", report.getBranchStocks().get(0).getBranchName());
        assertEquals(3L, report.getBranchStocks().get(0).getInStockQuantity());
    }
}
