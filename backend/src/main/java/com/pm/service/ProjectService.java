package com.pm.service;

import com.pm.dto.ProjectDTO;
import com.pm.model.*;
import com.pm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectMemberRepository memberRepository;

    @Autowired
    private TaskRepository taskRepository;

    public Project createProject(ProjectDTO dto, User owner) {
        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .status(Project.Status.ACTIVE)
                .deadline(dto.getDeadline())
                .owner(owner)
                .build();

        if (dto.getStatus() != null) {
            try {
                project.setStatus(Project.Status.valueOf(dto.getStatus().toUpperCase()));
            } catch (Exception ignored) {}
        }

        Project saved = projectRepository.save(project);

        // Add owner as ADMIN member
        ProjectMember ownerMember = ProjectMember.builder()
                .project(saved)
                .user(owner)
                .role(ProjectMember.Role.ADMIN)
                .build();
        memberRepository.save(ownerMember);

        // Add additional members
        if (dto.getMemberEmails() != null) {
            for (String email : dto.getMemberEmails()) {
                userRepository.findByEmail(email).ifPresent(user -> {
                    if (!memberRepository.existsByProjectAndUser(saved, user)) {
                        ProjectMember member = ProjectMember.builder()
                                .project(saved)
                                .user(user)
                                .role(ProjectMember.Role.MEMBER)
                                .build();
                        memberRepository.save(member);
                    }
                });
            }
        }

        return saved;
    }

    public List<Project> getAllUserProjects(User user) {
        return projectRepository.findAllProjectsForUser(user);
    }

    public Project getProjectById(Long id, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!hasAccess(project, user)) {
            throw new RuntimeException("Access denied");
        }
        return project;
    }

    public Project updateProject(Long id, ProjectDTO dto, User user) {
        Project project = getProjectById(id, user);
        if (!isAdminOrOwner(project, user)) {
            throw new RuntimeException("Only admin or owner can update project");
        }

        if (dto.getName() != null) project.setName(dto.getName());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getDeadline() != null) project.setDeadline(dto.getDeadline());
        if (dto.getStatus() != null) {
            try {
                project.setStatus(Project.Status.valueOf(dto.getStatus().toUpperCase()));
            } catch (Exception ignored) {}
        }

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id, User user) {
        Project project = getProjectById(id, user);
        if (!project.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("Only owner can delete project");
        }
        projectRepository.delete(project);
    }

    public ProjectMember addMember(Long projectId, String email, String role, User requester) {
        Project project = getProjectById(projectId, requester);
        if (!isAdminOrOwner(project, requester)) {
            throw new RuntimeException("Only admin or owner can add members");
        }

        User newMember = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (memberRepository.existsByProjectAndUser(project, newMember)) {
            throw new RuntimeException("User is already a member");
        }

        ProjectMember.Role memberRole = ProjectMember.Role.MEMBER;
        if (role != null) {
            try {
                memberRole = ProjectMember.Role.valueOf(role.toUpperCase());
            } catch (Exception ignored) {}
        }

        return memberRepository.save(ProjectMember.builder()
                .project(project)
                .user(newMember)
                .role(memberRole)
                .build());
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, User requester) {
        Project project = getProjectById(projectId, requester);
        if (!isAdminOrOwner(project, requester)) {
            throw new RuntimeException("Only admin or owner can remove members");
        }

        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (project.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Cannot remove project owner");
        }

        memberRepository.deleteByProjectAndUser(project, userToRemove);
    }

    public List<ProjectMember> getProjectMembers(Long projectId, User user) {
        Project project = getProjectById(projectId, user);
        return memberRepository.findByProject(project);
    }

    private boolean hasAccess(Project project, User user) {
        if (project.getOwner().getId().equals(user.getId())) return true;
        return memberRepository.existsByProjectAndUser(project, user);
    }

    private boolean isAdminOrOwner(Project project, User user) {
        if (project.getOwner().getId().equals(user.getId())) return true;
        return memberRepository.findByProjectAndUser(project, user)
                .map(m -> m.getRole() == ProjectMember.Role.ADMIN)
                .orElse(false);
    }
}
