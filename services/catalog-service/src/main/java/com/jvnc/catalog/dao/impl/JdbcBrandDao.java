package com.jvnc.catalog.dao.impl;

import com.jvnc.catalog.dao.BrandDao;
import com.jvnc.catalog.model.Brand;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import java.sql.Statement;

@Repository
public class JdbcBrandDao implements BrandDao {

    private final JdbcTemplate jdbcTemplate;

    public JdbcBrandDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Brand> brandRowMapper =
            (resultSet, rowNum) -> {
                Brand brand = new Brand();

                brand.setId(resultSet.getLong("id"));
                brand.setName(resultSet.getString("name"));
                brand.setSlug(resultSet.getString("slug"));
                brand.setLogoUrl(resultSet.getString("logo_url"));
                brand.setStatus(resultSet.getString("status"));

                return brand;
            };

    @Override
    public List<Brand> findAllActive() {
        String sql = """
                SELECT id, name, slug, logo_url, status
                FROM brands
                WHERE status = 'ACTIVE'
                ORDER BY name
                """;

        return jdbcTemplate.query(sql, brandRowMapper);
    }

    @Override
    public Optional<Brand> findById(Long id) {
        String sql = """
                SELECT id, name, slug, logo_url, status
                FROM brands
                WHERE id = ?
                """;

        return jdbcTemplate
                .query(sql, brandRowMapper, id)
                .stream()
                .findFirst();
    }

    @Override
    public boolean existsById(Long id) {
        String sql = """
                SELECT COUNT(*)
                FROM brands
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
    public List<Brand> findAll() {
        String sql = """
            SELECT id, name, slug, logo_url, status
            FROM brands
            ORDER BY name
            """;

        return jdbcTemplate.query(sql, brandRowMapper);
    }

    @Override
    public boolean existsByName(String name) {
        String sql = """
            SELECT COUNT(*)
            FROM brands
            WHERE LOWER(name) = LOWER(?)
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                name
        );

        return count != null && count > 0;
    }

    @Override
    public boolean existsByNameAndIdNot(String name, Long id) {
        String sql = """
            SELECT COUNT(*)
            FROM brands
            WHERE LOWER(name) = LOWER(?)
              AND id <> ?
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                name,
                id
        );

        return count != null && count > 0;
    }

    @Override
    public boolean existsBySlug(String slug) {
        String sql = """
            SELECT COUNT(*)
            FROM brands
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
            FROM brands
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
    public Long create(Brand brand) {
        String sql = """
            INSERT INTO brands (
                name,
                slug,
                logo_url,
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

                    statement.setString(1, brand.getName());
                    statement.setString(2, brand.getSlug());
                    statement.setString(3, brand.getLogoUrl());
                    statement.setString(4, brand.getStatus());

                    return statement;
                },
                keyHolder
        );

        Number generatedId = keyHolder.getKey();

        if (affectedRows == 0 || generatedId == null) {
            throw new IllegalStateException(
                    "Không thể lấy ID của thương hiệu vừa tạo"
            );
        }

        return generatedId.longValue();
    }

    @Override
    public boolean update(Brand brand) {
        String sql = """
            UPDATE brands
            SET name = ?,
                slug = ?,
                logo_url = ?,
                status = ?
            WHERE id = ?
            """;

        int affectedRows = jdbcTemplate.update(
                sql,
                brand.getName(),
                brand.getSlug(),
                brand.getLogoUrl(),
                brand.getStatus(),
                brand.getId()
        );

        return affectedRows > 0;
    }

    @Override
    public boolean deactivateById(Long id) {
        String sql = """
            UPDATE brands
            SET status = 'INACTIVE'
            WHERE id = ?
            """;

        return jdbcTemplate.update(sql, id) > 0;
    }

    @Override
    public boolean hasLinkedProducts(Long brandId) {
        String sql = """
            SELECT COUNT(*)
            FROM products
            WHERE brand_id = ?
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                brandId
        );

        return count != null && count > 0;
    }
}