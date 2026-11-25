package com.jvnc.identity.service.impl;

import com.jvnc.identity.dao.RoleDao;
import com.jvnc.identity.dao.UserDao;
import com.jvnc.identity.dto.request.AdminCreateUserRequest;
import com.jvnc.identity.dto.request.AdminUpdateStatusRequest;
import com.jvnc.identity.dto.request.AdminUpdateUserRequest;
import com.jvnc.identity.dto.response.AdminUserResponse;
import com.jvnc.identity.exception.AdminUserOperationException;
import com.jvnc.identity.exception.DuplicateEmailException;
import com.jvnc.identity.exception.UserNotFoundException;
import com.jvnc.identity.model.Role;
import com.jvnc.identity.model.User;
import com.jvnc.identity.service.AdminUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AdminUserServiceImpl implements AdminUserService {

    private final UserDao userDao;
    private final RoleDao roleDao;
    private final PasswordEncoder passwordEncoder;

    public AdminUserServiceImpl(
            UserDao userDao,
            RoleDao roleDao,
            PasswordEncoder passwordEncoder
    ) {
        this.userDao = userDao;
        this.roleDao = roleDao;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> findAll() {
        return userDao.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse findById(long id) {
        return toResponse(requireUser(id));
    }

    @Override
    @Transactional
    public AdminUserResponse create(AdminCreateUserRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (userDao.existsByEmail(email)) {
            throw new DuplicateEmailException("Email đã được sử dụng");
        }

        Role role = requireRole(request.role());

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName().trim());
        user.setPhone(normalizePhone(request.phone()));
        user.setStatus(request.status());

        long id = userDao.create(user);
        roleDao.assignRoleToUser(id, role.getId());

        return toResponse(requireUser(id));
    }

    @Override
    @Transactional
    public AdminUserResponse update(
            long id,
            AdminUpdateUserRequest request,
            long currentAdminId
    ) {
        User user = requireUser(id);
        Role newRole = requireRole(request.role());
        boolean removingAdminRole =
                hasRole(id, "ADMIN") && !"ADMIN".equals(newRole.getCode());
        boolean deactivating =
                "ACTIVE".equals(user.getStatus())
                        && "INACTIVE".equals(request.status());

        if (id == currentAdminId &&
                (removingAdminRole || !"ACTIVE".equals(request.status()))) {
            throw new AdminUserOperationException(
                    "Bạn không thể tự khóa hoặc tự bỏ quyền ADMIN"
            );
        }

        if ("ACTIVE".equals(user.getStatus())
                && (removingAdminRole || deactivating)) {
            ensureAnotherActiveAdmin();
        }

        // Không thay đổi email và passwordHash đang lưu.
        user.setFullName(request.fullName().trim());
        user.setPhone(normalizePhone(request.phone()));
        user.setStatus(request.status());

        if (!userDao.update(user)) {
            throw new UserNotFoundException("Không tìm thấy tài khoản ID " + id);
        }

        // Form quản trị chọn một vai trò; thay thế toàn bộ vai trò cũ.
        roleDao.deleteRolesByUserId(id);
        roleDao.assignRoleToUser(id, newRole.getId());

        return toResponse(requireUser(id));
    }

    @Override
    @Transactional
    public AdminUserResponse updateStatus(
            long id,
            AdminUpdateStatusRequest request,
            long currentAdminId
    ) {
        User user = requireUser(id);
        String newStatus = request.status();

        if (id == currentAdminId && "INACTIVE".equals(newStatus)) {
            throw new AdminUserOperationException(
                    "Bạn không thể tự khóa tài khoản đang đăng nhập"
            );
        }

        if ("ACTIVE".equals(user.getStatus())
                && "INACTIVE".equals(newStatus)
                && hasRole(id, "ADMIN")) {
            ensureAnotherActiveAdmin();
        }

        if (!userDao.updateStatus(id, newStatus)) {
            throw new UserNotFoundException("Không tìm thấy tài khoản ID " + id);
        }

        return toResponse(requireUser(id));
    }

    @Override
    @Transactional
    public void delete(long id, long currentAdminId) {
        User user = requireUser(id);

        if (id == currentAdminId) {
            throw new AdminUserOperationException(
                    "Bạn không thể tự xóa tài khoản đang đăng nhập"
            );
        }

        if ("ACTIVE".equals(user.getStatus()) && hasRole(id, "ADMIN")) {
            ensureAnotherActiveAdmin();
        }

        // user_roles và refresh_tokens có ON DELETE CASCADE trong schema.
        if (!userDao.deleteById(id)) {
            throw new UserNotFoundException("Không tìm thấy tài khoản ID " + id);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Role> findAllRoles() {
        return roleDao.findAll();
    }

    private User requireUser(long id) {
        return userDao.findById(id)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy tài khoản ID " + id
                ));
    }

    private Role requireRole(String code) {
        String normalizedCode = code.trim().toUpperCase(Locale.ROOT);

        return roleDao.findByCode(normalizedCode)
                .orElseThrow(() -> new AdminUserOperationException(
                        "Vai trò không hợp lệ: " + normalizedCode
                ));
    }

    private boolean hasRole(long userId, String roleCode) {
        return roleDao.findByUserId(userId).stream()
                .anyMatch(role -> roleCode.equals(role.getCode()));
    }

    private void ensureAnotherActiveAdmin() {
        if (userDao.countActiveUsersByRoleCode("ADMIN") <= 1) {
            throw new AdminUserOperationException(
                    "Không thể loại bỏ Admin đang hoạt động cuối cùng"
            );
        }
    }

    private String normalizePhone(String phone) {
        return phone == null || phone.isBlank() ? null : phone.trim();
    }

    private AdminUserResponse toResponse(User user) {
        List<String> roles = roleDao.findByUserId(user.getId()).stream()
                .map(Role::getCode)
                .toList();

        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getStatus(),
                roles,
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}