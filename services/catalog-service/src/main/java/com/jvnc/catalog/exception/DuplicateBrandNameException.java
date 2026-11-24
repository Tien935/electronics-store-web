package com.jvnc.catalog.exception;

public class DuplicateBrandNameException extends RuntimeException {

    public DuplicateBrandNameException(String name) {
        super("Tên thương hiệu đã tồn tại: " + name);
    }
}