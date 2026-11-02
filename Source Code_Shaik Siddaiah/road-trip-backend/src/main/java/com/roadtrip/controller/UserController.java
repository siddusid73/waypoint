package com.roadtrip.controller;

import com.roadtrip.dto.user.UserPublicResponse;
import com.roadtrip.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserPublicResponse> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }
}
