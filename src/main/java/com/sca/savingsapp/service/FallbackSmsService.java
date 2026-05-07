package com.sca.savingsapp.service;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

/**
 * SMS service with fallback logic.
 */
@Service
@Primary
public class FallbackSmsService implements SmsService {

    private final ArkeselSmsService arkeselSmsService;
    private final HubtelSmsService hubtelSmsService;

    public FallbackSmsService(ArkeselSmsService arkeselSmsService, HubtelSmsService hubtelSmsService) {
        this.arkeselSmsService = arkeselSmsService;
        this.hubtelSmsService = hubtelSmsService;
    }

    @Override
    public boolean sendSms(String to, String message) {
        // Try Arkesel first
        if (arkeselSmsService.sendSms(to, message)) {
            return true;
        }
        
        // Fallback to Hubtel
        System.out.println("Arkesel failed, falling back to Hubtel...");
        return hubtelSmsService.sendSms(to, message);
    }
}
