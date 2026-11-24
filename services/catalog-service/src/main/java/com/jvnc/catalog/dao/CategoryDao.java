package com.jvnc.catalog.dao;

import com.jvnc.catalog.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryDao {

    // Dùng cho trang bán hàng công khai
    List<Category> findAllActive();

    // Dùng cho trang quản trị, gồm cả ACTIVE và INACTIVE
    List<Category> findAll();

    Optional<Category> findById(Long id);

    boolean existsById(Long id);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    // Trả về ID của danh mục vừa được tạo
    Long create(Category category);

    boolean update(Category category);

    boolean deactivateById(Long id);

    // Kiểm tra danh mục có đang được sản phẩm sử dụng hay không
    boolean hasLinkedProducts(Long categoryId);
}