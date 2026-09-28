package com.sportsbooking.enterprise.service;

import com.sportsbooking.enterprise.dto.CreateUserRequest;
import com.sportsbooking.enterprise.dto.UpdateUserRequest;
import com.sportsbooking.enterprise.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserDTO> searchUsers(String keyword, Boolean isActive, Pageable pageable);
    UserDTO getUserById(Long id);
    UserDTO getUserByEmail(String email);
    UserDTO createUser(CreateUserRequest request);
    UserDTO updateUser(Long id, UpdateUserRequest request);
    void deleteUser(Long id);
    void resetPassword(Long id, String newPassword);
}
