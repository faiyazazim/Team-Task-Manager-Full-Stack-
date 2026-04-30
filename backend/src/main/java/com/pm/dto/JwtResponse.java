package com.pm.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;
    private String type = "Bearer";
}
