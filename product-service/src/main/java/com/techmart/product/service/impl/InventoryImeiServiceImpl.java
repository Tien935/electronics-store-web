package com.techmart.product.service.impl;

import com.techmart.product.dto.request.BulkImportImeiRequest;
import com.techmart.product.dto.request.ChangeImeiStatusRequest;
import com.techmart.product.dto.request.TransferBranchRequest;
import com.techmart.product.dto.response.BranchStockResponse;
import com.techmart.product.dto.response.DeviceImeiResponse;
import com.techmart.product.dto.response.StockReportResponse;
import com.techmart.product.entity.Branch;
import com.techmart.product.entity.DeviceImei;
import com.techmart.product.entity.ImeiStatus;
import com.techmart.product.entity.ProductVariant;
import com.techmart.product.exception.DuplicateResourceException;
import com.techmart.product.exception.InvalidInventoryOperationException;
import com.techmart.product.exception.ResourceNotFoundException;
import com.techmart.product.repository.BranchRepository;
import com.techmart.product.repository.DeviceImeiRepository;
import com.techmart.product.repository.ProductVariantRepository;
import com.techmart.product.service.InventoryImeiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryImeiServiceImpl implements InventoryImeiService {

    private static final Logger log = LoggerFactory.getLogger(InventoryImeiServiceImpl.class);

    private final DeviceImeiRepository imeiRepository;
    private final ProductVariantRepository variantRepository;
    private final BranchRepository branchRepository;

    public InventoryImeiServiceImpl(DeviceImeiRepository imeiRepository,
                                    ProductVariantRepository variantRepository,
                                    BranchRepository branchRepository) {
        this.imeiRepository = imeiRepository;
        this.variantRepository = variantRepository;
        this.branchRepository = branchRepository;
    }

    @Override
    public List<DeviceImeiResponse> bulkImportImeis(BulkImportImeiRequest request) {
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể ID=" + request.getVariantId()));

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh ID=" + request.getBranchId()));

        List<DeviceImei> toSave = new ArrayList<>();
        for (String rawImei : request.getImeis()) {
            String imei = rawImei != null ? rawImei.trim() : "";
            if (imei.length() < 10) {
                throw new InvalidInventoryOperationException("Mã IMEI không hợp lệ: [" + rawImei + "]");
            }
            if (imeiRepository.existsByImei(imei)) {
                throw new DuplicateResourceException("Mã IMEI [" + imei + "] đã tồn tại trong hệ thống kho!");
            }

            DeviceImei device = new DeviceImei();
            device.setImei(imei);
            device.setVariant(variant);
            device.setBranch(branch);
            device.setStatus(ImeiStatus.IN_STOCK);
            device.setImportPrice(request.getImportPrice());
            device.setWarrantyMonths(request.getWarrantyMonths() != null ? request.getWarrantyMonths() : 12);
            device.setImportDate(LocalDateTime.now());
            device.setNote(request.getNote());
            toSave.add(device);
        }

        List<DeviceImei> saved = imeiRepository.saveAll(toSave);
        log.info("[INVENTORY] Đã nhập kho thành công {} thiết bị IMEI vào chi nhánh [{}] cho biến thể [{}]",
                saved.size(), branch.getName(), variant.getVariantName());

        return saved.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DeviceImeiResponse lookupImei(String imei) {
        DeviceImei device = imeiRepository.findByImei(imei.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thiết bị có mã IMEI=" + imei));
        return mapToResponse(device);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeviceImeiResponse> searchImeis(Long variantId, Long branchId, ImeiStatus status) {
        List<DeviceImei> list;
        if (variantId != null && branchId != null && status != null) {
            list = imeiRepository.findByVariantIdAndBranchIdAndStatus(variantId, branchId, status);
        } else if (variantId != null) {
            list = imeiRepository.findByVariantId(variantId);
        } else if (branchId != null) {
            list = imeiRepository.findByBranchId(branchId);
        } else if (status != null) {
            list = imeiRepository.findByStatus(status);
        } else {
            list = imeiRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public DeviceImeiResponse changeImeiStatus(String imei, ChangeImeiStatusRequest request) {
        DeviceImei device = imeiRepository.findByImei(imei.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thiết bị có mã IMEI=" + imei));

        ImeiStatus oldStatus = device.getStatus();
        ImeiStatus newStatus = request.getNewStatus();

        if (oldStatus == ImeiStatus.SOLD && newStatus != ImeiStatus.DEFECTIVE) {
            throw new InvalidInventoryOperationException("Máy IMEI [" + imei + "] đã bán ra, chỉ có thể chuyển sang DEFECTIVE khi bảo hành đổi trả!");
        }

        device.setStatus(newStatus);
        if (newStatus == ImeiStatus.SOLD) {
            device.setSoldDate(LocalDateTime.now());
            if (request.getOrderCode() != null) device.setOrderCode(request.getOrderCode());
            if (request.getCustomerPhone() != null) device.setCustomerPhone(request.getCustomerPhone());
        }

        if (request.getNote() != null) {
            device.setNote(request.getNote());
        }

        DeviceImei saved = imeiRepository.save(device);
        log.info("[INVENTORY] Máy IMEI [{}] chuyển trạng thái từ [{}] sang [{}]", imei, oldStatus, newStatus);
        return mapToResponse(saved);
    }

    @Override
    public DeviceImeiResponse transferBranch(String imei, TransferBranchRequest request) {
        DeviceImei device = imeiRepository.findByImei(imei.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thiết bị có mã IMEI=" + imei));

        if (device.getStatus() != ImeiStatus.IN_STOCK) {
            throw new InvalidInventoryOperationException("Chỉ thiết bị có trạng thái [IN_STOCK] mới được luân chuyển chi nhánh. Trạng thái hiện tại: " + device.getStatus());
        }

        Branch targetBranch = branchRepository.findById(request.getTargetBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh đích ID=" + request.getTargetBranchId()));

        String oldBranchName = device.getBranch().getName();
        device.setBranch(targetBranch);
        if (request.getReason() != null) {
            device.setNote("Điều chuyển từ [" + oldBranchName + "]: " + request.getReason());
        }

        DeviceImei saved = imeiRepository.save(device);
        log.info("[INVENTORY] Đã luân chuyển máy IMEI [{}] từ [{}] sang [{}]", imei, oldBranchName, targetBranch.getName());
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StockReportResponse getStockReport(Long variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể ID=" + variantId));

        StockReportResponse report = new StockReportResponse();
        report.setVariantId(variant.getId());
        report.setSku(variant.getSku());
        report.setVariantName(variant.getVariantName());
        if (variant.getProduct() != null) {
            report.setProductName(variant.getProduct().getName());
        }

        long total = imeiRepository.countByVariantIdAndStatus(variantId, ImeiStatus.IN_STOCK);
        report.setTotalInStock(total);

        List<Object[]> branchCounts = imeiRepository.countStockGroupedByBranch(variantId, ImeiStatus.IN_STOCK);
        List<BranchStockResponse> branchStocks = new ArrayList<>();
        for (Object[] row : branchCounts) {
            Long branchId = (Long) row[0];
            String branchName = (String) row[1];
            Long count = (Long) row[2];
            branchStocks.add(new BranchStockResponse(branchId, branchName, count != null ? count : 0L));
        }
        report.setBranchStocks(branchStocks);

        return report;
    }

    private DeviceImeiResponse mapToResponse(DeviceImei d) {
        DeviceImeiResponse res = new DeviceImeiResponse();
        res.setId(d.getId());
        res.setImei(d.getImei());
        if (d.getVariant() != null) {
            res.setVariantId(d.getVariant().getId());
            res.setVariantName(d.getVariant().getVariantName());
            res.setSku(d.getVariant().getSku());
            if (d.getVariant().getProduct() != null) {
                res.setProductName(d.getVariant().getProduct().getName());
            }
        }
        if (d.getBranch() != null) {
            res.setBranchId(d.getBranch().getId());
            res.setBranchName(d.getBranch().getName());
            res.setBranchAddress(d.getBranch().getAddress());
        }
        res.setStatus(d.getStatus());
        res.setStatusDescription(d.getStatus() != null ? d.getStatus().getDescription() : null);
        res.setImportPrice(d.getImportPrice());
        res.setWarrantyMonths(d.getWarrantyMonths());
        res.setImportDate(d.getImportDate());
        res.setSoldDate(d.getSoldDate());
        res.setOrderCode(d.getOrderCode());
        res.setCustomerPhone(d.getCustomerPhone());
        res.setNote(d.getNote());
        return res;
    }
}
