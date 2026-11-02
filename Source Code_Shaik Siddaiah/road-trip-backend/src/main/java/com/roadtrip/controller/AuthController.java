package com.roadtrip.controller;

import com.roadtrip.dto.auth.AuthResponse;
import com.roadtrip.dto.auth.LoginRequest;
import com.roadtrip.dto.auth.RegisterRequest;
import com.roadtrip.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * A @RestController is a @Controller where every method's return value is
 * written straight into the HTTP response body as JSON (instead of looking
 * for an HTML page/"view" to render) - exactly what a REST API needs.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
