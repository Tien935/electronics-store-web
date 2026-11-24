package com.jvnc.order.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ApplyVoucherRequest {

    @NotBlank(message = "Mã voucher không được để trống")
    private String code;

    @NotNull(message = "Giá trị đơn hàng không được để trống")
    @DecimalMin(value = "0.0", message = "Giá trị đơn hàng phải lớn hơn hoặc bằng 0")
    private BigDecimal orderAmount;

    public ApplyVoucherRequest() {}
    public ApplyVoucherRequest(String code, BigDecimal orderAmount) {
        this.code = code;
        this.orderAmount = orderAmount;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public BigDecimal getOrderAmount() { return orderAmount; }
    public void setOrderAmount(BigDecimal orderAmount) { this.orderAmount = orderAmount; }
}
