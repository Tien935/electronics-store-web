package com.jvnc.catalog.service;

import com.jvnc.catalog.dto.request.CategoryRequest;
import com.jvnc.catalog.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    // API công khai chỉ lấy danh mục ACTIVE
    List<CategoryResponse> getAllActiveCategories();

    // API admin lấy cả ACTIVE và INACTIVE
    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(
            Long id,
            CategoryRequest request
    );

    void deactivateCategory(Long id);
}