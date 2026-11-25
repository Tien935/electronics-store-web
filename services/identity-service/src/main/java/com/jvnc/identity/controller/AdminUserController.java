package com.jvnc.identity.controller;

import com.jvnc.identity.dto.request.AdminCreateUserRequest;
import com.jvnc.identity.dto.request.AdminUpdateStatusRequest;
import com.jvnc.identity.dto.request.AdminUpdateUserRequest;
import com.jvnc.identity.dto.response.AdminUserResponse;
import com.jvnc.identity.model.Role;
import com.jvnc.identity.service.AdminUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/users")
    public List<AdminUserResponse> findAll() {
        return adminUserService.findAll();
    }

    @GetMapping("/users/{id}")
    public AdminUserResponse findById(@PathVariable long id) {
        return adminUserService.findById(id);
    }

    @PostMapping("/users")
    public ResponseEntity<AdminUserResponse> create(
            @Valid @RequestBody AdminCreateUserRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminUserService.create(request));
    }

    @PutMapping("/users/{id}")
    public AdminUserResponse update(
            @PathVariable long id,
            @Valid @RequestBody AdminUpdateUserRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return adminUserService.update(
                id,
                request,
                Long.parseLong(jwt.getSubject())
        );
    }

    @PatchMapping("/users/{id}/status")
    public AdminUserResponse updateStatus(
            @PathVariable long id,
            @Valid @RequestBody AdminUpdateStatusRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return adminUserService.updateStatus(
                id,
                request,
                Long.parseLong(jwt.getSubject())
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable long id,
            @AuthenticationPrincipal Jwt jwt
    ) {
        adminUserService.delete(id, Long.parseLong(jwt.getSubject()));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    public List<Role> findAllRoles() {
        return adminUserService.findAllRoles();
    }
}