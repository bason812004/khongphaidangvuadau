package com.sportsbooking.enterprise.workflow.delegate;

import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component("processRejectedTicketDelegate")
@Slf4j
public class ProcessRejectedTicketDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String title = (String) execution.getVariable("title");
        String note = (String) execution.getVariable("note");
        String reviewer = (String) execution.getVariable("reviewerUsername");

        log.info("[CAMUNDA SERVICE TASK] Processing REJECTED Ticket: '{}'. Reviewer: '{}'. Reason: '{}'",
                title, reviewer, note);

        // Perform business rollback: refund pending wallet balance or flag court as rejected
        execution.setVariable("status", "REJECTED");
        execution.setVariable("processedAt", new java.util.Date());
    }
}
