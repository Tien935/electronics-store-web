package com.jvnc.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
        @NotBlank @Size(max = 150) String fullName,
        @Size(max = 20) String phone,
        @NotBlank String role,
        @NotBlank @Pattern(regexp = "ACTIVE|INACTIVE") String status
) {}