package com.jvnc.identity.dao;

import com.jvnc.identity.model.User;

import java.util.List;
import java.util.Optional;

public interface UserDao {

    long create(User user);

    Optional<User> findById(long id);

    Optional<User> findByEmail(String email);

    List<User> findAll();

    boolean update(User user);

    boolean updateStatus(long id, String status);

    boolean deleteById(long id);

    boolean existsByEmail(String email);

    long countActiveUsersByRoleCode(String roleCode);
}
