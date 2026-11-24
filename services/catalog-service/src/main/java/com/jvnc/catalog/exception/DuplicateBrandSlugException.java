package com.jvnc.catalog.exception;

public class DuplicateBrandSlugException extends RuntimeException {

    public DuplicateBrandSlugException(String slug) {
        super("Slug thương hiệu đã tồn tại: " + slug);
    }
}