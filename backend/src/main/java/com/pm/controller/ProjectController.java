package com.pm.controller;

import com.pm.dto.ProjectDTO;
import com.pm.model.*;
import com.pm.repository.UserRepository;
import com.pm.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getAllProjects() {
        try {
            User user = getCurrentUser();
            List<Project> projects = projectService.getAllUserProjects(user);
            return ResponseEntity.ok(projects.stream().map(this::toMap).toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectDTO dto) {
        try {
            User user = getCurrentUser();
            Project project = projectService.createProject(dto, user);
            return ResponseEntity.ok(toMap(project));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProject(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            Project project = projectService.getProjectById(id, user);
            Map<String, Object> result = toMap(project);
            List<ProjectMember> members = projectService.getProjectMembers(id, user);
            result.put("members", members.stream().map(m -> Map.of(
                "id", m.getId(),
                "userId", m.getUser().getId(),
                "name", m.getUser().getName(),
                "email", m.getUser().getEmail(),
                "role", m.getRole()
            )).toList());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody ProjectDTO dto) {
        try {
            User user = getCurrentUser();
            Project project = projectService.updateProject(id, dto, user);
            return ResponseEntity.ok(toMap(project));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            projectService.deleteProject(id, user);
            return ResponseEntity.ok(Map.of("message", "Project deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<?> addMember(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User user = getCurrentUser();
            String email = body.get("email");
            String role = body.getOrDefault("role", "MEMBER");
            ProjectMember member = projectService.addMember(id, email, role, user);
            return ResponseEntity.ok(Map.of(
                "id", member.getId(),
                "userId", member.getUser().getId(),
                "name", member.getUser().getName(),
                "email", member.getUser().getEmail(),
                "role", member.getRole()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeMember(@PathVariable Long id, @PathVariable Long userId) {
        try {
            User user = getCurrentUser();
            projectService.removeMember(id, userId, user);
            return ResponseEntity.ok(Map.of("message", "Member removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> toMap(Project p) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", p.getId());
        map.put("name", p.getName());
        map.put("description", p.getDescription());
        map.put("status", p.getStatus());
        map.put("deadline", p.getDeadline());
        map.put("createdAt", p.getCreatedAt());
        map.put("ownerId", p.getOwner().getId());
        map.put("ownerName", p.getOwner().getName());
        return map;
    }
}
