package com.sca.savingsapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for submitting a loan repayment.
 */
public class RepaymentRequest {

    @NotNull(message = "Loan ID is required")
    private Integer loanId;

    @NotNull(message = "Amount paid is required")
    @Positive(message = "Amount paid must be greater than 0")
    private BigDecimal amountPaid;

    @NotNull(message = "Repayment date is required")
    private LocalDateTime repaymentDate;

    @NotBlank(message = "Idempotency key is required")
    private String idempotencyKey; // Prevents duplicate repayment processing

    private String faceSignature; // Optional biometric capture at repayment time

    public RepaymentRequest() {
    }

    public Integer getLoanId() {
        return loanId;
    }

    public void setLoanId(Integer loanId) {
        this.loanId = loanId;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public LocalDateTime getRepaymentDate() {
        return repaymentDate;
    }

    public void setRepaymentDate(LocalDateTime repaymentDate) {
        this.repaymentDate = repaymentDate;
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
}
