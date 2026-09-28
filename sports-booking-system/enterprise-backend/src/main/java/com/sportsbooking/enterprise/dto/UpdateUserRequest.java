package com.sportsbooking.enterprise.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Boolean isActive;
    private Set<String> roles;
    private String newPassword;
}
