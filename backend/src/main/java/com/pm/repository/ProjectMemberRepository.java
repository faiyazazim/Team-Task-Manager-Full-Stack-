package com.pm.repository;

import com.pm.model.Project;
import com.pm.model.ProjectMember;
import com.pm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    Optional<ProjectMember> findByProjectAndUser(Project project, User user);

    List<ProjectMember> findByProject(Project project);

    List<ProjectMember> findByUser(User user);

    boolean existsByProjectAndUser(Project project, User user);

    void deleteByProjectAndUser(Project project, User user);
}
