package com.roadtrip.service;

import com.roadtrip.dto.user.UserPublicResponse;
import com.roadtrip.exception.ResourceNotFoundException;
import com.roadtrip.model.User;
import com.roadtrip.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    /** Used everywhere we only have the caller's email (from the JWT) and need their numeric id. */
    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email " + email));
    }

    public UserPublicResponse getPublicProfile(Long id) {
        User user = getById(id);
        return UserPublicResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
