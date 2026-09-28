package com.sportsbooking.enterprise.workflow.delegate;

import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component("sendEmailNotificationDelegate")
@Slf4j
public class SendEmailNotificationDelegate implements JavaDelegate {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String makerEmail = (String) execution.getVariable("makerEmail");
        String title = (String) execution.getVariable("title");
        String status = (String) execution.getVariable("status");
        String note = (String) execution.getVariable("note");

        String recipient = makerEmail != null && !makerEmail.isBlank() ? makerEmail : "partner@sportsbooking.com";
        String subject = "[SportsBooking Notification] Your Ticket '" + title + "' has been " + status;
        String content = "Hello,\n\nYour ticket '" + title + "' has been reviewed with result: " + status + ".\n"
                + (note != null ? "Reviewer Note: " + note + "\n\n" : "\n")
                + "Thank you,\nSports Booking Administration Team";

        log.info("[CAMUNDA SERVICE TASK] Dispatching Email Notification to '{}' - Subject: '{}'", recipient, subject);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(content);
                mailSender.send(message);
                log.info("Email successfully sent via JavaMailSender to {}", recipient);
            } catch (Exception e) {
                log.warn("JavaMailSender failed to send external email (SMTP might not be configured). Logged content: {}", content);
            }
        } else {
            log.info("JavaMailSender mock dispatch completed. Content: {}", content);
        }
    }
}
