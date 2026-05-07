package com.sca.savingsapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Hubtel implementation of SmsService.
 */
@Service
public class HubtelSmsService implements SmsService {

    @Value("${hubtel.client.id:}")
    private String clientId;

    @Value("${hubtel.client.secret:}")
    private String clientSecret;

    @Value("${hubtel.sender.id:CollectorPro}")
    private String senderId;

    private final RestTemplate restTemplate;
    private static final String HUBTEL_URL = "https://api.hubtel.com/v1/messages/send";

    public HubtelSmsService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(10000);    // 10 seconds
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public boolean sendSms(String to, String message) {
        if (clientId == null || clientId.isEmpty() || clientSecret == null || clientSecret.isEmpty()) {
            System.err.println("Hubtel credentials not configured. Skipping fallback SMS.");
            return false;
        }

        try {
            String auth = clientId + ":" + clientSecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + encodedAuth);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("From", senderId);
            body.put("To", to);
            body.put("Content", message);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            Map<String, Object> response = restTemplate.postForObject(HUBTEL_URL, entity, Map.class);
            
            if (response != null && ("00".equals(String.valueOf(response.get("status"))) || response.containsKey("messageId"))) {
                System.out.println("Hubtel SMS sent successfully to " + to);
                return true;
            } else {
                System.err.println("Hubtel SMS failed. Response: " + response);
                return false;
            }
        } catch (Exception e) {
            System.err.println("Error sending SMS via Hubtel: " + e.getMessage());
            return false;
        }
    }
}
