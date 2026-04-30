package com.pm.service;

import com.pm.dto.TaskDTO;
import com.pm.model.*;
import com.pm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectMemberRepository memberRepository;

    public Task createTask(TaskDTO dto, User creator) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!memberRepository.existsByProjectAndUser(project, creator)) {
            throw new RuntimeException("You are not a member of this project");
        }

        User assignee = null;
        if (dto.getAssigneeId() != null) {
            assignee = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            if (!memberRepository.existsByProjectAndUser(project, assignee)) {
                throw new RuntimeException("Assignee is not a member of this project");
            }
        }

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .project(project)
                .assignee(assignee)
                .createdBy(creator)
                .status(Task.Status.TODO)
                .priority(Task.Priority.MEDIUM)
                .dueDate(dto.getDueDate())
                .build();

        if (dto.getStatus() != null) {
            try { task.setStatus(Task.Status.valueOf(dto.getStatus().toUpperCase())); } catch (Exception ignored) {}
        }
        if (dto.getPriority() != null) {
            try { task.setPriority(Task.Priority.valueOf(dto.getPriority().toUpperCase())); } catch (Exception ignored) {}
        }

        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!memberRepository.existsByProjectAndUser(project, user)) {
            throw new RuntimeException("Access denied");
        }
        return taskRepository.findByProject(project);
    }

    public Task updateTask(Long id, TaskDTO dto, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isAdminOrCreator = task.getCreatedBy().getId().equals(user.getId()) ||
                memberRepository.findByProjectAndUser(task.getProject(), user)
                        .map(m -> m.getRole() == ProjectMember.Role.ADMIN)
                        .orElse(false);

        if (!isAdminOrCreator) throw new RuntimeException("Not authorized to update this task");

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getStatus() != null) {
            try { task.setStatus(Task.Status.valueOf(dto.getStatus().toUpperCase())); } catch (Exception ignored) {}
        }
        if (dto.getPriority() != null) {
            try { task.setPriority(Task.Priority.valueOf(dto.getPriority().toUpperCase())); } catch (Exception ignored) {}
        }
        if (dto.getAssigneeId() != null) {
            userRepository.findById(dto.getAssigneeId()).ifPresent(task::setAssignee);
        }

        return taskRepository.save(task);
    }

    public Task updateTaskStatus(Long id, String status, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isMember = memberRepository.existsByProjectAndUser(task.getProject(), user);
        if (!isMember) throw new RuntimeException("Access denied");

        try {
            task.setStatus(Task.Status.valueOf(status.toUpperCase()));
        } catch (Exception e) {
            throw new RuntimeException("Invalid status: " + status);
        }

        return taskRepository.save(task);
    }

    public void deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        boolean isAdminOrCreator = task.getCreatedBy().getId().equals(user.getId()) ||
                memberRepository.findByProjectAndUser(task.getProject(), user)
                        .map(m -> m.getRole() == ProjectMember.Role.ADMIN)
                        .orElse(false);

        if (!isAdminOrCreator) throw new RuntimeException("Not authorized to delete this task");

        taskRepository.delete(task);
    }

    public List<Task> getMyTasks(User user) {
        return taskRepository.findByAssignee(user);
    }
}
