package com.jvnc.catalog.service.impl;

import com.jvnc.catalog.dao.BrandDao;
import com.jvnc.catalog.dto.response.BrandResponse;
import com.jvnc.catalog.model.Brand;
import com.jvnc.catalog.service.BrandService;
import org.springframework.stereotype.Service;

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