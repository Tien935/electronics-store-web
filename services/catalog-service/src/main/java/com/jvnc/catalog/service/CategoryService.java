package com.jvnc.catalog.service;

import com.jvnc.catalog.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllActiveCategories();
}