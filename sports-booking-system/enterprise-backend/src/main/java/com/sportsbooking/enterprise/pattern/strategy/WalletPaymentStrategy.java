package com.sportsbooking.enterprise.pattern.strategy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("WALLET")
@Slf4j
public class WalletPaymentStrategy implements PaymentStrategy {
    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        log.info("[STRATEGY PATTERN] Executing System Escrow Wallet Deduction for booking: {} - Amount: {} VND",
                request.getBookingId(), request.getAmount());
        String txn = "WLT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return PaymentResult.builder()
                .success(true)
                .transactionId(txn)
                .paymentMethod("WALLET")
                .amount(request.getAmount())
                .message("Balance debited from User Wallet successfully")
                .build();
    }

    @Override
    public String getMethodName() {
        return "WALLET";
    }
}
