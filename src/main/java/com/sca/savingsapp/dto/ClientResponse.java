package com.sca.savingsapp.dto;

import java.time.LocalDate;

public class ClientResponse {
    private Integer id;
    private String firstName;
    private String lastName;
    private String otherName;
    private String ghanaCardNumber;
    private String primaryAccountNumber;

    public ClientResponse(Integer id, String firstName, String lastName, String otherName, String ghanaCardNumber, String primaryAccountNumber) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.otherName = otherName;
        this.ghanaCardNumber = ghanaCardNumber;
        this.primaryAccountNumber = primaryAccountNumber;
    }

    public Integer getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getOtherName() { return otherName; }
    public String getGhanaCardNumber() { return ghanaCardNumber; }
    public String getPrimaryAccountNumber() { return primaryAccountNumber; }
}
