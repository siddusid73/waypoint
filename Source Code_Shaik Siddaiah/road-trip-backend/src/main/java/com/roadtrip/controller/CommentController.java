package com.roadtrip.controller;

import com.roadtrip.dto.comment.CommentRequest;
import com.roadtrip.dto.comment.CommentResponse;
import com.roadtrip.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public ResponseEntity<List<CommentResponse>> listComments(@PathVariable Long tripId) {
        return ResponseEntity.ok(commentService.listComments(tripId));
    }

    @PostMapping
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long tripId,
                                                       @Valid @RequestBody CommentRequest request,
                                                       Authentication authentication) {
        CommentResponse created = commentService.addComment(tripId, request, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
