package com.sportsbooking.enterprise.workflow;

import com.sportsbooking.enterprise.dto.ReviewDecisionRequest;
import com.sportsbooking.enterprise.dto.TaskResponse;
import com.sportsbooking.enterprise.dto.TicketRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.HistoryService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MakerCheckerService {

    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final HistoryService historyService;

    private static final String PROCESS_KEY = "makerCheckerTicketProcess";

    /**
     * Maker creates a ticket and starts the Camunda BPMN workflow
     */
    public Map<String, Object> createTicketByMaker(TicketRequest request) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("title", request.getTitle());
        variables.put("ticketType", request.getTicketType());
        variables.put("makerUsername", request.getMakerUsername() != null ? request.getMakerUsername() : "partner_user");
        variables.put("makerEmail", request.getMakerEmail() != null ? request.getMakerEmail() : "partner@example.com");
        variables.put("amount", request.getAmount() != null ? request.getAmount() : 0.0);
        variables.put("description", request.getDescription());
        variables.put("createdAt", new Date());

        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(PROCESS_KEY, variables);
        log.info("Started Camunda Process Instance ID: {} for Ticket '{}'", processInstance.getId(), request.getTitle());

        Map<String, Object> result = new HashMap<>();
        result.put("processInstanceId", processInstance.getId());
        result.put("businessKey", processInstance.getBusinessKey());
        result.put("status", "SUBMITTED_WAITING_CHECKER");
        return result;
    }

    /**
     * Checker gets pending tasks to review
     */
    public List<TaskResponse> getTasksForChecker(String candidateGroup) {
        List<Task> tasks;
        if (candidateGroup != null && !candidateGroup.isBlank()) {
            tasks = taskService.createTaskQuery()
                    .processDefinitionKey(PROCESS_KEY)
                    .taskCandidateGroup(candidateGroup)
                    .orderByTaskCreateTime().desc()
                    .list();
        } else {
            tasks = taskService.createTaskQuery()
                    .processDefinitionKey(PROCESS_KEY)
                    .orderByTaskCreateTime().desc()
                    .list();
        }

        return tasks.stream().map(task -> {
            Map<String, Object> vars = taskService.getVariables(task.getId());
            return TaskResponse.builder()
                    .taskId(task.getId())
                    .taskName(task.getName())
                    .processInstanceId(task.getProcessInstanceId())
                    .processDefinitionId(task.getProcessDefinitionId())
                    .assignee(task.getAssignee())
                    .createTime(task.getCreateTime())
                    .variables(vars)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Checker completes the task with Approve or Reject
     */
    public Map<String, Object> completeCheckerTask(String taskId, ReviewDecisionRequest decision) {
        Task task = taskService.createTaskQuery().taskId(taskId).singleResult();
        if (task == null) {
            throw new RuntimeException("Camunda Task not found with ID: " + taskId);
        }

        Map<String, Object> variables = new HashMap<>();
        variables.put("approved", decision.isApproved());
        variables.put("reviewerUsername", decision.getReviewerUsername() != null ? decision.getReviewerUsername() : "admin_checker");
        variables.put("note", decision.getNote());
        variables.put("reviewedAt", new Date());

        taskService.complete(taskId, variables);
        log.info("Completed Camunda Task ID: {} with decision approved={}", taskId, decision.isApproved());

        Map<String, Object> result = new HashMap<>();
        result.put("taskId", taskId);
        result.put("status", decision.isApproved() ? "APPROVED" : "REJECTED");
        result.put("reviewer", decision.getReviewerUsername());
        result.put("note", decision.getNote());
        return result;
    }
}
