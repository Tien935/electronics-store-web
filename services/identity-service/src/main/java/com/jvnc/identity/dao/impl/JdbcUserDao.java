package com.jvnc.identity.dao.impl;

import com.jvnc.identity.dao.UserDao;
import com.jvnc.identity.model.User;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcUserDao implements UserDao {

    private static final String SELECT_COLUMNS = """
            SELECT id, email, password_hash, full_name, phone,
                   status, created_at, updated_at
            FROM users
            """;

    private final DataSource dataSource;

    public JdbcUserDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public long create(User user) {
        String sql = """
                INSERT INTO users
                    (email, password_hash, full_name, phone, status)
                VALUES (?, ?, ?, ?, ?)
                """;

        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(
                sql,
                Statement.RETURN_GENERATED_KEYS
        )) {
            statement.setString(1, user.getEmail());
            statement.setString(2, user.getPasswordHash());
            statement.setString(3, user.getFullName());
            statement.setString(4, user.getPhone());
            statement.setString(5, user.getStatus());

            int affectedRows = statement.executeUpdate();

            if (affectedRows != 1) {
                throw new DataAccessResourceFailureException(
                        "Không thể tạo người dùng"
                );
            }

            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    return generatedKeys.getLong(1);
                }
            }

            throw new DataAccessResourceFailureException(
                    "Không lấy được ID người dùng vừa tạo"
            );
        } catch (SQLException exception) {
            throw databaseException("Lỗi khi tạo người dùng", exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public Optional<User> findById(long id) {
        String sql = SELECT_COLUMNS + " WHERE id = ?";
        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapUser(resultSet));
                }

                return Optional.empty();
            }
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi tìm người dùng theo ID",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = SELECT_COLUMNS + " WHERE email = ?";
        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);

            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapUser(resultSet));
                }

                return Optional.empty();
            }
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi tìm người dùng theo email",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public List<User> findAll() {
        String sql = SELECT_COLUMNS + " ORDER BY id DESC";
        List<User> users = new ArrayList<>();
        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (
                PreparedStatement statement = connection.prepareStatement(sql);
                ResultSet resultSet = statement.executeQuery()
        ) {
            while (resultSet.next()) {
                users.add(mapUser(resultSet));
            }

            return users;
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi lấy danh sách người dùng",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public boolean update(User user) {
        String sql = """
                UPDATE users
                SET email = ?,
                    password_hash = ?,
                    full_name = ?,
                    phone = ?,
                    status = ?
                WHERE id = ?
                """;

        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, user.getEmail());
            statement.setString(2, user.getPasswordHash());
            statement.setString(3, user.getFullName());
            statement.setString(4, user.getPhone());
            statement.setString(5, user.getStatus());
            statement.setLong(6, user.getId());

            return statement.executeUpdate() == 1;
        } catch (SQLException exception) {
            throw databaseException("Lỗi khi cập nhật người dùng", exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public boolean updateStatus(long id, String status) {
        String sql = """
                UPDATE users
                SET status = ?
                WHERE id = ?
                """;

        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, status);
            statement.setLong(2, id);

            return statement.executeUpdate() == 1;
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi cập nhật trạng thái người dùng",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public boolean deleteById(long id) {
        String sql = "DELETE FROM users WHERE id = ?";
        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, id);
            return statement.executeUpdate() == 1;
        } catch (SQLException exception) {
            throw databaseException("Lỗi khi xóa người dùng", exception);
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public boolean existsByEmail(String email) {
        String sql = """
                SELECT EXISTS(
                    SELECT 1
                    FROM users
                    WHERE email = ?
                )
                """;

        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, email);

            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getBoolean(1);
            }
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi kiểm tra email người dùng",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    @Override
    public long countActiveUsersByRoleCode(String roleCode) {
        String sql = """
                SELECT COUNT(*)
                FROM users u
                INNER JOIN user_roles ur ON ur.user_id = u.id
                INNER JOIN roles r ON r.id = ur.role_id
                WHERE u.status = 'ACTIVE'
                  AND r.code = ?
                """;

        Connection connection = DataSourceUtils.getConnection(dataSource);

        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, roleCode);

            try (ResultSet resultSet = statement.executeQuery()) {
                resultSet.next();
                return resultSet.getLong(1);
            }
        } catch (SQLException exception) {
            throw databaseException(
                    "Lỗi khi đếm người dùng theo quyền",
                    exception
            );
        } finally {
            DataSourceUtils.releaseConnection(connection, dataSource);
        }
    }

    private User mapUser(ResultSet resultSet) throws SQLException {
        User user = new User();

        user.setId(resultSet.getLong("id"));
        user.setEmail(resultSet.getString("email"));
        user.setPasswordHash(resultSet.getString("password_hash"));
        user.setFullName(resultSet.getString("full_name"));
        user.setPhone(resultSet.getString("phone"));
        user.setStatus(resultSet.getString("status"));

        Timestamp createdAt = resultSet.getTimestamp("created_at");
        Timestamp updatedAt = resultSet.getTimestamp("updated_at");

        if (createdAt != null) {
            user.setCreatedAt(createdAt.toLocalDateTime());
        }

        if (updatedAt != null) {
            user.setUpdatedAt(updatedAt.toLocalDateTime());
        }

        return user;
    }

    private DataAccessResourceFailureException databaseException(
            String message,
            SQLException exception
    ) {
        return new DataAccessResourceFailureException(message, exception);
    }
}
