package com.sca.savingsapp.controller;

import com.sca.savingsapp.dto.TransactionRequest;
import com.sca.savingsapp.dto.TransactionResponse;
import com.sca.savingsapp.dto.TransactionSyncRequest;
import com.sca.savingsapp.entity.Transaction;
import com.sca.savingsapp.security.UserPrincipal;
import com.sca.savingsapp.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Processes a single transaction in real-time (Online mode).
     * Retrieves the agent ID from the authenticated security principal.
     */
    @PostMapping
    public ResponseEntity<Transaction> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        Transaction transaction = transactionService.processTransaction(request, principal.getProfileIdAsInteger());
        return ResponseEntity.ok(transaction);
    }

    /**
     * Synchronizes a batch of transactions collected while offline.
     * Processes each transaction in the list sequentially.
     */
    @PostMapping("/sync")
    public ResponseEntity<List<Transaction>> syncTransactions(
            @Valid @RequestBody TransactionSyncRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<Transaction> transactions = transactionService.syncTransactions(request, principal.getProfileIdAsInteger());
        return ResponseEntity.ok(transactions);
    }

    /**
     * Retrieves the transaction history for the authenticated agent.
     */
    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getTransactionHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<TransactionResponse> history = transactionService.getAgentTransactionHistory(principal.getProfileIdAsInteger());
        return ResponseEntity.ok(history);
    }

    /**
     * Retrieves the transaction history for a specific account.
     */
    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<TransactionResponse>> getAccountTransactionHistory(
            @PathVariable Integer accountId) {
        List<TransactionResponse> history = transactionService.getAccountTransactionHistory(accountId);
        return ResponseEntity.ok(history);
    }
}
