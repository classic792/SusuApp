package com.sca.savingsapp.dto;

public class LoginRequest {

    private String email; // User's email address
    private String password; // User's plain-text password for authentication

    public LoginRequest() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
