package com.techmart.product.dto.response;

public class BranchStockResponse {
    private Long branchId;
    private String branchName;
    private long inStockQuantity;

    public BranchStockResponse() {}

    public BranchStockResponse(Long branchId, String branchName, long inStockQuantity) {
        this.branchId = branchId;
        this.branchName = branchName;
        this.inStockQuantity = inStockQuantity;
    }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public long getInStockQuantity() { return inStockQuantity; }
    public void setInStockQuantity(long inStockQuantity) { this.inStockQuantity = inStockQuantity; }
}
