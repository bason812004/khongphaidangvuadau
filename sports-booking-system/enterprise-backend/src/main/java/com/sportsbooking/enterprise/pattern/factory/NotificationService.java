package com.sportsbooking.enterprise.pattern.factory;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

public interface NotificationService {
    void sendNotification(String recipient, String message);
    String getType();
}

@Component("EMAIL_NOTIFICATION")
@Slf4j
class EmailNotificationServiceImpl implements NotificationService {
    @Override
    public void sendNotification(String recipient, String message) {
        log.info("[FACTORY PATTERN] Sending EMAIL notification to: {} - Content: {}", recipient, message);
    }

    @Override
    public String getType() {
        return "EMAIL";
    }
}

@Component("SMS_NOTIFICATION")
@Slf4j
class SmsNotificationServiceImpl implements NotificationService {
    @Override
    public void sendNotification(String recipient, String message) {
        log.info("[FACTORY PATTERN] Sending SMS notification via Telephony Gateway to: {} - Content: {}", recipient, message);
    }

    @Override
    public String getType() {
        return "SMS";
    }
}
