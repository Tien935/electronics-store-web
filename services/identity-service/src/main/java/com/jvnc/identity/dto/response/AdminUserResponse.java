package com.jvnc.identity.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public record AdminUserResponse(
        Long id,
        String email,
        String fullName,
        String phone,
        String status,
        List<String> roles,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}