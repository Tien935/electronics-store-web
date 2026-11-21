package com.techmart.product.service;

import com.techmart.product.dto.request.CreateVariantRequest;
import com.techmart.product.dto.request.UpdateVariantRequest;
import com.techmart.product.dto.response.ProductVariantResponse;

import java.util.List;

public interface ProductVariantService {
    ProductVariantResponse createVariant(Long productId, CreateVariantRequest request);
    ProductVariantResponse getVariantById(Long id);
    ProductVariantResponse getVariantBySku(String sku);
    List<ProductVariantResponse> getVariantsByProductId(Long productId);
    ProductVariantResponse updateVariant(Long id, UpdateVariantRequest request);
    void deleteVariant(Long id);
}
