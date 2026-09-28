package com.sportsbooking.enterprise.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token; // For frontend compatibility
    private String accessToken; // Standard OAuth2 / Keycloak property
    private String tokenType;
    private long expiresIn;
    private Long userId;
    private String email;
    private String fullName;
    private List<String> roles;
    private String keycloakSessionId;
    private UserSummary user; // Nested user object expected by frontend

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String email;
        private String fullName;
        private String role; // "ADMIN", "PARTNER", "USER", "CASHIER"
        private List<String> roles;
    }
}
