package com.pm.repository;

import com.pm.model.Project;
import com.pm.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwner(User owner);

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members m " +
           "WHERE p.owner = :user OR m.user = :user")
    List<Project> findAllProjectsForUser(@Param("user") User user);
}
