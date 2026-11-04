package com.jvnc.identity.dao.impl;

import com.jvnc.identity.dao.RoleDao;
import com.jvnc.identity.model.Role;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcRoleDao implements RoleDao {

    private final DataSource dataSource;

    public JdbcRoleDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public Optional<Role> findByCode(String code) {
        String sql = """
                SELECT id, code, name
                FROM roles
                WHERE code = ?
                """;

        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, code);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapRole(resultSet));
                }

                return Optional.empty();
            }
        } catch (SQLException exception) {
            throw databaseException("Lỗi khi tìm quyền theo mã", exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public List<Role> findByUserId(long userId) {
        String sql = """
                SELECT r.id, r.code, r.name
                FROM roles r
                INNER JOIN user_roles ur ON ur.role_id = r.id
                WHERE ur.user_id = ?
                ORDER BY r.id
                """;

        List<Role> roles = new ArrayList<>();
        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    roles.add(mapRole(resultSet));
                }
            }

            return roles;
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi lấy danh sách quyền của người dùng",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public void assignRoleToUser(long userId, long roleId) {
        String sql = """
                INSERT INTO user_roles (user_id, role_id)
                VALUES (?, ?)
                """;

        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, userId);
            statement.setLong(2, roleId);

            int affectedRows = statement.executeUpdate();

            if (affectedRows != 1) {
                throw new DataAccessResourceFailureException(
                        "Không thể gán quyền cho người dùng"
                );
            }
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi gán quyền cho người dùng",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    private Role mapRole(ResultSet resultSet) throws SQLException {
        Role role = new Role();

        role.setId(resultSet.getLong("id"));
        role.setCode(resultSet.getString("code"));
        role.setName(resultSet.getString("name"));

        return role;
    }

    private DataAccessResourceFailureException databaseException(
            String message,
            SQLException exception
    ) {
        return new DataAccessResourceFailureException(message, exception);
    }
}