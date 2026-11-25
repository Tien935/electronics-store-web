package com.jvnc.order.service.impl;

import com.jvnc.order.dao.VoucherDao;
import com.jvnc.order.dto.request.ApplyVoucherRequest;
import com.jvnc.order.dto.request.CreateVoucherRequest;
import com.jvnc.order.dto.response.ApplyVoucherResponse;
import com.jvnc.order.dto.response.VoucherResponse;
import com.jvnc.order.exception.InvalidVoucherException;
import com.jvnc.order.exception.ResourceNotFoundException;
import com.jvnc.order.model.DiscountType;
import com.jvnc.order.model.Voucher;
import com.jvnc.order.service.VoucherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VoucherServiceImpl implements VoucherService {

    private static final Logger log = LoggerFactory.getLogger(VoucherServiceImpl.class);

    private final VoucherDao voucherDao;

    public VoucherServiceImpl(VoucherDao voucherDao) {
        this.voucherDao = voucherDao;
    }

    @Override
    @Transactional(readOnly = true)
    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request) {
        String code = request.getCode().trim().toUpperCase();
        BigDecimal orderAmount = request.getOrderAmount();

        Voucher voucher = voucherDao.findByCode(code).orElse(null);
        if (voucher == null) {
            return ApplyVoucherResponse.invalid("Mã khuyến mãi [" + code + "] không tồn tại trên hệ thống");
        }

        if (!"ACTIVE".equalsIgnoreCase(voucher.getStatus())) {
            return ApplyVoucherResponse.invalid("Mã khuyến mãi [" + code + "] hiện không hoạt động");
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            return ApplyVoucherResponse.invalid("Mã khuyến mãi [" + code + "] chưa đến đợt áp dụng");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            return ApplyVoucherResponse.invalid("Mã khuyến mãi [" + code + "] đã hết hạn sử dụng");
        }

        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            return ApplyVoucherResponse.invalid("Mã khuyến mãi [" + code + "] đã hết lượt sử dụng");
        }

        if (voucher.getMinOrderAmount() != null && orderAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            return ApplyVoucherResponse.invalid(String.format("Đơn hàng chưa đạt giá trị tối thiểu %s VNĐ để áp dụng mã [%s]",
                    voucher.getMinOrderAmount(), code));
        }

        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderAmount.multiply(voucher.getDiscountValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }

        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        BigDecimal finalAmount = orderAmount.subtract(discount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;

        return new ApplyVoucherResponse(true, "Áp dụng mã khuyến mãi thành công! Bạn được giảm " + discount + " VNĐ",
                code, voucher.getTitle(), discount, finalAmount);
    }

    @Override
    public BigDecimal calculateDiscount(String voucherCode, BigDecimal orderAmount) {
        if (voucherCode == null || voucherCode.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        ApplyVoucherRequest req = new ApplyVoucherRequest(voucherCode, orderAmount);
        ApplyVoucherResponse res = applyVoucher(req);
        if (!res.isValid()) {
            throw new InvalidVoucherException("Không thể áp dụng mã khuyến mãi: " + res.getMessage());
        }
        return res.getDiscountAmount();
    }

    @Override
    public void recordVoucherUsage(String voucherCode) {
        if (voucherCode == null || voucherCode.trim().isEmpty()) return;
        voucherDao.findByCode(voucherCode.trim().toUpperCase()).ifPresent(v -> {
            v.setUsedCount(v.getUsedCount() + 1);
            if (v.getUsedCount() >= v.getUsageLimit()) {
                v.setStatus("EXPIRED");
            }
            voucherDao.save(v);
            log.info("[VOUCHER] Mã [{}] đã được sử dụng. Lượt dùng: {}/{}", v.getCode(), v.getUsedCount(), v.getUsageLimit());
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getActiveVouchers() {
        return voucherDao.findByStatus("ACTIVE").stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherByCode(String code) {
        Voucher voucher = voucherDao.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy voucher mã=" + code));
        return mapToResponse(voucher);
    }

    @Override
    public VoucherResponse createVoucher(CreateVoucherRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (voucherDao.existsByCode(code)) {
            throw new InvalidVoucherException("Mã voucher [" + code + "] đã tồn tại");
        }

        Voucher v = new Voucher();
        v.setCode(code);
        v.setTitle(request.getTitle());
        v.setDiscountType(request.getDiscountType());
        v.setDiscountValue(request.getDiscountValue());
        v.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);
        v.setMaxDiscountAmount(request.getMaxDiscountAmount());
        v.setUsageLimit(request.getUsageLimit() != null ? request.getUsageLimit() : 100);
        v.setUsedCount(0);
        v.setStartDate(request.getStartDate());
        v.setEndDate(request.getEndDate());
        v.setStatus("ACTIVE");

        Voucher saved = voucherDao.save(v);
        return mapToResponse(saved);
    }

    private VoucherResponse mapToResponse(Voucher v) {
        VoucherResponse res = new VoucherResponse();
        res.setId(v.getId());
        res.setCode(v.getCode());
        res.setTitle(v.getTitle());
        res.setDiscountType(v.getDiscountType());
        res.setDiscountValue(v.getDiscountValue());
        res.setMinOrderAmount(v.getMinOrderAmount());
        res.setMaxDiscountAmount(v.getMaxDiscountAmount());
        res.setUsageLimit(v.getUsageLimit());
        res.setUsedCount(v.getUsedCount());
        res.setStartDate(v.getStartDate());
        res.setEndDate(v.getEndDate());
        res.setStatus(v.getStatus());
        return res;
    }
}
