package com.jvnc.catalog.exception;

public class DuplicateSkuException extends RuntimeException {

    public DuplicateSkuException(String sku) {
        super("Mã sản phẩm đã tồn tại: " + sku);
    }
}