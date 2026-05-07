package com.sca.savingsapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Arkesel implementation of SmsService.
 */
@Service
public class ArkeselSmsService implements SmsService {

    @Value("${arkesel.api.key:}")
    private String apiKey;

    @Value("${arkesel.sender.id:CollectorPro}")
    private String senderId;

    private final RestTemplate restTemplate;
    private static final String ARKESEL_URL = "https://sms.arkesel.com/sms/api";

    public ArkeselSmsService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5 seconds
        factory.setReadTimeout(10000);    // 10 seconds
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public boolean sendSms(String to, String message) {
        System.out.println(">>> ARKESEL SMS TRIGGERED for " + to);
        
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("YOUR_ARKESEL_API_KEY")) {
            System.err.println("!!! Arkesel API Key missing or default: " + (apiKey == null ? "NULL" : apiKey));
            return false;
        }

        try {
            // Arkesel v1 API uses query parameters: action, api_key, to, from, sms
            String formattedTo = to.replace("+", "").trim();
            String url = org.springframework.web.util.UriComponentsBuilder.fromHttpUrl(ARKESEL_URL)
                    .queryParam("action", "send-sms")
                    .queryParam("api_key", apiKey)
                    .queryParam("to", formattedTo)
                    .queryParam("from", senderId)
                    .queryParam("sms", message)
                    .build().toUriString();

            System.out.println(">>> Attempting Arkesel v1 GET: " + url.replace(apiKey, "[SECRET_KEY]"));

            // Get response as ResponseEntity to check status codes
            org.springframework.http.ResponseEntity<String> responseEntity = restTemplate.getForEntity(url, String.class);
            String responseBody = responseEntity.getBody();
            
            System.out.println(">>> Arkesel Raw Response Status: " + responseEntity.getStatusCode());
            System.out.println(">>> Arkesel Raw Response Body: " + responseBody);
            
            if (responseBody != null && (responseBody.contains("OK") || responseBody.contains("100") || responseBody.toLowerCase().contains("success"))) {
                System.out.println(">>> SUCCESS: Arkesel SMS sent successfully.");
                return true;
            } else {
                System.err.println(">>> FAILURE: Arkesel API did not return success. Body: " + responseBody);
                return false;
            }
        } catch (org.springframework.web.client.HttpClientErrorException | org.springframework.web.client.HttpServerErrorException e) {
            System.err.println(">>> HTTP ERROR: Arkesel returned " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            System.err.println(">>> UNEXPECTED ERROR sending Arkesel SMS: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
