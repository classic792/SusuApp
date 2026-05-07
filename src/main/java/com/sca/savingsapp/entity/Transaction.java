package com.sca.savingsapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "account_id", nullable = false)
    private Integer accountId;

    @Column(name = "agent_id")
    private Integer agentId;

    @Column(precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    private TransactionEntryType entryType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "idempotency_key", unique = true, nullable = false)
    private String idempotencyKey; // Unique key to prevent duplicate transaction processing

    @Column(name = "face_signature", columnDefinition = "LONGTEXT")
    private String faceSignature; // Biometric signature associated with the transaction

    @Column(name = "is_offline_processed")
    private Boolean isOfflineProcessed = false; // Flag indicating if transaction was sync'd later

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate; // Original timestamp from the mobile device

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.pending;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_method", nullable = false)
    private VerificationMethod verificationMethod = VerificationMethod.local;

    @Column(name = "status")
    private String status = "COMPLETED";

    public Transaction() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public Integer getAgentId() {
        return agentId;
    }

    public void setAgentId(Integer agentId) {
        this.agentId = agentId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
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

    public Boolean getIsOfflineProcessed() {
        return isOfflineProcessed;
    }

    public void setIsOfflineProcessed(Boolean isOfflineProcessed) {
        this.isOfflineProcessed = isOfflineProcessed;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public VerificationMethod getVerificationMethod() {
        return verificationMethod;
    }

    public void setVerificationMethod(VerificationMethod verificationMethod) {
        this.verificationMethod = verificationMethod;
    }
}
