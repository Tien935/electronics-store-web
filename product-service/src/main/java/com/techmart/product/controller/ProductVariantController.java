package com.techmart.product.controller;

import com.techmart.product.dto.request.CreateVariantRequest;
import com.techmart.product.dto.request.UpdateVariantRequest;
import com.techmart.product.dto.response.ApiResponse;
import com.techmart.product.dto.response.ProductVariantResponse;
import com.techmart.product.service.ProductVariantService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ProductVariantController {

    private final ProductVariantService variantService;

    public ProductVariantController(ProductVariantService variantService) {
        this.variantService = variantService;
    }

    @PostMapping("/api/products/{productId}/variants")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody CreateVariantRequest request) {
        ProductVariantResponse res = variantService.createVariant(productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm biến thể mới thành công", res));
    }

    @GetMapping("/api/products/{productId}/variants")
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> getVariantsByProduct(@PathVariable Long productId) {
        List<ProductVariantResponse> list = variantService.getVariantsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách biến thể thành công", list));
    }

    @GetMapping("/api/variants/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> getVariantById(@PathVariable Long id) {
        ProductVariantResponse res = variantService.getVariantById(id);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/api/variants/sku/{sku}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> getVariantBySku(@PathVariable String sku) {
        ProductVariantResponse res = variantService.getVariantBySku(sku);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @PutMapping("/api/variants/{id}")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateVariant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVariantRequest request) {
        ProductVariantResponse res = variantService.updateVariant(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật biến thể thành công", res));
    }

    @DeleteMapping("/api/variants/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable Long id) {
        variantService.deleteVariant(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa biến thể thành công", null));
    }
}
