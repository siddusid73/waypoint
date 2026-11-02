package com.roadtrip.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** What register/login send back: the JWT the frontend must attach to future requests. */
@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
}
