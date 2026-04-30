package com.pm.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectDTO {
    private String name;
    private String description;
    private String status;
    private LocalDate deadline;
    private List<String> memberEmails;
}
