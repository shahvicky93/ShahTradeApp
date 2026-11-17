package com.app.book_keeping.controller;

import com.app.book_keeping.dto.request.LoginRequest;
import com.app.book_keeping.dto.response.LoginResponse;
import com.app.book_keeping.entity.AppUser;
import com.app.book_keeping.exception.ResourceNotFoundException;
import com.app.book_keeping.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for authentication and current user session verification.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    /**
     * Authenticates credentials and returns user details along with basic auth token.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        AppUser user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getUsername()));

        String token = Base64.getEncoder().encodeToString(
                (request.getUsername() + ":" + request.getPassword()).getBytes(StandardCharsets.UTF_8)
        );

        LoginResponse response = LoginResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .token(token)
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Returns the currently authenticated user's profile.
     * Accessible with valid HTTP Basic Auth credentials.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * Updates the current user's username and/or password.
     * Requires current password to authorize the change.
     */
    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String currentUsername = authentication.getName();
        AppUser user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        String currentPassword = body.get("currentPassword");
        if (currentPassword == null || currentPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is required."));
        }
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(403).body(Map.of("message", "Current password is incorrect."));
        }

        String newUsername = body.get("newUsername");
        String newPassword = body.get("newPassword");

        boolean changed = false;

        if (newUsername != null && !newUsername.isBlank() && !newUsername.equals(currentUsername)) {
            if (userRepository.findByUsername(newUsername).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username already taken."));
            }
            user.setUsername(newUsername);
            changed = true;
        }

        String resolvedPassword = currentPassword;
        if (newPassword != null && !newPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(newPassword));
            resolvedPassword = newPassword;
            changed = true;
        }

        if (!changed) {
            return ResponseEntity.badRequest().body(Map.of("message", "No changes provided."));
        }

        userRepository.save(user);

        // Return new token so client can re-authenticate without logout
        String newToken = Base64.getEncoder().encodeToString(
                (user.getUsername() + ":" + resolvedPassword).getBytes(StandardCharsets.UTF_8)
        );

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("role", user.getRole());
        response.put("token", newToken);
        response.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }
}
