package com.jvnc.catalog.service.impl;

import com.jvnc.catalog.dao.BrandDao;
import com.jvnc.catalog.dto.request.BrandRequest;
import com.jvnc.catalog.dto.response.BrandResponse;
import com.jvnc.catalog.exception.BrandInUseException;
import com.jvnc.catalog.exception.BrandNotFoundException;
import com.jvnc.catalog.exception.DuplicateBrandNameException;
import com.jvnc.catalog.exception.DuplicateBrandSlugException;
import com.jvnc.catalog.model.Brand;
import com.jvnc.catalog.service.BrandService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BrandServiceImpl implements BrandService {

    private final BrandDao brandDao;

    public BrandServiceImpl(BrandDao brandDao) {
        this.brandDao = brandDao;
    }

    @Override
    public List<BrandResponse> getAllActiveBrands() {
        return brandDao
                .findAllActive()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<BrandResponse> getAllBrands() {
        return brandDao
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BrandResponse getBrandById(Long id) {
        Brand brand = brandDao
                .findById(id)
                .orElseThrow(
                        () -> new BrandNotFoundException(id)
                );

        return toResponse(brand);
    }

    @Override
    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        String normalizedName = request.name().trim();
        String normalizedSlug = request.slug()
                .trim()
                .toLowerCase();

        if (brandDao.existsByName(normalizedName)) {
            throw new DuplicateBrandNameException(normalizedName);
        }

        if (brandDao.existsBySlug(normalizedSlug)) {
            throw new DuplicateBrandSlugException(normalizedSlug);
        }

        Brand brand = new Brand();
        brand.setName(normalizedName);
        brand.setSlug(normalizedSlug);
        brand.setLogoUrl(normalizeLogoUrl(request.logoUrl()));
        brand.setStatus(request.status().trim().toUpperCase());

        Long generatedId = brandDao.create(brand);

        Brand createdBrand = brandDao
                .findById(generatedId)
                .orElseThrow(
                        () -> new BrandNotFoundException(generatedId)
                );

        return toResponse(createdBrand);
    }

    @Override
    @Transactional
    public BrandResponse updateBrand(
            Long id,
            BrandRequest request
    ) {
        Brand brand = brandDao
                .findById(id)
                .orElseThrow(
                        () -> new BrandNotFoundException(id)
                );

        String normalizedName = request.name().trim();
        String normalizedSlug = request.slug()
                .trim()
                .toLowerCase();

        if (brandDao.existsByNameAndIdNot(normalizedName, id)) {
            throw new DuplicateBrandNameException(normalizedName);
        }

        if (brandDao.existsBySlugAndIdNot(normalizedSlug, id)) {
            throw new DuplicateBrandSlugException(normalizedSlug);
        }

        brand.setName(normalizedName);
        brand.setSlug(normalizedSlug);
        brand.setLogoUrl(normalizeLogoUrl(request.logoUrl()));
        brand.setStatus(request.status().trim().toUpperCase());

        boolean updated = brandDao.update(brand);

        if (!updated) {
            throw new BrandNotFoundException(id);
        }

        return toResponse(brand);
    }

    @Override
    @Transactional
    public void deactivateBrand(Long id) {
        if (!brandDao.existsById(id)) {
            throw new BrandNotFoundException(id);
        }

        if (brandDao.hasLinkedProducts(id)) {
            throw new BrandInUseException(id);
        }

        boolean deactivated = brandDao.deactivateById(id);

        if (!deactivated) {
            throw new BrandNotFoundException(id);
        }
    }

    private String normalizeLogoUrl(String logoUrl) {
        if (logoUrl == null) {
            return null;
        }

        String normalizedLogoUrl = logoUrl.trim();

        return normalizedLogoUrl.isEmpty()
                ? null
                : normalizedLogoUrl;
    }

    private BrandResponse toResponse(Brand brand) {
        BrandResponse response = new BrandResponse();

        response.setId(brand.getId());
        response.setName(brand.getName());
        response.setSlug(brand.getSlug());
        response.setLogoUrl(brand.getLogoUrl());
        response.setStatus(brand.getStatus());

        return response;
    }
}