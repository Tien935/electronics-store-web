package com.techmart.product.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public class BulkImportImeiRequest {

    @NotNull(message = "Biến thể sản phẩm không được để trống")
    private Long variantId;

    @NotNull(message = "Chi nhánh nhập kho không được để trống")
    private Long branchId;

    @NotEmpty(message = "Danh sách mã IMEI không được để trống")
    private List<String> imeis;

    private BigDecimal importPrice;
    private Integer warrantyMonths = 12;
    private String note;

    public BulkImportImeiRequest() {}

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }

    public List<String> getImeis() { return imeis; }
    public void setImeis(List<String> imeis) { this.imeis = imeis; }

    public BigDecimal getImportPrice() { return importPrice; }
    public void setImportPrice(BigDecimal importPrice) { this.importPrice = importPrice; }

    public Integer getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(Integer warrantyMonths) { this.warrantyMonths = warrantyMonths; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
