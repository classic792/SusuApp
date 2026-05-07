package com.sca.savingsapp.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AgentLocationResponse {
    private Integer agentId;
    private String agentName;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
    private BigDecimal dailyLimit;
    private BigDecimal perTransactionLimit;

    public AgentLocationResponse() {
    }

    public AgentLocationResponse(Integer agentId, String agentName, Double latitude, Double longitude, LocalDateTime timestamp, BigDecimal dailyLimit, BigDecimal perTransactionLimit) {
        this.agentId = agentId;
        this.agentName = agentName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timestamp = timestamp;
        this.dailyLimit = dailyLimit;
        this.perTransactionLimit = perTransactionLimit;
    }

    public Integer getAgentId() {
        return agentId;
    }

    public void setAgentId(Integer agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
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
