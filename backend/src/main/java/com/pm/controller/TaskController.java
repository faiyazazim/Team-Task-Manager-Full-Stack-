package com.pm.controller;

import com.pm.dto.TaskDTO;
import com.pm.model.*;
import com.pm.repository.UserRepository;
import com.pm.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskDTO dto) {
        try {
            User user = getCurrentUser();
            Task task = taskService.createTask(dto, user);
            return ResponseEntity.ok(toMap(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getTasksByProject(@PathVariable Long projectId) {
        try {
            User user = getCurrentUser();
            List<Task> tasks = taskService.getTasksByProject(projectId, user);
            return ResponseEntity.ok(tasks.stream().map(this::toMap).toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody TaskDTO dto) {
        try {
            User user = getCurrentUser();
            Task task = taskService.updateTask(id, dto, user);
            return ResponseEntity.ok(toMap(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User user = getCurrentUser();
            String status = body.get("status");
            Task task = taskService.updateTaskStatus(id, status, user);
            return ResponseEntity.ok(toMap(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            taskService.deleteTask(id, user);
            return ResponseEntity.ok(Map.of("message", "Task deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<?> getMyTasks() {
        try {
            User user = getCurrentUser();
            List<Task> tasks = taskService.getMyTasks(user);
            return ResponseEntity.ok(tasks.stream().map(this::toMap).toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toMap(Task t) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", t.getId());
        map.put("title", t.getTitle());
        map.put("description", t.getDescription());
        map.put("status", t.getStatus());
        map.put("priority", t.getPriority());
        map.put("dueDate", t.getDueDate());
        map.put("createdAt", t.getCreatedAt());
        map.put("projectId", t.getProject().getId());
        map.put("projectName", t.getProject().getName());
        if (t.getAssignee() != null) {
            map.put("assigneeId", t.getAssignee().getId());
            map.put("assigneeName", t.getAssignee().getName());
        }
        map.put("createdById", t.getCreatedBy().getId());
        map.put("createdByName", t.getCreatedBy().getName());
        return map;
    }
}
