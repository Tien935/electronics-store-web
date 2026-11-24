package com.jvnc.catalog.exception;

public class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(Long id) {
        super("Không tìm thấy danh mục có ID: " + id);
    }
}