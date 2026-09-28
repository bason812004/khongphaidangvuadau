package com.sportsbooking.enterprise.kafka;

import com.sportsbooking.enterprise.service.RedisCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class KafkaEventConsumer {

    private final RedisCacheService redisCacheService;

    @KafkaListener(topics = KafkaEventProducer.TOPIC_BOOKING_EVENTS, groupId = "sports-enterprise-group", autoStartup = "${spring.kafka.listener.auto-startup:false}")
    public void consumeBookingEvent(String message) {
        log.info("[KAFKA CONSUMER] Received Booking Event: {}", message);
        // Invalidate booking slot availability cache in Redis to maintain real-time consistency
        redisCacheService.delete("sports:courts:availability");
        log.info("[KAFKA CONSUMER] Evicted Redis cache key 'sports:courts:availability' after booking event.");
    }

    @KafkaListener(topics = KafkaEventProducer.TOPIC_TICKET_EVENTS, groupId = "sports-enterprise-group", autoStartup = "${spring.kafka.listener.auto-startup:false}")
    public void consumeMakerCheckerEvent(String message) {
        log.info("[KAFKA CONSUMER] Received Maker-Checker Ticket Event: {}", message);
    }
}
