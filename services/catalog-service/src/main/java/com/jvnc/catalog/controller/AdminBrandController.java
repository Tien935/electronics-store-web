package com.jvnc.catalog.controller;

import com.jvnc.catalog.dto.request.BrandRequest;
import com.jvnc.catalog.dto.response.BrandResponse;
import com.jvnc.catalog.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/brands")
public class AdminBrandController {

    private final BrandService brandService;

    public AdminBrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @GetMapping
    public ResponseEntity<List<BrandResponse>> getAllBrands() {
        return ResponseEntity.ok(
                brandService.getAllBrands()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandResponse> getBrandById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                brandService.getBrandById(id)
        );
    }

    @PostMapping
    public ResponseEntity<BrandResponse> createBrand(
            @Valid @RequestBody BrandRequest request
    ) {
        BrandResponse response =
                brandService.createBrand(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandResponse> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandRequest request
    ) {
        return ResponseEntity.ok(
                brandService.updateBrand(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateBrand(
            @PathVariable Long id
    ) {
        brandService.deactivateBrand(id);

        return ResponseEntity.noContent().build();
    }
}