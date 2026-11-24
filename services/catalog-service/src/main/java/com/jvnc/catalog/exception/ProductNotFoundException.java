package com.jvnc.catalog.exception;

public class ProductNotFoundException extends RuntimeException {

    public ProductNotFoundException(Long id) {
        super("Không tìm thấy sản phẩm có ID: " + id);
    }
}