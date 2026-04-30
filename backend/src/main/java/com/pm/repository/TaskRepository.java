package com.pm.repository;

import com.pm.model.Project;
import com.pm.model.Task;
import com.pm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProject(Project project);

    List<Task> findByAssignee(User assignee);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.project = :project AND t.dueDate < :today AND t.status <> 'DONE'")
    List<Task> findOverdueTasksByProject(@Param("project") Project project, @Param("today") LocalDate today);

    long countByProject(Project project);

    long countByProjectAndStatus(Project project, Task.Status status);
}
