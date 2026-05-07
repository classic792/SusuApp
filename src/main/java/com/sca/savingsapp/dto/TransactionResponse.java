package com.sca.savingsapp.dto;

import com.sca.savingsapp.entity.TransactionEntryType;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for returning enriched transaction history details.
 */
public class TransactionResponse {
    private Integer id;
    private LocalDateTime transactionDate;
    private Integer accountId;
    private String accountNumber;
    private String clientName;
    private String description;
    private String type; // e.g., Susu Collection, Repayment, Loan Grant
    private TransactionEntryType entryType;
    private BigDecimal amount;
    private Integer agentId;
    private String agentName;
    private String idempotencyKey;
    private String status;

    public TransactionResponse() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public Integer getAccountId() { return accountId; }
    public void setAccountId(Integer accountId) { this.accountId = accountId; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public TransactionEntryType getEntryType() { return entryType; }
    public void setEntryType(TransactionEntryType entryType) { this.entryType = entryType; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public Integer getAgentId() { return agentId; }
    public void setAgentId(Integer agentId) { this.agentId = agentId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }
}
