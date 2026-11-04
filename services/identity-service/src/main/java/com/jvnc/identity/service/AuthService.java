package com.jvnc.identity.service;

import com.jvnc.identity.dto.request.RegisterRequest;
import com.jvnc.identity.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);
}