package com.sportsbooking.enterprise.pattern.strategy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("CASHIER")
@Slf4j
public class CashierPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        log.info("[STRATEGY PATTERN] Executing Kiosk / Cashier Counter Cash Payment for booking: {} - Amount: {} VND",
                request.getBookingId(), request.getAmount());
        String txn = "CSH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return PaymentResult.builder()
                .success(true)
                .transactionId(txn)
                .paymentMethod("CASHIER")
                .amount(request.getAmount())
                .message("Cash received and confirmed at Kiosk POS counter")
                .build();
    }

    @Override
    public String getMethodName() {
        return "CASHIER";
    }
}
