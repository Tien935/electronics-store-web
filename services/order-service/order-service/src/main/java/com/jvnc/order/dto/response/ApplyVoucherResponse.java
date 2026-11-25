package com.jvnc.order.dto.response;

import java.math.BigDecimal;

public class ApplyVoucherResponse {

    private boolean valid;
    private String message;
    private String voucherCode;
    private String voucherTitle;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;

    public ApplyVoucherResponse() {}

    public ApplyVoucherResponse(boolean valid, String message, String voucherCode, String voucherTitle,
                                BigDecimal discountAmount, BigDecimal finalAmount) {
        this.valid = valid;
        this.message = message;
        this.voucherCode = voucherCode;
        this.voucherTitle = voucherTitle;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
    }

    public static ApplyVoucherResponse invalid(String message) {
        return new ApplyVoucherResponse(false, message, null, null, BigDecimal.ZERO, null);
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getVoucherCode() { return voucherCode; }
    public void setVoucherCode(String voucherCode) { this.voucherCode = voucherCode; }
    public String getVoucherTitle() { return voucherTitle; }
    public void setVoucherTitle(String voucherTitle) { this.voucherTitle = voucherTitle; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }
}
