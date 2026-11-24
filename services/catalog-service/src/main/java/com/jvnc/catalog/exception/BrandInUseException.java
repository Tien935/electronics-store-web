package com.jvnc.catalog.exception;

public class BrandInUseException extends RuntimeException {

    public BrandInUseException(Long brandId) {
        super(
                "Không thể ngừng hoạt động thương hiệu ID "
                        + brandId
                        + " vì vẫn đang có sản phẩm liên kết"
        );
    }
}