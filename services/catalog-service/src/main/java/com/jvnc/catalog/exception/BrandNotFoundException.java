package com.jvnc.catalog.exception;

public class BrandNotFoundException extends RuntimeException {

    public BrandNotFoundException(Long id) {
        super("Không tìm thấy thương hiệu có ID: " + id);
    }
}