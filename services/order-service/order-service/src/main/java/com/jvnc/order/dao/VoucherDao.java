package com.jvnc.order.dao;

import com.jvnc.order.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherDao extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCode(String code);

    List<Voucher> findByStatus(String status);

    boolean existsByCode(String code);
}
