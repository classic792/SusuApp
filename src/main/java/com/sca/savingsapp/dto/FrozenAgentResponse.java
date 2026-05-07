package com.sca.savingsapp.dto;

import java.time.LocalDateTime;

public class FrozenAgentResponse {
    private Integer agentId;
    private String agentName;
    private String reason;
    private LocalDateTime timestamp;

    public FrozenAgentResponse() {}

    public FrozenAgentResponse(Integer agentId, String agentName, String reason, LocalDateTime timestamp) {
        this.agentId = agentId;
        this.agentName = agentName;
        this.reason = reason;
        this.timestamp = timestamp;
    }

    public Integer getAgentId() { return agentId; }
    public void setAgentId(Integer agentId) { this.agentId = agentId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
