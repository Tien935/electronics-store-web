package com.jvnc.catalog.service.impl;

import com.jvnc.catalog.dao.CategoryDao;
import com.jvnc.catalog.dto.response.CategoryResponse;
import com.jvnc.catalog.model.Category;
import com.jvnc.catalog.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryDao categoryDao;

    public CategoryServiceImpl(CategoryDao categoryDao) {
        this.categoryDao = categoryDao;
    }

    @Override
    public List<CategoryResponse> getAllActiveCategories() {
        return categoryDao
                .findAllActive()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();

        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setStatus(category.getStatus());

        return response;
    }
}