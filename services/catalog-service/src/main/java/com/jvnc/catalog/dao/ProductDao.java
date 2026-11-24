package com.jvnc.catalog.dao;

import com.jvnc.catalog.model.Product;

import java.util.List;
import java.util.Optional;

public interface ProductDao {

    List<Product> findAll();

    List<Product> findAllActive();

    Optional<Product> findById(Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long excludedId);

    long create(Product product);

    boolean update(Product product);

    boolean deactivateById(Long id);
}