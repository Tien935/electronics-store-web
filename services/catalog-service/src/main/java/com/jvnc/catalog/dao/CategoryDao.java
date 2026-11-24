package com.jvnc.catalog.dao;

import com.jvnc.catalog.model.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryDao {

    List<Category> findAllActive();

    Optional<Category> findById(Long id);

    boolean existsById(Long id);
}