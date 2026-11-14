package com.jvnc.identity.service.impl;

import com.jvnc.identity.dao.RoleDao;
import com.jvnc.identity.dao.UserDao;
import com.jvnc.identity.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.jvnc.identity.dto.request.RegisterRequest;
import com.jvnc.identity.dto.response.UserResponse;
import com.jvnc.identity.model.Role;
import com.jvnc.identity.model.User;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.jvnc.identity.dto.request.LoginRequest;
import com.jvnc.identity.dto.response.LoginResponse;

import java.util.List;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserDao userDao;

    @Mock
    private RoleDao roleDao;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userDao,
                roleDao,
                passwordEncoder,
                jwtService
        );
    }
    @Test
    void register_WhenDataIsValid_ShouldCreateCustomerAccount() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("  Customer@Example.com  ");
        request.setPassword("123456");
        request.setFullName("  Nguyễn Văn A  ");
        request.setPhone("0912345678");

        Role customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setCode("CUSTOMER");
        customerRole.setName("Khách hàng");

        when(userDao.existsByEmail("customer@example.com"))
                .thenReturn(false);
        when(roleDao.findByCode("CUSTOMER"))
                .thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode("123456"))
                .thenReturn("$2a$10$encodedPassword");
        when(userDao.create(any(User.class)))
                .thenReturn(10L);

        UserResponse response = authService.register(request);

        assertEquals(10L, response.getId());
        assertEquals("customer@example.com", response.getEmail());
        assertEquals("Nguyễn Văn A", response.getFullName());
        assertEquals("0912345678", response.getPhone());
        assertEquals("ACTIVE", response.getStatus());
        assertEquals("CUSTOMER", response.getRoles().getFirst());

        verify(userDao).create(any(User.class));
        verify(roleDao).assignRoleToUser(10L, 1L);
    }
    @Test
    void login_WhenCredentialsAreValid_ShouldReturnJwtAndUser() {
        LoginRequest request = new LoginRequest();
        request.setEmail("  Customer@Example.com  ");
        request.setPassword("123456");

        User user = new User();
        user.setId(10L);
        user.setEmail("customer@example.com");
        user.setPasswordHash("$2a$10$encodedPassword");
        user.setFullName("Nguyễn Văn A");
        user.setPhone("0912345678");
        user.setStatus("ACTIVE");

        Role customerRole = new Role();
        customerRole.setId(1L);
        customerRole.setCode("CUSTOMER");
        customerRole.setName("Khách hàng");

        when(userDao.findByEmail("customer@example.com"))
                .thenReturn(Optional.of(user));
        when(passwordEncoder.matches(
                "123456",
                "$2a$10$encodedPassword"
        )).thenReturn(true);
        when(roleDao.findByUserId(10L))
                .thenReturn(List.of(customerRole));
        when(jwtService.generateAccessToken(
                user,
                List.of("CUSTOMER")
        )).thenReturn("test-access-token");
        when(jwtService.getExpirationSeconds())
                .thenReturn(3600L);

        LoginResponse response = authService.login(request);

        assertEquals("test-access-token", response.getAccessToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(3600L, response.getExpiresIn());
        assertEquals(10L, response.getUser().getId());
        assertEquals(
                "customer@example.com",
                response.getUser().getEmail()
        );
        assertEquals(
                "CUSTOMER",
                response.getUser().getRoles().getFirst()
        );

        verify(userDao).findByEmail("customer@example.com");
        verify(passwordEncoder).matches(
                "123456",
                "$2a$10$encodedPassword"
        );
        verify(jwtService).generateAccessToken(
                user,
                List.of("CUSTOMER")
        );
    }
}