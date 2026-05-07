package com.sca.savingsapp.dto;

public class LoginResponse {

    private String accessToken; // The generated JWT string
    private String tokenType; // Usually "Bearer"
    private String role; // The role of the authenticated user
    private Integer id; // The ID of the authenticated user


    public LoginResponse() {
    }

    public LoginResponse(String accessToken, String tokenType, String role, Integer id) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.role = role;
        this.id = id;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }
}
