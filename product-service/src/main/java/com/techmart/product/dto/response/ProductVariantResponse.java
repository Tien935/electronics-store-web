package com.techmart.product.dto.response;

import java.math.BigDecimal;

public class ProductVariantResponse {
    private Long id;
    private Long productId;
    private String sku;
    private String variantName;
    private String color;
    private String storage;
    private String ram;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String imageUrl;
    private Boolean isActive;
    private Long inStockCount;

    public ProductVariantResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }

    public String getRam() { return ram; }
    public void setRam(String ram) { this.ram = ram; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOriginalPrice() { return originalPrice; }
    public void setOriginalPrice(BigDecimal originalPrice) { this.originalPrice = originalPrice; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getInStockCount() { return inStockCount; }
    public void setInStockCount(Long inStockCount) { this.inStockCount = inStockCount; }
}
