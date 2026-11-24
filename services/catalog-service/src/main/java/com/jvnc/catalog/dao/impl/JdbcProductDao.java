package com.jvnc.catalog.dao.impl;

import com.jvnc.catalog.dao.ProductDao;
import com.jvnc.catalog.model.Product;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcProductDao implements ProductDao {

    private final JdbcTemplate jdbcTemplate;

    public JdbcProductDao(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Product> productRowMapper =
            (resultSet, rowNum) -> {
                Product product = new Product();

                product.setId(resultSet.getLong("id"));
                product.setSku(resultSet.getString("sku"));
                product.setName(resultSet.getString("name"));
                product.setDescription(
                        resultSet.getString("description")
                );
                product.setPrice(resultSet.getBigDecimal("price"));
                product.setImageUrl(
                        resultSet.getString("image_url")
                );
                product.setCategoryId(
                        resultSet.getLong("category_id")
                );
                product.setBrandId(
                        resultSet.getLong("brand_id")
                );
                product.setStatus(resultSet.getString("status"));

                Timestamp createdAt =
                        resultSet.getTimestamp("created_at");

                Timestamp updatedAt =
                        resultSet.getTimestamp("updated_at");

                if (createdAt != null) {
                    product.setCreatedAt(
                            createdAt.toLocalDateTime()
                    );
                }

                if (updatedAt != null) {
                    product.setUpdatedAt(
                            updatedAt.toLocalDateTime()
                    );
                }

                return product;
            };

    @Override
    public List<Product> findAll() {
        String sql = """
                SELECT
                    id,
                    sku,
                    name,
                    description,
                    price,
                    image_url,
                    category_id,
                    brand_id,
                    status,
                    created_at,
                    updated_at
                FROM products
                ORDER BY created_at DESC
                """;

        return jdbcTemplate.query(sql, productRowMapper);
    }

    @Override
    public List<Product> findAllActive() {
        String sql = """
                SELECT
                    id,
                    sku,
                    name,
                    description,
                    price,
                    image_url,
                    category_id,
                    brand_id,
                    status,
                    created_at,
                    updated_at
                FROM products
                WHERE status = 'ACTIVE'
                ORDER BY created_at DESC
                """;

        return jdbcTemplate.query(sql, productRowMapper);
    }

    @Override
    public Optional<Product> findById(Long id) {
        String sql = """
                SELECT
                    id,
                    sku,
                    name,
                    description,
                    price,
                    image_url,
                    category_id,
                    brand_id,
                    status,
                    created_at,
                    updated_at
                FROM products
                WHERE id = ?
                """;

        return jdbcTemplate
                .query(sql, productRowMapper, id)
                .stream()
                .findFirst();
    }

    @Override
    public boolean existsBySku(String sku) {
        String sql = """
                SELECT COUNT(*)
                FROM products
                WHERE sku = ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                sku
        );

        return count != null && count > 0;
    }

    @Override
    public boolean existsBySkuAndIdNot(
            String sku,
            Long excludedId
    ) {
        String sql = """
                SELECT COUNT(*)
                FROM products
                WHERE sku = ?
                  AND id <> ?
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Integer.class,
                sku,
                excludedId
        );

        return count != null && count > 0;
    }

    @Override
    public long create(Product product) {
        String sql = """
                INSERT INTO products (
                    sku,
                    name,
                    description,
                    price,
                    image_url,
                    category_id,
                    brand_id,
                    status
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement =
                    connection.prepareStatement(
                            sql,
                            Statement.RETURN_GENERATED_KEYS
                    );

            statement.setString(1, product.getSku());
            statement.setString(2, product.getName());
            statement.setString(
                    3,
                    product.getDescription()
            );
            statement.setBigDecimal(4, product.getPrice());
            statement.setString(5, product.getImageUrl());
            statement.setLong(6, product.getCategoryId());
            statement.setLong(7, product.getBrandId());
            statement.setString(
                    8,
                    product.getStatus() == null
                            ? "ACTIVE"
                            : product.getStatus()
            );

            return statement;
        }, keyHolder);

        Number generatedId = keyHolder.getKey();

        if (generatedId == null) {
            throw new IllegalStateException(
                    "Không lấy được ID của sản phẩm vừa tạo"
            );
        }

        return generatedId.longValue();
    }

    @Override
    public boolean update(Product product) {
        String sql = """
                UPDATE products
                SET
                    sku = ?,
                    name = ?,
                    description = ?,
                    price = ?,
                    image_url = ?,
                    category_id = ?,
                    brand_id = ?,
                    status = ?
                WHERE id = ?
                """;

        int affectedRows = jdbcTemplate.update(
                sql,
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getImageUrl(),
                product.getCategoryId(),
                product.getBrandId(),
                product.getStatus(),
                product.getId()
        );

        return affectedRows > 0;
    }

    @Override
    public boolean deactivateById(Long id) {
        String sql = """
                UPDATE products
                SET status = 'INACTIVE'
                WHERE id = ?
                  AND status <> 'INACTIVE'
                """;

        int affectedRows = jdbcTemplate.update(sql, id);

        return affectedRows > 0;
    }
}