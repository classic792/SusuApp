package com.sca.savingsapp.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for creating a new loan.
 */
public class LoanRequest {

    @NotNull(message = "Client ID is required")
    private Integer clientId;

    @NotNull(message = "Account ID is required")
    private Integer accountId;

    @NotNull(message = "Principal amount is required")
    @Positive(message = "Principal amount must be greater than 0")
    private BigDecimal principalAmount;

    @NotNull(message = "Interest rate is required")
    @Positive(message = "Interest rate must be greater than 0")
    private BigDecimal interestRate;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be greater than 0")
    private Integer duration;

    private LocalDateTime disbursementDate;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    private String faceSignature;

    public LoanRequest() {
    }

    public String getFaceSignature() {
        return faceSignature;
    }

    public void setFaceSignature(String faceSignature) {
        this.faceSignature = faceSignature;
    }

    public Integer getClientId() {
        return clientId;
    }

    public void setClientId(Integer clientId) {
        this.clientId = clientId;
    }

    public Integer getAccountId() {
        return accountId;
    }

    public void setAccountId(Integer accountId) {
        this.accountId = accountId;
    }

    public BigDecimal getPrincipalAmount() {
        return principalAmount;
    }

    public void setPrincipalAmount(BigDecimal principalAmount) {
        this.principalAmount = principalAmount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public LocalDateTime getDisbursementDate() {
        return disbursementDate;
    }

    public void setDisbursementDate(LocalDateTime disbursementDate) {
        this.disbursementDate = disbursementDate;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
}
