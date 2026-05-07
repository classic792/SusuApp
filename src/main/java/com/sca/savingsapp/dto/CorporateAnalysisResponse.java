package com.sca.savingsapp.dto;

import java.math.BigDecimal;

public class CorporateAnalysisResponse {
    private long totalAgents;
    private long totalClients;
    private long totalLoansActive;
    private BigDecimal totalLoanBalanceRemaining;
    private BigDecimal totalAgentFloatBalance;
    private BigDecimal totalClientBalance;

    public CorporateAnalysisResponse() {
    }

    public long getTotalAgents() {
        return totalAgents;
    }

    public void setTotalAgents(long totalAgents) {
        this.totalAgents = totalAgents;
    }

    public long getTotalClients() {
        return totalClients;
    }

    public void setTotalClients(long totalClients) {
        this.totalClients = totalClients;
    }

    public long getTotalLoansActive() {
        return totalLoansActive;
    }

    public void setTotalLoansActive(long totalLoansActive) {
        this.totalLoansActive = totalLoansActive;
    }

    public BigDecimal getTotalLoanBalanceRemaining() {
        return totalLoanBalanceRemaining;
    }

    public void setTotalLoanBalanceRemaining(BigDecimal totalLoanBalanceRemaining) {
        this.totalLoanBalanceRemaining = totalLoanBalanceRemaining;
    }

    public BigDecimal getTotalAgentFloatBalance() {
        return totalAgentFloatBalance;
    }

    public void setTotalAgentFloatBalance(BigDecimal totalAgentFloatBalance) {
        this.totalAgentFloatBalance = totalAgentFloatBalance;
    }

    public BigDecimal getTotalClientBalance() {
        return totalClientBalance;
    }

    public void setTotalClientBalance(BigDecimal totalClientBalance) {
        this.totalClientBalance = totalClientBalance;
    }
}
