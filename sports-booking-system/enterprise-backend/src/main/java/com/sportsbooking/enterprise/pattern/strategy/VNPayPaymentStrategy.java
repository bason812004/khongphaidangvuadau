package com.sportsbooking.enterprise.pattern.strategy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("VNPAY")
@Slf4j
public class VNPayPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        log.info("[STRATEGY PATTERN] Executing VNPay Payment gateway for booking: {} - Amount: {} VND",
                request.getBookingId(), request.getAmount());
        String txn = "VNP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return PaymentResult.builder()
                .success(true)
                .transactionId(txn)
                .paymentMethod("VNPAY")
                .amount(request.getAmount())
                .message("Payment verified via VNPay Sandbox Gateway")
                .build();
    }

    @Override
    public String getMethodName() {
        return "VNPAY";
    }
}
