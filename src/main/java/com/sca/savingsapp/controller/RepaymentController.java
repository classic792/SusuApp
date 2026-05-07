package com.sca.savingsapp.controller;
import com.sca.savingsapp.dto.RepaymentRequest;
import com.sca.savingsapp.dto.RepaymentResponse;
import com.sca.savingsapp.security.UserPrincipal;
import com.sca.savingsapp.service.RepaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/repayments")
public class RepaymentController {

    private final RepaymentService repaymentService;

    public RepaymentController(RepaymentService repaymentService) {
        this.repaymentService = repaymentService;
    }

    /**
     * Submits a repayment for a loan.
     * Creates a linked Transaction record and updates the loan balance.
     */
    @PostMapping
    public ResponseEntity<RepaymentResponse> createRepayment(
            @Valid @RequestBody RepaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        RepaymentResponse response = repaymentService.createRepayment(request, principal.getProfileIdAsInteger());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Returns all repayments made against a specific loan.
     */
    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<RepaymentResponse>> getRepaymentsByLoan(@PathVariable Integer loanId) {
        return ResponseEntity.ok(repaymentService.getRepaymentsByLoan(loanId));
    }

    /**
     * Returns the total amount repaid for a specific loan.
     */
    @GetMapping("/loan/{loanId}/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalRepaid(@PathVariable Integer loanId) {
        BigDecimal total = repaymentService.getTotalRepaid(loanId);
        return ResponseEntity.ok(Map.of("totalRepaid", total));
    }
}
