package com.techmart.product.dto.response;

import com.techmart.product.entity.ImeiStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DeviceImeiResponse {
    private Long id;
    private String imei;
    private Long variantId;
    private String variantName;
    private String sku;
    private String productName;
    private Long branchId;
    private String branchName;
    private String branchAddress;
    private ImeiStatus status;
    private String statusDescription;
    private BigDecimal importPrice;
    private Integer warrantyMonths;
    private LocalDateTime importDate;
    private LocalDateTime soldDate;
    private String orderCode;
    private String customerPhone;
    private String note;

    public DeviceImeiResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImei() { return imei; }
    public void setImei(String imei) { this.imei = imei; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getBranchAddress() { return branchAddress; }
    public void setBranchAddress(String branchAddress) { this.branchAddress = branchAddress; }

    public ImeiStatus getStatus() { return status; }
    public void setStatus(ImeiStatus status) { this.status = status; }

    public String getStatusDescription() { return statusDescription; }
    public void setStatusDescription(String statusDescription) { this.statusDescription = statusDescription; }

    public BigDecimal getImportPrice() { return importPrice; }
    public void setImportPrice(BigDecimal importPrice) { this.importPrice = importPrice; }

    public Integer getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(Integer warrantyMonths) { this.warrantyMonths = warrantyMonths; }

    public LocalDateTime getImportDate() { return importDate; }
    public void setImportDate(LocalDateTime importDate) { this.importDate = importDate; }

    public LocalDateTime getSoldDate() { return soldDate; }
    public void setSoldDate(LocalDateTime soldDate) { this.soldDate = soldDate; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
