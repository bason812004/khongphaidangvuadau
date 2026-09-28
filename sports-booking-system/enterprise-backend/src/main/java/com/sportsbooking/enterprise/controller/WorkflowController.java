package com.sportsbooking.enterprise.controller;

import com.sportsbooking.enterprise.dto.ApiResponse;
import com.sportsbooking.enterprise.dto.ReviewDecisionRequest;
import com.sportsbooking.enterprise.dto.TaskResponse;
import com.sportsbooking.enterprise.dto.TicketRequest;
import com.sportsbooking.enterprise.workflow.MakerCheckerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workflow")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class WorkflowController {

    private final MakerCheckerService makerCheckerService;

    /**
     * Maker Endpoint: Create new ticket / start BPMN workflow
     */
    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTicket(@RequestBody TicketRequest request) {
        Map<String, Object> result = makerCheckerService.createTicketByMaker(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(result, "Ticket submitted by Maker and Camunda process started"));
    }

    /**
     * Checker Endpoint: Get pending tickets for review
     */
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasks(
            @RequestParam(required = false, defaultValue = "ROLE_ADMIN") String group) {
        List<TaskResponse> tasks = makerCheckerService.getTasksForChecker(group);
        return ResponseEntity.ok(ApiResponse.ok(tasks, "Pending review tasks retrieved successfully"));
    }

    /**
     * Checker Endpoint: Approve or Reject a ticket
     */
    @PostMapping("/tasks/{taskId}/review")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reviewTask(
            @PathVariable String taskId,
            @RequestBody ReviewDecisionRequest decision) {
        Map<String, Object> result = makerCheckerService.completeCheckerTask(taskId, decision);
        return ResponseEntity.ok(ApiResponse.ok(result, "Checker review submitted and workflow progressed"));
    }
}
