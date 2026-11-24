package com.jvnc.catalog.service.impl;

import com.jvnc.catalog.dao.CategoryDao;
import com.jvnc.catalog.dto.request.CategoryRequest;
import com.jvnc.catalog.dto.response.CategoryResponse;
import com.jvnc.catalog.exception.CategoryInUseException;
import com.jvnc.catalog.exception.CategoryNotFoundException;
import com.jvnc.catalog.exception.DuplicateCategorySlugException;
import com.jvnc.catalog.model.Category;
import com.jvnc.catalog.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryDao
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryDao
                .findById(id)
                .orElseThrow(
                        () -> new CategoryNotFoundException(id)
                );

        return toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String normalizedSlug = request.slug()
                .trim()
                .toLowerCase();

        if (categoryDao.existsBySlug(normalizedSlug)) {
            throw new DuplicateCategorySlugException(normalizedSlug);
        }

        Category category = new Category();
        category.setName(request.name().trim());
        category.setSlug(normalizedSlug);
        category.setDescription(normalizeDescription(request.description()));
        category.setStatus(request.status().trim().toUpperCase());

        Long generatedId = categoryDao.create(category);

        Category createdCategory = categoryDao
                .findById(generatedId)
                .orElseThrow(
                        () -> new CategoryNotFoundException(generatedId)
                );

        return toResponse(createdCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(
            Long id,
            CategoryRequest request
    ) {
        Category category = categoryDao
                .findById(id)
                .orElseThrow(
                        () -> new CategoryNotFoundException(id)
                );

        String normalizedSlug = request.slug()
                .trim()
                .toLowerCase();

        if (categoryDao.existsBySlugAndIdNot(normalizedSlug, id)) {
            throw new DuplicateCategorySlugException(normalizedSlug);
        }

        category.setName(request.name().trim());
        category.setSlug(normalizedSlug);
        category.setDescription(normalizeDescription(request.description()));
        category.setStatus(request.status().trim().toUpperCase());

        boolean updated = categoryDao.update(category);

        if (!updated) {
            throw new CategoryNotFoundException(id);
        }

        return toResponse(category);
    }

    @Override
    @Transactional
    public void deactivateCategory(Long id) {
        if (!categoryDao.existsById(id)) {
            throw new CategoryNotFoundException(id);
        }

        if (categoryDao.hasLinkedProducts(id)) {
            throw new CategoryInUseException(id);
        }

        boolean deactivated = categoryDao.deactivateById(id);

        if (!deactivated) {
            throw new CategoryNotFoundException(id);
        }
    }

    private String normalizeDescription(String description) {
        if (description == null) {
            return null;
        }

        String normalizedDescription = description.trim();

        return normalizedDescription.isEmpty()
                ? null
                : normalizedDescription;
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