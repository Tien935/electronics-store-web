package com.techmart.product.service.impl;

import com.techmart.product.dto.request.CreateProductRequest;
import com.techmart.product.dto.request.UpdateProductRequest;
import com.techmart.product.dto.response.ProductResponse;
import com.techmart.product.dto.response.ProductVariantResponse;
import com.techmart.product.entity.Brand;
import com.techmart.product.entity.Category;
import com.techmart.product.entity.ImeiStatus;
import com.techmart.product.entity.Product;
import com.techmart.product.entity.ProductStatus;
import com.techmart.product.exception.DuplicateResourceException;
import com.techmart.product.exception.ResourceNotFoundException;
import com.techmart.product.repository.BrandRepository;
import com.techmart.product.repository.CategoryRepository;
import com.techmart.product.repository.DeviceImeiRepository;
import com.techmart.product.repository.ProductRepository;
import com.techmart.product.service.ProductService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final DeviceImeiRepository imeiRepository;

    public ProductServiceImpl(ProductRepository productRepository,
                              CategoryRepository categoryRepository,
                              BrandRepository brandRepository,
                              DeviceImeiRepository imeiRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.imeiRepository = imeiRepository;
    }

    @Override
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsByProductCode(request.getProductCode())) {
            throw new DuplicateResourceException("Mã sản phẩm [" + request.getProductCode() + "] đã tồn tại");
        }
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new DuplicateResourceException("Slug [" + request.getSlug() + "] đã tồn tại");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục ID=" + request.getCategoryId()));

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu ID=" + request.getBrandId()));

        Product product = new Product();
        product.setProductCode(request.getProductCode().trim().toUpperCase());
        product.setName(request.getName().trim());
        product.setSlug(request.getSlug().trim().toLowerCase());
        product.setCategory(category);
        product.setBrand(brand);
        product.setBasePrice(request.getBasePrice());
        product.setDescription(request.getDescription());
        product.setThumbnailUrl(request.getThumbnailUrl());
        product.setSpecs(request.getSpecs() != null ? request.getSpecs() : Map.of());
        product.setStatus(ProductStatus.ACTIVE);

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID=" + id));
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductByCode(String code) {
        Product product = productRepository.findByProductCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm mã=" + code));
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm slug=" + slug));
        return mapToResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(String keyword, Long categoryId, Long brandId, ProductStatus status) {
        List<Product> products = productRepository.searchProducts(keyword, categoryId, brandId, status);
        return products.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID=" + id));

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục ID=" + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thương hiệu ID=" + request.getBrandId()));
            product.setBrand(brand);
        }

        product.setName(request.getName().trim());
        product.setBasePrice(request.getBasePrice());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getThumbnailUrl() != null) product.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getSpecs() != null) product.setSpecs(request.getSpecs());
        if (request.getStatus() != null) product.setStatus(request.getStatus());

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    public ProductResponse updateProductSpecs(Long id, Map<String, Object> specs) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID=" + id));
        product.setSpecs(specs);
        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Override
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID=" + id));
        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product p) {
        ProductResponse res = new ProductResponse();
        res.setId(p.getId());
        res.setProductCode(p.getProductCode());
        res.setName(p.getName());
        res.setSlug(p.getSlug());
        if (p.getCategory() != null) {
            res.setCategoryId(p.getCategory().getId());
            res.setCategoryName(p.getCategory().getName());
        }
        if (p.getBrand() != null) {
            res.setBrandId(p.getBrand().getId());
            res.setBrandName(p.getBrand().getName());
        }
        res.setBasePrice(p.getBasePrice());
        res.setDescription(p.getDescription());
        res.setThumbnailUrl(p.getThumbnailUrl());
        res.setSpecs(p.getSpecs());
        res.setStatus(p.getStatus());
        res.setStatusDescription(p.getStatus() != null ? p.getStatus().getDescription() : null);
        res.setCreatedAt(p.getCreatedAt());
        res.setUpdatedAt(p.getUpdatedAt());

        if (p.getVariants() != null) {
            List<ProductVariantResponse> variantResponses = p.getVariants().stream().map(v -> {
                ProductVariantResponse vr = new ProductVariantResponse();
                vr.setId(v.getId());
                vr.setProductId(p.getId());
                vr.setSku(v.getSku());
                vr.setVariantName(v.getVariantName());
                vr.setColor(v.getColor());
                vr.setStorage(v.getStorage());
                vr.setRam(v.getRam());
                vr.setPrice(v.getPrice());
                vr.setOriginalPrice(v.getOriginalPrice());
                vr.setImageUrl(v.getImageUrl());
                vr.setIsActive(v.getIsActive());
                long inStock = imeiRepository.countByVariantIdAndStatus(v.getId(), ImeiStatus.IN_STOCK);
                vr.setInStockCount(inStock);
                return vr;
            }).collect(Collectors.toList());
            res.setVariants(variantResponses);
        }
        return res;
    }
}
