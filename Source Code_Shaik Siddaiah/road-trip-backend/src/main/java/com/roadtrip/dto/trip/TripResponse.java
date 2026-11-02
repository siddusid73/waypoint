package com.roadtrip.dto.trip;

import com.roadtrip.dto.stop.StopResponse;
import com.roadtrip.model.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * What GET /api/trips/{id} returns: everything about one trip, including its
 * stops and tags. We NEVER return the User entity directly - only the pieces
 * the frontend actually needs (ownerId, ownerName). This avoids leaking the
 * password hash and avoids infinite loops (User -> trips -> User -> trips...).
 */
@Getter
@Builder
@AllArgsConstructor
public class TripResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String title;
    private String description;
    private String startLocation;
    private String endLocation;
    private Double totalDistanceKm;
    private Integer durationDays;
    private Visibility visibility;
    private LocalDateTime createdAt;
    private Double averageRating;
    private Long ratingCount;
    private List<String> tags;
    private List<StopResponse> stops;
}
