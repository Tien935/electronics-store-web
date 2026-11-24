package com.jvnc.catalog.dao.impl;

import com.jvnc.catalog.dao.CategoryDao;
import com.jvnc.catalog.model.Category;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcCategoryDao implements CategoryDao {

    private final JdbcTemplate jdbcTemplate;

    public JdbcCategoryDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Category> categoryRowMapper =
            (resultSet, rowNum) -> {
                Category category = new Category();

                category.setId(resultSet.getLong("id"));
                category.setName(resultSet.getString("name"));
                category.setSlug(resultSet.getString("slug"));
                category.setDescription(
                        resultSet.getString("description")
                );
                category.setStatus(resultSet.getString("status"));

                return category;
            };

    @Override
    public List<Category> findAllActive() {
        String sql = """
                SELECT id, name, slug, description, status
                FROM categories
                WHERE status = 'ACTIVE'
                ORDER BY name
                """;

        return jdbcTemplate.query(sql, categoryRowMapper);
    }

    @Override
    public Optional<Category> findById(Long id) {
        String sql = """
                SELECT id, name, slug, description, status
                FROM categories
                WHERE id = ?
                """;

        return jdbcTemplate
                .query(sql, categoryRowMapper, id)
                .stream()
                .findFirst();
    }

    @Override
    public boolean existsById(Long id) {
        String sql = """
                SELECT COUNT(*)
                FROM categories
                WHERE id = ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                id
        );

        return count != null && count > 0;
    }
    @Override
    public List<Category> findAll() {
        String sql = """
            SELECT id, name, slug, description, status
            FROM categories
            ORDER BY name
            """;

        return jdbcTemplate.query(sql, categoryRowMapper);
    }

    @Override
    public boolean existsBySlug(String slug) {
        String sql = """
            SELECT COUNT(*)
            FROM categories
            WHERE LOWER(slug) = LOWER(?)
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                slug
        );

        return count != null && count > 0;
    }

    @Override
    public boolean existsBySlugAndIdNot(String slug, Long id) {
        String sql = """
            SELECT COUNT(*)
            FROM categories
            WHERE LOWER(slug) = LOWER(?)
              AND id <> ?
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                slug,
                id
        );

        return count != null && count > 0;
    }

    @Override
    public Long create(Category category) {
        String sql = """
            INSERT INTO categories (
                name,
                slug,
                description,
                status
            )
            VALUES (?, ?, ?, ?)
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int affectedRows = jdbcTemplate.update(
                connection -> {
                    var statement = connection.prepareStatement(
                            sql,
                            Statement.RETURN_GENERATED_KEYS
                    );

                    statement.setString(1, category.getName());
                    statement.setString(2, category.getSlug());
                    statement.setString(3, category.getDescription());
                    statement.setString(4, category.getStatus());

                    return statement;
                },
                keyHolder
        );

        Number generatedId = keyHolder.getKey();

        if (affectedRows == 0 || generatedId == null) {
            throw new IllegalStateException(
                    "Không thể lấy ID của danh mục vừa tạo"
            );
        }

        return generatedId.longValue();
    }

    @Override
    public boolean update(Category category) {
        String sql = """
            UPDATE categories
            SET name = ?,
                slug = ?,
                description = ?,
                status = ?
            WHERE id = ?
            """;

        int affectedRows = jdbcTemplate.update(
                sql,
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getStatus(),
                category.getId()
        );

        return affectedRows > 0;
    }

    @Override
    public boolean deactivateById(Long id) {
        String sql = """
            UPDATE categories
            SET status = 'INACTIVE'
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, id) > 0;
    }

    @Override
    public boolean hasLinkedProducts(Long categoryId) {
        String sql = """
            SELECT COUNT(*)
            FROM products
            WHERE category_id = ?
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                categoryId
        );

        return count != null && count > 0;
    }
}