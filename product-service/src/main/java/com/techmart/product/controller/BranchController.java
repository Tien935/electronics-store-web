package com.techmart.product.controller;

import com.techmart.product.dto.response.ApiResponse;
import com.techmart.product.entity.Branch;
import com.techmart.product.repository.BranchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "*")
public class BranchController {

    private final BranchRepository branchRepository;

    public BranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Branch>>> getAllBranches() {
        return ResponseEntity.ok(ApiResponse.success(branchRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Branch>> getBranchById(@PathVariable Long id) {
        return branchRepository.findById(id)
                .map(b -> ResponseEntity.ok(ApiResponse.success(b)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
