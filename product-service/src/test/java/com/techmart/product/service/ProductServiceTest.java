package com.techmart.product.service;

import com.techmart.product.dto.request.CreateProductRequest;
import com.techmart.product.dto.response.ProductResponse;
import com.techmart.product.entity.Brand;
import com.techmart.product.entity.Category;
import com.techmart.product.entity.Product;
import com.techmart.product.entity.ProductStatus;
import com.techmart.product.repository.BrandRepository;
import com.techmart.product.repository.CategoryRepository;
import com.techmart.product.repository.DeviceImeiRepository;
import com.techmart.product.repository.ProductRepository;
import com.techmart.product.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private BrandRepository brandRepository;
    @Mock
    private DeviceImeiRepository imeiRepository;

    private ProductServiceImpl productService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        productService = new ProductServiceImpl(productRepository, categoryRepository, brandRepository, imeiRepository);
    }

    @Test
    @DisplayName("Test tạo sản phẩm mới có thông số kỹ thuật JSON")
    void testCreateProduct_Success() {
        CreateProductRequest req = new CreateProductRequest();
        req.setProductCode("IP16PRO");
        req.setName("iPhone 16 Pro");
        req.setSlug("iphone-16-pro");
        req.setCategoryId(1L);
        req.setBrandId(1L);
        req.setBasePrice(new BigDecimal("28990000"));
        req.setSpecs(Map.of("screen", "6.3 inch OLED", "chipset", "Apple A18 Pro", "ram", "8GB"));

        Category cat = new Category(1L, "Điện thoại", "dien-thoai", "Mô tả", null, true);
        Brand brand = new Brand(1L, "Apple", "APPLE", "USA", null, true);

        when(productRepository.existsByProductCode("IP16PRO")).thenReturn(false);
        when(productRepository.existsBySlug("iphone-16-pro")).thenReturn(false);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(cat));
        when(brandRepository.findById(1L)).thenReturn(Optional.of(brand));

        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        ProductResponse res = productService.createProduct(req);

        assertNotNull(res);
        assertEquals(10L, res.getId());
        assertEquals("IP16PRO", res.getProductCode());
        assertEquals("iPhone 16 Pro", res.getName());
        assertEquals(new BigDecimal("28990000"), res.getBasePrice());
        assertEquals("Apple A18 Pro", res.getSpecs().get("chipset"));
        assertEquals(ProductStatus.ACTIVE, res.getStatus());

        verify(productRepository).save(any(Product.class));
    }
}
