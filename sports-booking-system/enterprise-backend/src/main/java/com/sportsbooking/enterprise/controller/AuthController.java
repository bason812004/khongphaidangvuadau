package com.sportsbooking.enterprise.controller;

import com.sportsbooking.enterprise.dto.*;
import com.sportsbooking.enterprise.entity.Role;
import com.sportsbooking.enterprise.entity.User;
import com.sportsbooking.enterprise.repository.RoleRepository;
import com.sportsbooking.enterprise.repository.UserRepository;
import com.sportsbooking.enterprise.security.JwtTokenProvider;
import com.sportsbooking.enterprise.service.RedisCacheService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final RedisCacheService redisCacheService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Account has been deactivated. Please contact admin.");
        }

        List<String> roleNames = user.getRoles().stream().map(Role::getName).collect(Collectors.toList());
        String token = tokenProvider.generateToken(user.getEmail(), roleNames);

        // Store session for web browser session support
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute("USER_ID", user.getId());
        session.setAttribute("USER_EMAIL", user.getEmail());

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roleNames)
                .keycloakSessionId(session.getId())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(authResponse, "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Email is already registered"));
        }

        String targetRole = request.getRole() != null ? request.getRole() : "ROLE_CUSTOMER";
        Role role = roleRepository.findByName(targetRole)
                .orElseGet(() -> roleRepository.save(Role.builder().name(targetRole).build()));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .isActive(true)
                .roles(Collections.singleton(role))
                .build();

        User saved = userRepository.save(user);

        List<String> roleNames = Collections.singletonList(role.getName());
        String token = tokenProvider.generateToken(saved.getEmail(), roleNames);

        AuthResponse response = AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .userId(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .roles(roleNames)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "User registered successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            // Blacklist token in Redis
            redisCacheService.set("token_blacklist:" + token, "revoked", 24, TimeUnit.HOURS);
        }

        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account registered with this email"));

        String resetToken = UUID.randomUUID().toString();
        redisCacheService.set("pwd_reset:" + resetToken, user.getEmail(), 30, TimeUnit.MINUTES);

        log.info("[KEYCLOAK / IAM FORGOT PASSWORD] Generated reset token for {}: {}", user.getEmail(), resetToken);

        return ResponseEntity.ok(ApiResponse.ok(resetToken, "Password reset instructions sent to your email"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestParam String token, @RequestParam String newPassword) {
        Object emailObj = redisCacheService.get("pwd_reset:" + token);
        if (emailObj == null) {
            throw new RuntimeException("Invalid or expired password reset token");
        }

        String email = emailObj.toString();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        redisCacheService.delete("pwd_reset:" + token);

        return ResponseEntity.ok(ApiResponse.ok(null, "Password reset successfully. You can now log in."));
    }
}
