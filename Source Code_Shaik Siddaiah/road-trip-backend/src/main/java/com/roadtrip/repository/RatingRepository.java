package com.roadtrip.repository;

import com.roadtrip.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByTripIdAndUserId(Long tripId, Long userId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.trip.id = :tripId")
    Double findAverageScoreByTripId(@Param("tripId") Long tripId);

    long countByTripId(Long tripId);
}
