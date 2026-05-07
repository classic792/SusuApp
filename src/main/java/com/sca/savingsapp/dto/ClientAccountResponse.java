package com.sca.savingsapp.dto;

import java.math.BigDecimal;

public class ClientAccountResponse {

    private Integer clientId;
    private String firstName;
    private String lastName;
    private String ghanaCardNumber;
    private String message;
    
    // New fields
    private String accountNumber;
    private BigDecimal balance;

    public ClientAccountResponse() {
    }

    public ClientAccountResponse(Integer clientId, String firstName, String lastName, String ghanaCardNumber, String message, String accountNumber, BigDecimal balance) {
        this.clientId = clientId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.ghanaCardNumber = ghanaCardNumber;
        this.message = message;
        this.accountNumber = accountNumber;
        this.balance = balance;
    }

    public Integer getClientId() {
        return clientId;
    }

    public void setClientId(Integer clientId) {
        this.clientId = clientId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getGhanaCardNumber() {
        return ghanaCardNumber;
    }

    public void setGhanaCardNumber(String ghanaCardNumber) {
        this.ghanaCardNumber = ghanaCardNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
