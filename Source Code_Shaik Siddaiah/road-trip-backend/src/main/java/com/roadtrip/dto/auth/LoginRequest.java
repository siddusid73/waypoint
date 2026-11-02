package com.roadtrip.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/** What the client must send to POST /api/auth/login */
@Getter
@Setter
public class LoginRequest {

    @NotBlank
    private String email;

    @NotBlank
    private String password;
}
