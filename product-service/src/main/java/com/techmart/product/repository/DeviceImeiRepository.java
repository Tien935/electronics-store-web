package com.techmart.product.repository;

import com.techmart.product.entity.DeviceImei;
import com.techmart.product.entity.ImeiStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceImeiRepository extends JpaRepository<DeviceImei, Long> {
    Optional<DeviceImei> findByImei(String imei);
    boolean existsByImei(String imei);

    List<DeviceImei> findByVariantId(Long variantId);
    List<DeviceImei> findByBranchId(Long branchId);
    List<DeviceImei> findByStatus(ImeiStatus status);

    List<DeviceImei> findByVariantIdAndBranchIdAndStatus(Long variantId, Long branchId, ImeiStatus status);

    long countByVariantIdAndStatus(Long variantId, ImeiStatus status);
    long countByVariantIdAndBranchIdAndStatus(Long variantId, Long branchId, ImeiStatus status);

    @Query("SELECT d.branch.id, d.branch.name, COUNT(d) FROM DeviceImei d " +
           "WHERE d.variant.id = :variantId AND d.status = :status " +
           "GROUP BY d.branch.id, d.branch.name")
    List<Object[]> countStockGroupedByBranch(@Param("variantId") Long variantId,
                                             @Param("status") ImeiStatus status);
}
