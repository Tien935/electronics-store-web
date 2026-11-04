package com.jvnc.identity.dao;

import com.jvnc.identity.model.Role;

import java.util.List;
import java.util.Optional;

public interface RoleDao {

    Optional<Role> findByCode(String code);

    List<Role> findByUserId(long userId);

    void assignRoleToUser(long userId, long roleId);
}