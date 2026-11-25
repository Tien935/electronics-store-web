package com.jvnc.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AdminUpdateStatusRequest(
        @NotBlank @Pattern(regexp = "ACTIVE|INACTIVE") String status
) {}