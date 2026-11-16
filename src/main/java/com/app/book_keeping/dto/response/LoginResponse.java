package com.app.book_keeping.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long id;
    private String username;
    private String role;
    private String token;
    private LocalDateTime createdAt;
}
