package com.roadtrip.dto.trip;

import com.roadtrip.model.Visibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * A lighter version of TripResponse used for GET /api/trips (browse list) and
 * GET /api/trips/my. Lists don't need the full stop-by-stop detail, so we
 * leave it out to keep the response small and the page fast.
 */
@Getter
@Builder
@AllArgsConstructor
public class TripSummaryResponse {
    private Long id;
    private String title;
    private String startLocation;
    private String endLocation;
    private Integer durationDays;
    private String ownerName;
    private Double averageRating;
    private List<String> tags;
    private Visibility visibility;
}
