package com.jvnc.catalog.dao;

import com.jvnc.catalog.model.Brand;

import java.util.List;
import java.util.Optional;

public interface BrandDao {

    List<Brand> findAllActive();

    Optional<Brand> findById(Long id);

    boolean existsById(Long id);
}