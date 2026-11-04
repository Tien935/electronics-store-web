package com.jvnc.identity.service.impl;

import com.jvnc.identity.dao.RoleDao;
import com.jvnc.identity.dao.UserDao;
import com.jvnc.identity.dto.request.RegisterRequest;
import com.jvnc.identity.dto.response.UserResponse;
import com.jvnc.identity.exception.DuplicateEmailException;
import com.jvnc.identity.exception.RoleNotFoundException;
import com.jvnc.identity.model.Role;
import com.jvnc.identity.model.User;
import com.jvnc.identity.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String DEFAULT_ROLE = "CUSTOMER";
    private static final String DEFAULT_STATUS = "ACTIVE";

    private final UserDao userDao;
    private final RoleDao roleDao;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(
            UserDao userDao,
            RoleDao roleDao,
            PasswordEncoder passwordEncoder
    ) {
        this.userDao = userDao;
        this.roleDao = roleDao;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userDao.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException(
                    "Email đã được sử dụng"
            );
        }

        Role customerRole = roleDao.findByCode(DEFAULT_ROLE)
                .orElseThrow(() -> new RoleNotFoundException(
                        "Không tìm thấy quyền CUSTOMER"
                ));

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        user.setFullName(request.getFullName().trim());
        user.setPhone(normalizePhone(request.getPhone()));
        user.setStatus(DEFAULT_STATUS);

        long userId = userDao.create(user);

        roleDao.assignRoleToUser(
                userId,
                customerRole.getId()
        );

        return new UserResponse(
                userId,
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getStatus(),
                List.of(customerRole.getCode())
        );
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        return phone.trim();
    }
}