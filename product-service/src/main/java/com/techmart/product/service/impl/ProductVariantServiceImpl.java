package com.techmart.product.service.impl;

import com.techmart.product.dto.request.CreateVariantRequest;
import com.techmart.product.dto.request.UpdateVariantRequest;
import com.techmart.product.dto.response.ProductVariantResponse;
import com.techmart.product.entity.ImeiStatus;
import com.techmart.product.entity.Product;
import com.techmart.product.entity.ProductVariant;
import com.techmart.product.exception.DuplicateResourceException;
import com.techmart.product.exception.ResourceNotFoundException;
import com.techmart.product.repository.DeviceImeiRepository;
import com.techmart.product.repository.ProductRepository;
import com.techmart.product.repository.ProductVariantRepository;
import com.techmart.product.service.ProductVariantService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductVariantServiceImpl implements ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final DeviceImeiRepository imeiRepository;

    public ProductVariantServiceImpl(ProductVariantRepository variantRepository,
                                     ProductRepository productRepository,
                                     DeviceImeiRepository imeiRepository) {
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
        this.imeiRepository = imeiRepository;
    }

    @Override
    public ProductVariantResponse createVariant(Long productId, CreateVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm ID=" + productId));

        if (variantRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Mã SKU [" + request.getSku() + "] đã tồn tại");
        }

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setSku(request.getSku().trim().toUpperCase());
        variant.setVariantName(request.getVariantName().trim());
        variant.setColor(request.getColor().trim());
        variant.setStorage(request.getStorage());
        variant.setRam(request.getRam());
        variant.setPrice(request.getPrice());
        variant.setOriginalPrice(request.getOriginalPrice() != null ? request.getOriginalPrice() : request.getPrice());
        variant.setImageUrl(request.getImageUrl());
        variant.setIsActive(true);

        ProductVariant saved = variantRepository.save(variant);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponse getVariantById(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể ID=" + id));
        return mapToResponse(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductVariantResponse getVariantBySku(String sku) {
        ProductVariant variant = variantRepository.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể SKU=" + sku));
        return mapToResponse(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getVariantsByProductId(Long productId) {
        List<ProductVariant> variants = variantRepository.findByProductId(productId);
        return variants.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public ProductVariantResponse updateVariant(Long id, UpdateVariantRequest request) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể ID=" + id));

        if (request.getVariantName() != null) variant.setVariantName(request.getVariantName());
        if (request.getColor() != null) variant.setColor(request.getColor());
        if (request.getStorage() != null) variant.setStorage(request.getStorage());
        if (request.getRam() != null) variant.setRam(request.getRam());
        variant.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) variant.setOriginalPrice(request.getOriginalPrice());
        if (request.getImageUrl() != null) variant.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) variant.setIsActive(request.getIsActive());

        ProductVariant saved = variantRepository.save(variant);
        return mapToResponse(saved);
    }

    @Override
    public void deleteVariant(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể ID=" + id));
        variantRepository.delete(variant);
    }

    private ProductVariantResponse mapToResponse(ProductVariant v) {
        ProductVariantResponse res = new ProductVariantResponse();
        res.setId(v.getId());
        if (v.getProduct() != null) res.setProductId(v.getProduct().getId());
        res.setSku(v.getSku());
        res.setVariantName(v.getVariantName());
        res.setColor(v.getColor());
        res.setStorage(v.getStorage());
        res.setRam(v.getRam());
        res.setPrice(v.getPrice());
        res.setOriginalPrice(v.getOriginalPrice());
        res.setImageUrl(v.getImageUrl());
        res.setIsActive(v.getIsActive());

        long inStock = imeiRepository.countByVariantIdAndStatus(v.getId(), ImeiStatus.IN_STOCK);
        res.setInStockCount(inStock);
        return res;
    }
}
