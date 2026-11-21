package com.techmart.product.controller;

import com.techmart.product.dto.request.CreateProductRequest;
import com.techmart.product.dto.request.UpdateProductRequest;
import com.techmart.product.dto.response.ApiResponse;
import com.techmart.product.dto.response.ProductResponse;
import com.techmart.product.entity.ProductStatus;
import com.techmart.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse res = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sản phẩm mới thành công", res));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse res = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductByCode(@PathVariable String code) {
        ProductResponse res = productService.getProductByCode(code);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ProductResponse res = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) ProductStatus status) {
        List<ProductResponse> list = productService.getAllProducts(keyword, categoryId, brandId, status);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công", list));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        ProductResponse res = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông tin sản phẩm thành công", res));
    }

    @PatchMapping("/{id}/specs")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductSpecs(
            @PathVariable Long id,
            @RequestBody Map<String, Object> specs) {
        ProductResponse res = productService.updateProductSpecs(id, specs);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông số kỹ thuật JSON thành công", res));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }
}
