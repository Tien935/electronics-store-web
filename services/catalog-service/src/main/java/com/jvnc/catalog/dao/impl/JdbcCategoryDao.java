package com.jvnc.catalog.dao.impl;

import com.jvnc.catalog.dao.CategoryDao;
import com.jvnc.catalog.model.Category;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

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
}