package com.sca.savingsapp.controller;

import com.sca.savingsapp.dto.LoanRequest;
import com.sca.savingsapp.dto.LoanResponse;
import com.sca.savingsapp.security.UserPrincipal;
import com.sca.savingsapp.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    /**
     * Creates a new loan; the authenticated agent is recorded as the disbursing agent.
     */
    @PostMapping
    public ResponseEntity<LoanResponse> createLoan(
            @Valid @RequestBody LoanRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        LoanResponse response = loanService.createLoan(request, principal.getProfileIdAsInteger());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves a single loan by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoanById(@PathVariable Integer id) {
        return ResponseEntity.ok(loanService.getLoanById(id));
    }

    /**
     * Returns all loans belonging to a specific client.
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<LoanResponse>> getLoansByClient(@PathVariable Integer clientId) {
        return ResponseEntity.ok(loanService.getLoansByClient(clientId));
    }

    /**
     * Returns all loans currently in ACTIVE status.
     */
    @GetMapping("/active")
    public ResponseEntity<List<LoanResponse>> getActiveLoans() {
        return ResponseEntity.ok(loanService.getActiveLoans());
    }

    /**
     * Returns all ACTIVE loans managed by the authenticated agent.
     */
    @GetMapping("/agent/active")
    public ResponseEntity<List<LoanResponse>> getActiveLoansByAgent(
            @AuthenticationPrincipal UserPrincipal principal) {
        Integer agentId = principal.getProfileIdAsInteger();
        return ResponseEntity.ok(loanService.getActiveLoansByAgent(agentId));
    }

    /**
     * Returns all PENDING loans submitted by the authenticated agent.
     */
    @GetMapping("/pending")
    public ResponseEntity<List<LoanResponse>> getPendingLoans(
            @AuthenticationPrincipal UserPrincipal principal) {
        Integer agentId = principal.getProfileIdAsInteger();
        return ResponseEntity.ok(loanService.getPendingLoansByAgent(agentId));
    }
}
