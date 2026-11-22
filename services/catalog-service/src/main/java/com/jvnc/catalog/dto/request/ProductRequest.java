package com.jvnc.catalog.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class ProductRequest {

    @NotBlank(message = "Mã sản phẩm không được để trống")
    @Size(max = 50, message = "Mã sản phẩm không được vượt quá 50 ký tự")
    private String sku;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200, message = "Tên sản phẩm không được vượt quá 200 ký tự")
    private String name;

    private String description;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Giá sản phẩm phải lớn hơn hoặc bằng 0"
    )
    private BigDecimal price;

    @Size(max = 500, message = "Đường dẫn ảnh không được vượt quá 500 ký tự")
    private String imageUrl;

    @NotNull(message = "Danh mục không được để trống")
    @Positive(message = "Mã danh mục phải là số dương")
    private Long categoryId;

    @NotNull(message = "Thương hiệu không được để trống")
    @Positive(message = "Mã thương hiệu phải là số dương")
    private Long brandId;

    @Pattern(
            regexp = "ACTIVE|INACTIVE",
            message = "Trạng thái phải là ACTIVE hoặc INACTIVE"
    )
    private String status;

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getBrandId() {
        return brandId;
    }

    public void setBrandId(Long brandId) {
        this.brandId = brandId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}