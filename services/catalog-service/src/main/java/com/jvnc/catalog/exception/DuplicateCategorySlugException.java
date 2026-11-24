package com.jvnc.catalog.exception;

public class DuplicateCategorySlugException extends RuntimeException {

    public DuplicateCategorySlugException(String slug) {
        super("Slug danh mục đã tồn tại: " + slug);
    }
}