package com.roadtrip.controller;

import com.roadtrip.dto.trip.TripRequest;
import com.roadtrip.dto.trip.TripResponse;
import com.roadtrip.dto.trip.TripSummaryResponse;
import com.roadtrip.service.TripService;
import com.roadtrip.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final UserService userService;

    /** Browse/search public trips. Example: GET /api/trips?keyword=coast&tag=beach&page=0&size=10 */
    @GetMapping
    public ResponseEntity<Page<TripSummaryResponse>> browseTrips(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tag,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(tripService.searchPublicTrips(keyword, tag, pageable));
    }

    /** The logged-in user's own trips (both public and private). Must come before "/{id}" to avoid a route clash. */
    @GetMapping("/my")
    public ResponseEntity<List<TripSummaryResponse>> myTrips(Authentication authentication) {
        Long userId = userService.getByEmail(authentication.getName()).getId();
        return ResponseEntity.ok(tripService.getTripsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripRequest request,
                                                    Authentication authentication) {
        TripResponse created = tripService.createTrip(request, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long id,
                                                    @Valid @RequestBody TripRequest request,
                                                    Authentication authentication) {
        return ResponseEntity.ok(tripService.updateTrip(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id, Authentication authentication) {
        tripService.deleteTrip(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
