package com.pm.service;

import com.pm.model.*;
import com.pm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectMemberRepository memberRepository;

    public Map<String, Object> getDashboardStats(User user) {
        List<Project> projects = projectRepository.findAllProjectsForUser(user);

        List<Task> allTasks = new ArrayList<>();
        for (Project p : projects) {
            allTasks.addAll(taskRepository.findByProject(p));
        }

        long totalProjects = projects.size();
        long totalTasks = allTasks.size();

        Map<String, Long> tasksByStatus = new LinkedHashMap<>();
        tasksByStatus.put("TODO", allTasks.stream().filter(t -> t.getStatus() == Task.Status.TODO).count());
        tasksByStatus.put("IN_PROGRESS", allTasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count());
        tasksByStatus.put("REVIEW", allTasks.stream().filter(t -> t.getStatus() == Task.Status.REVIEW).count());
        tasksByStatus.put("DONE", allTasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count());

        long overdueTasks = allTasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getDueDate().isBefore(LocalDate.now())
                        && t.getStatus() != Task.Status.DONE)
                .count();

        List<Task> myTasks = taskRepository.findByAssignee(user);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProjects", totalProjects);
        stats.put("totalTasks", totalTasks);
        stats.put("tasksByStatus", tasksByStatus);
        stats.put("overdueTasks", overdueTasks);
        stats.put("myAssignedTasks", myTasks.size());

        // Project summary
        List<Map<String, Object>> projectSummaries = new ArrayList<>();
        for (Project p : projects) {
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("id", p.getId());
            summary.put("name", p.getName());
            summary.put("status", p.getStatus());
            summary.put("deadline", p.getDeadline());
            List<Task> projectTasks = taskRepository.findByProject(p);
            summary.put("taskCount", projectTasks.size());
            summary.put("completedTasks", projectTasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count());
            projectSummaries.add(summary);
        }
        stats.put("projectSummaries", projectSummaries);

        return stats;
    }
}
