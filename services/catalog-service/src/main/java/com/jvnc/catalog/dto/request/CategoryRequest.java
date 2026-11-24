package com.jvnc.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(

        @NotBlank(message = "Tên danh mục không được để trống")
        @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
        String name,

        @NotBlank(message = "Slug không được để trống")
        @Size(max = 120, message = "Slug không được vượt quá 120 ký tự")
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
        )
        String slug,

        @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
        String description,

        @NotBlank(message = "Trạng thái không được để trống")
        @Pattern(
                regexp = "ACTIVE|INACTIVE",
                message = "Trạng thái phải là ACTIVE hoặc INACTIVE"
        )
        String status
) {
}