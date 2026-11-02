package com.roadtrip.controller;

import com.roadtrip.dto.rating.RatingRequest;
import com.roadtrip.dto.rating.RatingSummaryResponse;
import com.roadtrip.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    /** Create OR update (upsert) the caller's own rating for this trip. Returns the new average. */
    @PostMapping
    public ResponseEntity<RatingSummaryResponse> rateTrip(@PathVariable Long tripId,
                                                           @Valid @RequestBody RatingRequest request,
                                                           Authentication authentication) {
        return ResponseEntity.ok(ratingService.rateTrip(tripId, request, authentication.getName()));
    }

    @GetMapping("/average")
    public ResponseEntity<RatingSummaryResponse> getAverage(@PathVariable Long tripId) {
        return ResponseEntity.ok(ratingService.getAverage(tripId));
    }
}
