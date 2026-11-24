package com.jvnc.order.service;

import com.jvnc.order.dao.VoucherDao;
import com.jvnc.order.dto.request.ApplyVoucherRequest;
import com.jvnc.order.dto.response.ApplyVoucherResponse;
import com.jvnc.order.model.DiscountType;
import com.jvnc.order.model.Voucher;
import com.jvnc.order.service.impl.VoucherServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VoucherServiceTest {

    @Mock
    private VoucherDao voucherDao;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    @Test
    @DisplayName("Test áp dụng mã giảm giá cố định (Fixed Amount) thành công")
    void testApplyVoucher_FixedAmount_Success() {
        Voucher v = new Voucher();
        v.setCode("GIAM500K");
        v.setTitle("Giảm 500K");
        v.setDiscountType(DiscountType.FIXED_AMOUNT);
        v.setDiscountValue(new BigDecimal("500000"));
        v.setMinOrderAmount(new BigDecimal("10000000"));
        v.setUsageLimit(100);
        v.setUsedCount(0);
        v.setStartDate(LocalDateTime.now().minusDays(1));
        v.setEndDate(LocalDateTime.now().plusDays(10));
        v.setStatus("ACTIVE");

        when(voucherDao.findByCode("GIAM500K")).thenReturn(Optional.of(v));

        ApplyVoucherRequest req = new ApplyVoucherRequest("GIAM500K", new BigDecimal("20000000"));
        ApplyVoucherResponse res = voucherService.applyVoucher(req);

        assertTrue(res.isValid());
        assertEquals(0, new BigDecimal("500000").compareTo(res.getDiscountAmount()));
        assertEquals(0, new BigDecimal("19500000").compareTo(res.getFinalAmount()));
    }

    @Test
    @DisplayName("Test áp dụng mã giảm giá theo % (Percentage) có chặn trần tối đa")
    void testApplyVoucher_Percentage_WithMaxCap() {
        Voucher v = new Voucher();
        v.setCode("GIAM10");
        v.setTitle("Giảm 10% tối đa 1 triệu");
        v.setDiscountType(DiscountType.PERCENTAGE);
        v.setDiscountValue(new BigDecimal("10"));
        v.setMinOrderAmount(new BigDecimal("5000000"));
        v.setMaxDiscountAmount(new BigDecimal("1000000"));
        v.setUsageLimit(100);
        v.setUsedCount(0);
        v.setStartDate(LocalDateTime.now().minusDays(1));
        v.setEndDate(LocalDateTime.now().plusDays(10));
        v.setStatus("ACTIVE");

        when(voucherDao.findByCode("GIAM10")).thenReturn(Optional.of(v));

        ApplyVoucherRequest req = new ApplyVoucherRequest("GIAM10", new BigDecimal("30000000"));
        ApplyVoucherResponse res = voucherService.applyVoucher(req);

        assertTrue(res.isValid());
        assertEquals(0, new BigDecimal("1000000").compareTo(res.getDiscountAmount()));
        assertEquals(0, new BigDecimal("29000000").compareTo(res.getFinalAmount()));
    }

    @Test
    @DisplayName("Test từ chối voucher khi chưa đạt giá trị đơn tối thiểu")
    void testApplyVoucher_BelowMinOrderAmount() {
        Voucher v = new Voucher();
        v.setCode("GIAM500K");
        v.setTitle("Giảm 500K");
        v.setDiscountType(DiscountType.FIXED_AMOUNT);
        v.setDiscountValue(new BigDecimal("500000"));
        v.setMinOrderAmount(new BigDecimal("10000000"));
        v.setUsageLimit(100);
        v.setUsedCount(0);
        v.setStartDate(LocalDateTime.now().minusDays(1));
        v.setEndDate(LocalDateTime.now().plusDays(10));
        v.setStatus("ACTIVE");

        when(voucherDao.findByCode("GIAM500K")).thenReturn(Optional.of(v));

        ApplyVoucherRequest req = new ApplyVoucherRequest("GIAM500K", new BigDecimal("5000000"));
        ApplyVoucherResponse res = voucherService.applyVoucher(req);

        assertFalse(res.isValid());
        assertTrue(res.getMessage().contains("chưa đạt giá trị tối thiểu"));
    }
}
