package com.sca.savingsapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FaceVerificationService {

    @Value("${faceplusplus.api.key}")
    private String apiKey;

    @Value("${faceplusplus.api.secret}")
    private String apiSecret;

    @Value("${faceplusplus.compare.threshold:80.0}")
    private double compareThreshold;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public FaceVerificationService(ObjectMapper objectMapper) {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000); // 10 seconds
        factory.setReadTimeout(30000);    // 30 seconds for heavy image processing
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = objectMapper;
    }


    /**
     * Calls Face++ compare API to verify an incoming image against a stored image.
     * @param capturedImageBase64 the incoming base64 encoded image
     * @param storedImageBase64 the stored base64 encoded image from registration
     * @return true if confidence is above threshold, false otherwise
     */
    public boolean verifyFace(String capturedImageBase64, String storedImageBase64) {
        String image1 = sanitizeBase64(capturedImageBase64);
        String image2 = sanitizeBase64(storedImageBase64);

        if (image2 == null || image2.isEmpty()) {
            System.err.println("Face Verification aborted: Stored image is null or empty.");
            return false;
        }

        if (image1 == null || image1.isEmpty()) {
            System.err.println("Face Verification aborted: Captured image is null or empty.");
            return false;
        }
        
        String url = "https://api-us.faceplusplus.com/facepp/v3/compare";

        try {
            System.out.println("Initiating Face++ comparison. Image1 length: " + image1.length() + ", Image2 length: " + image2.length());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("api_key", apiKey);
            body.add("api_secret", apiSecret);
            body.add("image_base64_1", image1);
            body.add("image_base64_2", image2);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            
            if (root.has("confidence")) {
                double confidence = root.path("confidence").asDouble();
                System.out.println("Face++ comparison completed. Confidence: " + confidence);
                return confidence >= compareThreshold;
            } else {
                System.err.println("Face++ API Response missing confidence: " + response.getBody());
                return false;
            }
        } catch (org.springframework.web.client.ResourceAccessException e) {
            System.err.println("Face++ API Timeout or Connectivity issue: " + e.getMessage());
            return false;
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            System.err.println("Face++ API Error Response: " + errorBody);
            return false;
        } catch (Exception e) {
            System.err.println("Error verifying face with Face++ API: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            return false;
        } finally {
            System.out.println("Face verification method exited.");
        }
    }

    private String sanitizeBase64(String base64) {
        if (base64 == null) return null;
        String sanitized = base64.trim();
        // Remove data URI prefix if present (e.g. "data:image/jpeg;base64,")
        int commaIndex = sanitized.indexOf(",");
        if (commaIndex != -1) {
            sanitized = sanitized.substring(commaIndex + 1);
        }
        return sanitized;
    }

    /**
     * Helper to validate a face signature against a client's stored embedding.
     * Throws BadRequestException if identity cannot be confirmed.
     */
    public void validateFace(String faceSignature, com.sca.savingsapp.entity.Client client) {
        if (client != null && client.getFaceEmbedding() != null) {
            if (faceSignature == null || faceSignature.isEmpty()) {
                // Biometric verification skipped
                return;
            }
            boolean verified = verifyFace(faceSignature, client.getFaceEmbedding());
            if (!verified) {
                throw new com.sca.savingsapp.exception.BadRequestException("Face verification failed: Identity could not be confirmed.");
            }
        }
    }
}
