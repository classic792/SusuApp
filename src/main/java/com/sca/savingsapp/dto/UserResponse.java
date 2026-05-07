package com.sca.savingsapp.dto;

public class UserResponse {
    private Integer id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private java.math.BigDecimal dailyLimit;
    private java.math.BigDecimal dailyCollected;
    private String status;

    public UserResponse(Integer id, String email, String firstName, String lastName, String role) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public UserResponse(Integer id, String email, String firstName, String lastName, String role, java.math.BigDecimal dailyLimit, java.math.BigDecimal dailyCollected, String status) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.dailyLimit = dailyLimit;
        this.dailyCollected = dailyCollected;
        this.status = status;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public java.math.BigDecimal getDailyLimit() { return dailyLimit; }
    public void setDailyLimit(java.math.BigDecimal dailyLimit) { this.dailyLimit = dailyLimit; }

    public java.math.BigDecimal getDailyCollected() { return dailyCollected; }
    public void setDailyCollected(java.math.BigDecimal dailyCollected) { this.dailyCollected = dailyCollected; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
