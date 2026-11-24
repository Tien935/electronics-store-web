package com.jvnc.identity.dto.response;

import java.util.List;

public class UserResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String status;
    private List<String> roles;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String email,
            String fullName,
            String phone,
            String status,
            List<String> roles
    ) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.status = status;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}