package com.jvnc.order.service;

import com.jvnc.order.dto.request.ApplyVoucherRequest;
import com.jvnc.order.dto.request.CreateVoucherRequest;
import com.jvnc.order.dto.response.ApplyVoucherResponse;
import com.jvnc.order.dto.response.VoucherResponse;

import java.math.BigDecimal;
import java.util.List;

public interface VoucherService {

    ApplyVoucherResponse applyVoucher(ApplyVoucherRequest request);

    BigDecimal calculateDiscount(String voucherCode, BigDecimal orderAmount);

    void recordVoucherUsage(String voucherCode);

    List<VoucherResponse> getActiveVouchers();

    VoucherResponse getVoucherByCode(String code);

    VoucherResponse createVoucher(CreateVoucherRequest request);
}
