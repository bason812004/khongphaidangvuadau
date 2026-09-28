package com.sportsbooking.enterprise.pattern.factory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationFactory {

    private final Map<String, NotificationService> notificationServiceMap;

    public NotificationService getNotificationService(String type) {
        String key = (type != null ? type.toUpperCase() : "EMAIL") + "_NOTIFICATION";
        NotificationService service = notificationServiceMap.get(key);
        if (service == null) {
            throw new IllegalArgumentException("Unsupported notification channel type: " + type);
        }
        return service;
    }
}
