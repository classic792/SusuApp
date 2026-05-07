package com.sca.savingsapp.dto;

import com.sca.savingsapp.entity.AccountType;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for returning account details along with client information.
 */
public class AccountResponse {
    private Integer id;
    private Integer clientId;
    private String clientName;
    private String otherName;
    private String accountNumber;
    private AccountType accountType;
    private BigDecimal balance;
    private LocalDate openedDate;
    private String status;
    private String gender;
    private LocalDate dateOfBirth;
    private String ghanaCardNumber;
    private String phoneNumber;

    public AccountResponse() {}

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getClientId() { return clientId; }
    public void setClientId(Integer clientId) { this.clientId = clientId; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public String getOtherName() { return otherName; }
    public void setOtherName(String otherName) { this.otherName = otherName; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public LocalDate getOpenedDate() { return openedDate; }
    public void setOpenedDate(LocalDate openedDate) { this.openedDate = openedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getGhanaCardNumber() { return ghanaCardNumber; }
    public void setGhanaCardNumber(String ghanaCardNumber) { this.ghanaCardNumber = ghanaCardNumber; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}
