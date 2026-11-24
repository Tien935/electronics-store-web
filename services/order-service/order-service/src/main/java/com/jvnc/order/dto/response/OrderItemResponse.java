package com.jvnc.order.dto.response;

import java.math.BigDecimal;

public class OrderItemResponse {

    private Long id;
    private Long productId;
    private String sku;
    private String productCode;
    private String productName;
    private String productImage;
    private String variantName;
    private String imei;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
