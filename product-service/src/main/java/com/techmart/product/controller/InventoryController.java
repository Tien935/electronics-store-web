package com.techmart.product.controller;

import com.techmart.product.dto.request.BulkImportImeiRequest;
import com.techmart.product.dto.request.ChangeImeiStatusRequest;
import com.techmart.product.dto.request.TransferBranchRequest;
import com.techmart.product.dto.response.ApiResponse;
import com.techmart.product.dto.response.DeviceImeiResponse;
import com.techmart.product.dto.response.StockReportResponse;
import com.techmart.product.entity.ImeiStatus;
import com.techmart.product.service.InventoryImeiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryImeiService inventoryService;

    public InventoryController(InventoryImeiService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/imeis/bulk-import")
    public ResponseEntity<ApiResponse<List<DeviceImeiResponse>>> bulkImportImeis(
            @Valid @RequestBody BulkImportImeiRequest request) {
        List<DeviceImeiResponse> res = inventoryService.bulkImportImeis(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã nhập kho thành công " + res.size() + " mã IMEI thiết bị", res));
    }

    @GetMapping("/imeis/{imei}")
    public ResponseEntity<ApiResponse<DeviceImeiResponse>> lookupImei(@PathVariable String imei) {
        DeviceImeiResponse res = inventoryService.lookupImei(imei);
        return ResponseEntity.ok(ApiResponse.success(res));
    }

    @GetMapping("/imeis")
    public ResponseEntity<ApiResponse<List<DeviceImeiResponse>>> searchImeis(
            @RequestParam(required = false) Long variantId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) ImeiStatus status) {
        List<DeviceImeiResponse> list = inventoryService.searchImeis(variantId, branchId, status);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách mã IMEI thành công", list));
    }

    @PatchMapping("/imeis/{imei}/status")
    public ResponseEntity<ApiResponse<DeviceImeiResponse>> changeImeiStatus(
            @PathVariable String imei,
            @Valid @RequestBody ChangeImeiStatusRequest request) {
        DeviceImeiResponse res = inventoryService.changeImeiStatus(imei, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái IMEI thành công", res));
    }

    @PostMapping("/imeis/{imei}/transfer")
    public ResponseEntity<ApiResponse<DeviceImeiResponse>> transferBranch(
            @PathVariable String imei,
            @Valid @RequestBody TransferBranchRequest request) {
        DeviceImeiResponse res = inventoryService.transferBranch(imei, request);
        return ResponseEntity.ok(ApiResponse.success("Luân chuyển máy giữa các chi nhánh thành công", res));
    }

    @GetMapping("/stock-report/{variantId}")
    public ResponseEntity<ApiResponse<StockReportResponse>> getStockReport(@PathVariable Long variantId) {
        StockReportResponse report = inventoryService.getStockReport(variantId);
        return ResponseEntity.ok(ApiResponse.success("Báo cáo tồn kho chi nhánh O2O", report));
    }
}
