package com.pm.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private Long assigneeId;
    private Long projectId;
}
