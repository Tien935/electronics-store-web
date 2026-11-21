package com.techmart.product.service;

import com.techmart.product.dto.request.CreateProductRequest;
import com.techmart.product.dto.request.UpdateProductRequest;
import com.techmart.product.dto.response.ProductResponse;
import com.techmart.product.entity.ProductStatus;

import java.util.List;
import java.util.Map;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse getProductById(Long id);
    ProductResponse getProductByCode(String code);
    ProductResponse getProductBySlug(String slug);
    List<ProductResponse> getAllProducts(String keyword, Long categoryId, Long brandId, ProductStatus status);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    ProductResponse updateProductSpecs(Long id, Map<String, Object> specs);
    void deleteProduct(Long id);
}
