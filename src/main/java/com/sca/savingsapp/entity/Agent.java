package com.sca.savingsapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "agent")
public class Agent {

    @Id
    @Column(name = "id", nullable = false)
    private Integer id;


    @Column(precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO; // Agent's current float balance

    @Column(name = "last_known_latitude")
    private Double lastKnownLatitude;

    @Column(name = "last_known_longitude")
    private Double lastKnownLongitude;

    public Agent() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }


    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public Double getLastKnownLatitude() {
        return lastKnownLatitude;
    }

    public void setLastKnownLatitude(Double lastKnownLatitude) {
        this.lastKnownLatitude = lastKnownLatitude;
    }

    public Double getLastKnownLongitude() {
        return lastKnownLongitude;
    }

    public void setLastKnownLongitude(Double lastKnownLongitude) {
        this.lastKnownLongitude = lastKnownLongitude;
    }
}
