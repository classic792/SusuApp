package com.sca.savingsapp.dto;

import com.sca.savingsapp.entity.TransactionEntryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating a single transaction.
 */
public class TransactionRequest {

    @NotNull(message = "Account ID is required")
    private Integer accountId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Entry type is required")
    private TransactionEntryType entryType;

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey; // Prevents processing the same transaction twice

    private String faceSignature; // Captured biometric data for transaction validation

    private LocalDateTime transactionDate; // Client-side timestamp for offline transactions

    public TransactionRequest() {
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public TransactionEntryType getEntryType() {
        return entryType;
    }

    public void setEntryType(TransactionEntryType entryType) {
        this.entryType = entryType;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getFaceSignature() {
        return faceSignature;
    }

    public void setFaceSignature(String faceSignature) {
        this.faceSignature = faceSignature;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
}
