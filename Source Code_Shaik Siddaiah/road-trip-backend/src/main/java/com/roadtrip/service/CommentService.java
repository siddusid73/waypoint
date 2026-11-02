package com.roadtrip.service;

import com.roadtrip.dto.comment.CommentRequest;
import com.roadtrip.dto.comment.CommentResponse;
import com.roadtrip.exception.ResourceNotFoundException;
import com.roadtrip.model.Comment;
import com.roadtrip.model.Trip;
import com.roadtrip.model.User;
import com.roadtrip.repository.CommentRepository;
import com.roadtrip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final TripRepository tripRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public List<CommentResponse> listComments(Long tripId) {
        return commentRepository.findByTripIdOrderByCreatedAtDesc(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CommentResponse addComment(Long tripId, CommentRequest request, String authorEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id " + tripId));
        User author = userService.getByEmail(authorEmail);

        Comment comment = new Comment();
        comment.setTrip(trip);
        comment.setUser(author);
        comment.setContent(request.getContent());

        return toResponse(commentRepository.save(comment));
    }

    private CommentResponse toResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userName(comment.getUser().getName())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
