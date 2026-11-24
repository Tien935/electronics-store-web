package com.jvnc.catalog.service;

import com.jvnc.catalog.dto.request.BrandRequest;
import com.jvnc.catalog.dto.response.BrandResponse;

import java.util.List;

public interface BrandService {

    // API công khai chỉ lấy thương hiệu ACTIVE
    List<BrandResponse> getAllActiveBrands();

    // API quản trị lấy cả ACTIVE và INACTIVE
    List<BrandResponse> getAllBrands();

    BrandResponse getBrandById(Long id);

    BrandResponse createBrand(BrandRequest request);

    BrandResponse updateBrand(
            Long id,
            BrandRequest request
    );

    void deactivateBrand(Long id);
}