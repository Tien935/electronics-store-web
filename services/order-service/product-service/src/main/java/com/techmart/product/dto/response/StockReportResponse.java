package com.techmart.product.dto.response;

import java.util.ArrayList;
import java.util.List;

public class StockReportResponse {
    private Long variantId;
    private String sku;
    private String variantName;
    private String productName;
    private long totalInStock;
    private List<BranchStockResponse> branchStocks = new ArrayList<>();

    public StockReportResponse() {}

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public long getTotalInStock() { return totalInStock; }
    public void setTotalInStock(long totalInStock) { this.totalInStock = totalInStock; }

    public List<BranchStockResponse> getBranchStocks() { return branchStocks; }
    public void setBranchStocks(List<BranchStockResponse> branchStocks) { this.branchStocks = branchStocks; }
}
