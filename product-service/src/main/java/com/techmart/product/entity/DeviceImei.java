package com.techmart.product.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "device_imeis", indexes = {
        @Index(name = "idx_imei_code", columnList = "imei", unique = true),
        @Index(name = "idx_imei_variant_branch", columnList = "variant_id, branch_id, status")
})
public class DeviceImei {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 18)
    private String imei;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ImeiStatus status = ImeiStatus.IN_STOCK;

    @Column(name = "import_price", precision = 15, scale = 2)
    private BigDecimal importPrice;

    @Column(name = "warranty_months", nullable = false)
    private Integer warrantyMonths = 12;

    @Column(name = "import_date", nullable = false)
    private LocalDateTime importDate = LocalDateTime.now();

    @Column(name = "sold_date")
    private LocalDateTime soldDate;

    @Column(name = "order_code", length = 50)
    private String orderCode;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(length = 255)
    private String note;

    public DeviceImei() {}

    @PrePersist
    public void prePersist() {
        if (importDate == null) importDate = LocalDateTime.now();
        if (status == null) status = ImeiStatus.IN_STOCK;
        if (warrantyMonths == null) warrantyMonths = 12;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImei() { return imei; }
    public void setImei(String imei) { this.imei = imei; }

    public ProductVariant getVariant() { return variant; }
    public void setVariant(ProductVariant variant) { this.variant = variant; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public ImeiStatus getStatus() { return status; }
    public void setStatus(ImeiStatus status) { this.status = status; }

    public BigDecimal getImportPrice() { return importPrice; }
    public void setImportPrice(BigDecimal importPrice) { this.importPrice = importPrice; }

    public Integer getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(Integer warrantyMonths) { this.warrantyMonths = warrantyMonths; }

    public LocalDateTime getImportDate() { return importDate; }
    public void setImportDate(LocalDateTime importDate) { this.importDate = importDate; }

    public LocalDateTime getSoldDate() { return soldDate; }
    public void setSoldDate(LocalDateTime soldDate) { this.soldDate = soldDate; }

    public String getOrderCode() { return orderCode; }
    public void setOrderCode(String orderCode) { this.orderCode = orderCode; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DeviceImei that = (DeviceImei) o;
        return Objects.equals(imei, that.imei);
    }

    @Override
    public int hashCode() {
        return Objects.hash(imei);
    }
}
