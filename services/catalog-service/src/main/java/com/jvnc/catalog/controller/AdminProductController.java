package com.jvnc.catalog.controller;

import com.jvnc.catalog.dto.request.ProductRequest;
import com.jvnc.catalog.dto.response.ProductResponse;
import com.jvnc.catalog.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(
            ProductService productService
    ) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>>
    getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProductsForAdmin()
        );
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        return ResponseEntity.ok(
                productService.updateProduct(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateProduct(
            @PathVariable Long id
    ) {
        productService.deactivateProduct(id);

        return ResponseEntity.noContent().build();
    }
}