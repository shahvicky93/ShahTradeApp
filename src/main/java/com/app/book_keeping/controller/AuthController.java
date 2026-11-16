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
}
