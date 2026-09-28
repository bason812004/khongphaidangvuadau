package com.sportsbooking.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {
    private String title;
    private String ticketType; // COURT_REGISTRATION, WITHDRAWAL_REQUEST, SERVICE_DISPUTE
    private String makerUsername;
    private String makerEmail;
    private Double amount;
    private String description;
    private Map<String, Object> metadata;
}
