package com.jvnc.order.dto.request;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class OrderItemRequest {

    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    private String sku;
    private String productCode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String productName;

    private String productImage;
    private String variantName;
    private String imei;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Đơn giá phải lớn hơn 0")
    private BigDecimal unitPrice;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng tối thiểu là 1")
    private Integer quantity;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getSku() { return sku != null ? sku : productCode; }
    public void setSku(String sku) { this.sku = sku; }
    public String getProductCode() { return productCode != null ? productCode : sku; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }
    public String getImei() { return imei; }
    public void setImei(String imei) { this.imei = imei; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
