package com.jvnc.catalog.service;

import com.jvnc.catalog.dto.request.ProductRequest;
import com.jvnc.catalog.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    List<ProductResponse> getAllActiveProducts();

    List<ProductResponse> getAllProductsForAdmin();

    ProductResponse getProductById(Long id);

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(
            Long id,
            ProductRequest request
    );

    void deactivateProduct(Long id);
}