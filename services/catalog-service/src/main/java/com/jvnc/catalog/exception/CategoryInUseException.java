package com.jvnc.catalog.exception;

public class CategoryInUseException extends RuntimeException {

    public CategoryInUseException(Long categoryId) {
        super(
                "Không thể ngừng hoạt động danh mục ID "
                        + categoryId
                        + " vì vẫn đang có sản phẩm liên kết"
        );
    }
}