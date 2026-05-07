package com.sca.savingsapp.service;

/**
 * Interface for sending SMS messages.
 */
public interface SmsService {
    /**
     * Sends an SMS message to a phone number.
     * @param to The recipient's phone number.
     * @param message The message content.
     * @return true if sent successfully, false otherwise.
     */
    boolean sendSms(String to, String message);
}
