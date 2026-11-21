package com.techmart.product.dto.request;

import jakarta.validation.constraints.NotNull;

public class TransferBranchRequest {

    @NotNull(message = "Chi nhánh đích không được để trống")
    private Long targetBranchId;

    private String reason;

    public TransferBranchRequest() {}

    public TransferBranchRequest(Long targetBranchId, String reason) {
        this.targetBranchId = targetBranchId;
        this.reason = reason;
    }

    public Long getTargetBranchId() { return targetBranchId; }
    public void setTargetBranchId(Long targetBranchId) { this.targetBranchId = targetBranchId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
