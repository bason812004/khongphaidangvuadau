package com.sportsbooking.enterprise.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class KafkaEventProducer {

    @Autowired(required = false)
    private KafkaTemplate<String, String> kafkaTemplate;

    public static final String TOPIC_BOOKING_EVENTS = "sports-booking-events";
    public static final String TOPIC_TICKET_EVENTS = "sports-maker-checker-events";
    public static final String TOPIC_AUDIT_LOGS = "sports-audit-events";

    public void publishBookingEvent(String bookingId, String eventType, String payloadJson) {
        log.info("[KAFKA PRODUCER] Publishing to topic '{}' | Key: {} | Event: {}", TOPIC_BOOKING_EVENTS, bookingId, eventType);
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(TOPIC_BOOKING_EVENTS, bookingId, payloadJson);
            } catch (Exception e) {
                log.warn("Kafka broker unreachable (mock mode): {}", e.getMessage());
            }
        } else {
            log.debug("KafkaTemplate not configured. In-memory standalone mode active.");
        }
    }

    public void publishMakerCheckerEvent(String ticketId, String status, String details) {
        log.info("[KAFKA PRODUCER] Publishing to topic '{}' | Ticket: {} | Status: {}", TOPIC_TICKET_EVENTS, ticketId, status);
        if (kafkaTemplate != null) {
            try {
                kafkaTemplate.send(TOPIC_TICKET_EVENTS, ticketId, details);
            } catch (Exception e) {
                log.warn("Kafka broker unreachable (mock mode): {}", e.getMessage());
            }
        } else {
            log.debug("KafkaTemplate not configured. In-memory standalone mode active.");
        }
    }
}
