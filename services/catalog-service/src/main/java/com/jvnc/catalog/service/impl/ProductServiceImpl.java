package com.jvnc.catalog.service.impl;

import com.jvnc.catalog.dao.BrandDao;
import com.jvnc.catalog.dao.CategoryDao;
import com.jvnc.catalog.dao.ProductDao;
import com.jvnc.catalog.dto.request.ProductRequest;
import com.jvnc.catalog.dto.response.ProductResponse;
import com.jvnc.catalog.exception.BrandNotFoundException;
import com.jvnc.catalog.exception.CategoryNotFoundException;
import com.jvnc.catalog.exception.DuplicateSkuException;
import com.jvnc.catalog.exception.ProductNotFoundException;
import com.jvnc.catalog.model.Brand;
import com.jvnc.catalog.model.Category;
import com.jvnc.catalog.model.Product;
import com.jvnc.catalog.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductDao productDao;
    private final CategoryDao categoryDao;
    private final BrandDao brandDao;

    public ProductServiceImpl(
            ProductDao productDao,
            CategoryDao categoryDao,
            BrandDao brandDao
    ) {
        this.productDao = productDao;
        this.categoryDao = categoryDao;
        this.brandDao = brandDao;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllActiveProducts() {
        return productDao
                .findAllActive()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProductsForAdmin() {
        return productDao
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = findProductById(id);

        if (!"ACTIVE".equals(product.getStatus())) {
            throw new ProductNotFoundException(id);
        }

        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String normalizedSku = normalizeSku(request.getSku());

        if (productDao.existsBySku(normalizedSku)) {
            throw new DuplicateSkuException(normalizedSku);
        }

        validateCategoryAndBrand(
                request.getCategoryId(),
                request.getBrandId()
        );

        Product product = new Product();

        product.setSku(normalizedSku);
        product.setName(request.getName().trim());
        product.setDescription(
                trimToNull(request.getDescription())
        );
        product.setPrice(request.getPrice());
        product.setImageUrl(
                trimToNull(request.getImageUrl())
        );
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());
        product.setStatus(
                request.getStatus() == null
                        ? "ACTIVE"
                        : request.getStatus()
        );

        long productId = productDao.create(product);

        Product createdProduct = findProductById(productId);

        return toResponse(createdProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request
    ) {
        Product product = findProductById(id);

        String normalizedSku = normalizeSku(request.getSku());

        if (productDao.existsBySkuAndIdNot(
                normalizedSku,
                id
        )) {
            throw new DuplicateSkuException(normalizedSku);
        }

        validateCategoryAndBrand(
                request.getCategoryId(),
                request.getBrandId()
        );

        product.setSku(normalizedSku);
        product.setName(request.getName().trim());
        product.setDescription(
                trimToNull(request.getDescription())
        );
        product.setPrice(request.getPrice());
        product.setImageUrl(
                trimToNull(request.getImageUrl())
        );
        product.setCategoryId(request.getCategoryId());
        product.setBrandId(request.getBrandId());

        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        boolean updated = productDao.update(product);

        if (!updated) {
            throw new ProductNotFoundException(id);
        }

        Product updatedProduct = findProductById(id);

        return toResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void deactivateProduct(Long id) {
        Product product = findProductById(id);

        if ("INACTIVE".equals(product.getStatus())) {
            return;
        }

        boolean deactivated = productDao.deactivateById(id);

        if (!deactivated) {
            throw new ProductNotFoundException(id);
        }
    }

    private Product findProductById(Long id) {
        return productDao
                .findById(id)
                .orElseThrow(
                        () -> new ProductNotFoundException(id)
                );
    }

    private void validateCategoryAndBrand(
            Long categoryId,
            Long brandId
    ) {
        if (!categoryDao.existsById(categoryId)) {
            throw new CategoryNotFoundException(categoryId);
        }

        if (!brandDao.existsById(brandId)) {
            throw new BrandNotFoundException(brandId);
        }
    }

    private ProductResponse toResponse(Product product) {
        Category category = categoryDao
                .findById(product.getCategoryId())
                .orElseThrow(
                        () -> new CategoryNotFoundException(
                                product.getCategoryId()
                        )
                );

        Brand brand = brandDao
                .findById(product.getBrandId())
                .orElseThrow(
                        () -> new BrandNotFoundException(
                                product.getBrandId()
                        )
                );

        ProductResponse response = new ProductResponse();

        response.setId(product.getId());
        response.setSku(product.getSku());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setImageUrl(product.getImageUrl());

        response.setCategoryId(category.getId());
        response.setCategoryName(category.getName());

        response.setBrandId(brand.getId());
        response.setBrandName(brand.getName());

        response.setStatus(product.getStatus());
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        return response;
    }

    private String normalizeSku(String sku) {
        return sku
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }
}