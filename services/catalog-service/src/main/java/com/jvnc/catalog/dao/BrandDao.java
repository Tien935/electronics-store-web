package com.jvnc.catalog.dao;

import com.jvnc.catalog.model.Brand;

import java.util.List;
import java.util.Optional;

public interface BrandDao {

    // API công khai
    List<Brand> findAllActive();

    // API quản trị
    List<Brand> findAll();

    Optional<Brand> findById(Long id);

    boolean existsById(Long id);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    Long create(Brand brand);

    boolean update(Brand brand);

    boolean deactivateById(Long id);

    boolean hasLinkedProducts(Long brandId);
}