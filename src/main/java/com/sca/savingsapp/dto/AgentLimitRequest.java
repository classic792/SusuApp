package com.sca.savingsapp.dto;

import java.math.BigDecimal;

public class AgentLimitRequest {
    private BigDecimal dailyLimit;
    private BigDecimal perTransactionLimit;

    public AgentLimitRequest() {
    }

    public BigDecimal getDailyLimit() {
        return dailyLimit;
    }

    public void setDailyLimit(BigDecimal dailyLimit) {
        this.dailyLimit = dailyLimit;
    }

    public BigDecimal getPerTransactionLimit() {
        return perTransactionLimit;
    }

    public void setPerTransactionLimit(BigDecimal perTransactionLimit) {
        this.perTransactionLimit = perTransactionLimit;
    }
}
