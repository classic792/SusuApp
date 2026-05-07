package com.sca.savingsapp.dto;

import java.time.LocalDateTime;

public class AgentStatsResponse {
    private Integer agentId;
    private String agentName;
    private LocalDateTime registrationDate;
    private long totalLoans;
    private long totalSusuCollections;
    private long totalRepayments;
    private String currentStatus;

    public AgentStatsResponse() {}

    public AgentStatsResponse(Integer agentId, String agentName, LocalDateTime registrationDate, long totalLoans, long totalSusuCollections, long totalRepayments, String currentStatus) {
        this.agentId = agentId;
        this.agentName = agentName;
        this.registrationDate = registrationDate;
        this.totalLoans = totalLoans;
        this.totalSusuCollections = totalSusuCollections;
        this.totalRepayments = totalRepayments;
        this.currentStatus = currentStatus;
    }

    public Integer getAgentId() { return agentId; }
    public void setAgentId(Integer agentId) { this.agentId = agentId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }

    public long getTotalLoans() { return totalLoans; }
    public void setTotalLoans(long totalLoans) { this.totalLoans = totalLoans; }

    public long getTotalSusuCollections() { return totalSusuCollections; }
    public void setTotalSusuCollections(long totalSusuCollections) { this.totalSusuCollections = totalSusuCollections; }

    public long getTotalRepayments() { return totalRepayments; }
    public void setTotalRepayments(long totalRepayments) { this.totalRepayments = totalRepayments; }

    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String currentStatus) { this.currentStatus = currentStatus; }
}
