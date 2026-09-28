package com.sportsbooking.enterprise.workflow.delegate;

import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("processApprovedTicketDelegate")
@Slf4j
public class ProcessApprovedTicketDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String title = (String) execution.getVariable("title");
        String ticketType = (String) execution.getVariable("ticketType");
        String maker = (String) execution.getVariable("makerUsername");
        Double amount = (Double) execution.getVariable("amount");
        String reviewer = (String) execution.getVariable("reviewerUsername");

        log.info("[CAMUNDA SERVICE TASK] Processing APPROVED Ticket: '{}' (Type: {}) by Maker '{}'. Reviewer: '{}'. Amount: {}",
                title, ticketType, maker, reviewer, amount);

        // Perform business logic: activate court or credit partner wallet payout
        execution.setVariable("status", "APPROVED");
        execution.setVariable("processedAt", new java.util.Date());
    }
}
