package com.sportsbooking.enterprise.pattern.strategy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public interface PaymentStrategy {
    PaymentResult processPayment(PaymentRequest request);
    String getMethodName();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class PaymentRequest {
        private String bookingId;
        private Double amount;
        private String customerEmail;
        private String customerPhone;
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    class PaymentResult {
        private boolean success;
        private String transactionId;
        private String paymentMethod;
        private Double amount;
        private String message;
        @Builder.Default
        private LocalDateTime processedAt = LocalDateTime.now();
    }
}
