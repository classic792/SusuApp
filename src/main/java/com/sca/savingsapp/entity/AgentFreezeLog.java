package com.sca.savingsapp.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_freeze_log")
public class AgentFreezeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = false)
    private Profile agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frozen_by", nullable = false)
    private Profile frozenBy;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private FreezeStatus status;

    @CreationTimestamp
    @Column(name = "timestamp", updatable = false)
    private LocalDateTime timestamp;

    public AgentFreezeLog() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Profile getAgent() {
        return agent;
    }

    public void setAgent(Profile agent) {
        this.agent = agent;
    }

    public Profile getFrozenBy() {
        return frozenBy;
    }

    public void setFrozenBy(Profile frozenBy) {
        this.frozenBy = frozenBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public FreezeStatus getStatus() {
        return status;
    }

    public void setStatus(FreezeStatus status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
