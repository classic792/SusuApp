package com.sca.savingsapp.controller;

import com.sca.savingsapp.dto.*;
import com.sca.savingsapp.entity.Agent;
import com.sca.savingsapp.entity.AgentLimit;
import com.sca.savingsapp.entity.TransferConfirmation;
import com.sca.savingsapp.service.AdminService;
import com.sca.savingsapp.service.SmsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final SmsService smsService;
    private final com.sca.savingsapp.service.TransactionService transactionService;

    public AdminController(AdminService adminService, SmsService smsService, com.sca.savingsapp.service.TransactionService transactionService) {
        this.adminService = adminService;
        this.smsService = smsService;
        this.transactionService = transactionService;
    }

    @GetMapping("/test-sms")
    public ResponseEntity<?> testSms(@RequestParam String to, @RequestParam String message) {
        boolean success = smsService.sendSms(to, message);
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("recipient", to);
        response.put("message", message);
        return success ? ResponseEntity.ok(response) : ResponseEntity.status(500).body(response);
    }

    @GetMapping("/agents/locations")
    public ResponseEntity<List<AgentLocationResponse>> getAgentLocations() {
        return ResponseEntity.ok(adminService.getAgentLocations());
    }

    @GetMapping("/agents/stats")
    public ResponseEntity<List<AgentStatsResponse>> getAgentStats() {
        return ResponseEntity.ok(adminService.getAgentStats());
    }

    @PostMapping("/agents/register")
    public ResponseEntity<Agent> registerAgent(@RequestBody AgentRegistrationRequest request) {
        return ResponseEntity.ok(adminService.addAgent(request));
    }

    @PutMapping("/agents/{agentId}/limits")
    public ResponseEntity<AgentLimit> setAgentLimits(@PathVariable Integer agentId, @RequestBody AgentLimitRequest request, @RequestParam Integer adminId) {
        return ResponseEntity.ok(adminService.setAgentLimits(agentId, request, adminId));
    }

    @PostMapping("/transfers/{transferId}/confirm")
    public ResponseEntity<TransferConfirmation> confirmTransfer(@PathVariable Integer transferId, @RequestParam Integer adminId) {
        return ResponseEntity.ok(adminService.confirmTransfer(transferId, adminId));
    }

    @GetMapping("/corporate-analysis")
    public ResponseEntity<CorporateAnalysisResponse> getCorporateAnalysis() {
        return ResponseEntity.ok(adminService.getCorporateAnalysis());
    }

    @GetMapping("/transactions/overview")
    public ResponseEntity<List<TransactionResponse>> getTransactionsOverview() {
        return ResponseEntity.ok(adminService.getAllTransactionsOverview());
    }

    @GetMapping("/settings/global-limit")
    public ResponseEntity<BigDecimal> getGlobalLimit() {
        return ResponseEntity.ok(adminService.getGlobalDailyLimit());
    }

    @PostMapping("/settings/global-limit")
    public ResponseEntity<Void> setGlobalLimit(@RequestBody Map<String, BigDecimal> payload) {
        adminService.setGlobalDailyLimit(payload.get("limit"));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/frozen-agents")
    public ResponseEntity<List<com.sca.savingsapp.dto.FrozenAgentResponse>> getFrozenAgents() {
        return ResponseEntity.ok(adminService.getFrozenAgents());
    }

    @PostMapping("/agents/{id}/unfreeze")
    public ResponseEntity<Void> unfreezeAgent(@PathVariable Integer id, @RequestParam Integer adminId) {
        adminService.unfreezeAgent(id, adminId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/pending-loans")
    public ResponseEntity<List<LoanResponse>> getPendingLoans() {
        return ResponseEntity.ok(adminService.getPendingLoans());
    }

    @PostMapping("/loans/{id}/approve")
    public ResponseEntity<Void> approveLoan(@PathVariable Integer id) {
        adminService.approveLoan(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/loans/{id}/decline")
    public ResponseEntity<Void> declineLoan(@PathVariable Integer id) {
        adminService.declineLoan(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/deep-analytics")
    public ResponseEntity<Map<String, Object>> getDeepAnalytics() {
        return ResponseEntity.ok(adminService.getDeepAnalytics());
    }

    @GetMapping("/reports/pending-withdrawals")
    public ResponseEntity<List<TransactionResponse>> getPendingWithdrawals() {
        return ResponseEntity.ok(transactionService.getPendingWithdrawals());
    }

    @PostMapping("/withdrawals/{id}/approve")
    public ResponseEntity<Void> approveWithdrawal(@PathVariable Integer id) {
        transactionService.approveWithdrawal(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/withdrawals/{id}/decline")
    public ResponseEntity<Void> declineWithdrawal(@PathVariable Integer id) {
        transactionService.rejectWithdrawal(id);
        return ResponseEntity.noContent().build();
    }
}
