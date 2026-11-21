package com.techmart.product.dto.request;

import com.techmart.product.entity.ImeiStatus;
import jakarta.validation.constraints.NotNull;

public class ChangeImeiStatusRequest {

    @NotNull(message = "Trạng thái mới không được để trống")
    private ImeiStatus newStatus;

    private String orderCode;
    private String customerPhone;
    private String note;

    public ChangeImeiStatusRequest() {}

    public ChangeImeiStatusRequest(ImeiStatus newStatus, String orderCode, String customerPhone, String note) {
        this.newStatus = newStatus;
        this.orderCode = orderCode;
        this.customerPhone = customerPhone;
        this.note = note;
    }

    public ImeiStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ImeiStatus newStatus) { this.newStatus = newStatus; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
