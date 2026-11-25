package com.jvnc.identity.service;

import com.jvnc.identity.dto.request.AdminCreateUserRequest;
import com.jvnc.identity.dto.request.AdminUpdateStatusRequest;
import com.jvnc.identity.dto.request.AdminUpdateUserRequest;
import com.jvnc.identity.dto.response.AdminUserResponse;
import com.jvnc.identity.model.Role;

import java.util.List;

public interface AdminUserService {

    List<AdminUserResponse> findAll();

    AdminUserResponse findById(long id);

    AdminUserResponse create(AdminCreateUserRequest request);

    AdminUserResponse update(
            long id,
            AdminUpdateUserRequest request,
            long currentAdminId
    );

    AdminUserResponse updateStatus(
            long id,
            AdminUpdateStatusRequest request,
            long currentAdminId
    );

    void delete(long id, long currentAdminId);

    List<Role> findAllRoles();
}