package com.jvnc.catalog.dao.impl;

import com.jvnc.catalog.dao.BrandDao;
import com.jvnc.catalog.model.Brand;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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
}