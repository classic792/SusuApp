package com.sca.savingsapp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * DTO for syncing multiple transactions from offline storage.
 */
public class TransactionSyncRequest {

    @NotEmpty(message = "Transaction list cannot be empty")
    @Valid
    private List<TransactionRequest> transactions; // Collection of transaction requests to be processed in batch

    public TransactionSyncRequest() {
    }

    public List<TransactionRequest> getTransactions() {
        return transactions;
    }

    public void setTransactions(List<TransactionRequest> transactions) {
        this.transactions = transactions;
    }
}
