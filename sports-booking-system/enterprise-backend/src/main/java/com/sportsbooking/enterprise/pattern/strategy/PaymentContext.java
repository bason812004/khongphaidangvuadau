package com.sportsbooking.enterprise.pattern.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentContext {

    private final Map<String, PaymentStrategy> strategyMap;

    public PaymentStrategy.PaymentResult executePayment(String method, PaymentStrategy.PaymentRequest request) {
        String key = method != null ? method.toUpperCase() : "CASHIER";
        PaymentStrategy strategy = strategyMap.get(key);

        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported payment method: " + method);
        }

        return strategy.processPayment(request);
    }
}
