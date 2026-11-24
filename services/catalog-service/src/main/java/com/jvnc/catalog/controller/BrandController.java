package com.jvnc.catalog.controller;

import com.jvnc.catalog.dto.response.BrandResponse;
import com.jvnc.catalog.service.BrandService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(
            BrandService brandService
    ) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<List<BrandResponse>>
    getAllActiveBrands() {

        return ResponseEntity.ok(
                brandService.getAllActiveBrands()
        );
    }
}