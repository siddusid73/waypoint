package com.roadtrip.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** What anyone (logged in or not) can see about a user - no email, no password hash. */
@Getter
@Builder
@AllArgsConstructor
public class UserPublicResponse {
    private Long id;
    private String name;
    private String bio;
    private String avatarUrl;
}
