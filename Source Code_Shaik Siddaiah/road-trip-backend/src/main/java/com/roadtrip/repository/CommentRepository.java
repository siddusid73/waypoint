package com.roadtrip.repository;

import com.roadtrip.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByTripIdOrderByCreatedAtDesc(Long tripId);
}
