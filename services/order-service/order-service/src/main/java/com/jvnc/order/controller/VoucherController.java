package com.jvnc.order.controller;

import com.jvnc.order.dto.request.ApplyVoucherRequest;
import com.jvnc.order.dto.request.CreateVoucherRequest;
import com.jvnc.order.dto.response.ApiResponse;
import com.jvnc.order.dto.response.ApplyVoucherResponse;
import com.jvnc.order.dto.response.VoucherResponse;
import com.jvnc.order.service.VoucherService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplyVoucherResponse>> applyVoucher(@Valid @RequestBody ApplyVoucherRequest request) {
        ApplyVoucherResponse response = voucherService.applyVoucher(request);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VoucherResponse>>> getActiveVouchers() {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getActiveVouchers()));
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(voucherService.getVoucherByCode(code)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VoucherResponse>> createVoucher(@Valid @RequestBody CreateVoucherRequest request) {
        VoucherResponse response = voucherService.createVoucher(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("Tạo voucher thành công", response));
    }
}
