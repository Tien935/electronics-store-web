package com.jvnc.catalog.service;

import com.jvnc.catalog.dto.response.BrandResponse;

import java.util.List;

public interface BrandService {

    List<BrandResponse> getAllActiveBrands();
}