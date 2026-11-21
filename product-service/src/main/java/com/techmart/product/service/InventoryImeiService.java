package com.techmart.product.service;

import com.techmart.product.dto.request.BulkImportImeiRequest;
import com.techmart.product.dto.request.ChangeImeiStatusRequest;
import com.techmart.product.dto.request.TransferBranchRequest;
import com.techmart.product.dto.response.DeviceImeiResponse;
import com.techmart.product.dto.response.StockReportResponse;
import com.techmart.product.entity.ImeiStatus;

import java.util.List;

public interface InventoryImeiService {
    List<DeviceImeiResponse> bulkImportImeis(BulkImportImeiRequest request);
    DeviceImeiResponse lookupImei(String imei);
    List<DeviceImeiResponse> searchImeis(Long variantId, Long branchId, ImeiStatus status);
    DeviceImeiResponse changeImeiStatus(String imei, ChangeImeiStatusRequest request);
    DeviceImeiResponse transferBranch(String imei, TransferBranchRequest request);
    StockReportResponse getStockReport(Long variantId);
}
