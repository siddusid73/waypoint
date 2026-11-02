package com.roadtrip.controller;

import com.roadtrip.dto.stop.StopRequest;
import com.roadtrip.dto.stop.StopResponse;
import com.roadtrip.service.StopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Stops are a "child resource" of a trip, hence the nested URL /api/trips/{tripId}/stops */
@RestController
@RequestMapping("/api/trips/{tripId}/stops")
@RequiredArgsConstructor
public class StopController {

    private final StopService stopService;

    @GetMapping
    public ResponseEntity<List<StopResponse>> listStops(@PathVariable Long tripId) {
        return ResponseEntity.ok(stopService.listStops(tripId));
    }

    @PostMapping
    public ResponseEntity<StopResponse> addStop(@PathVariable Long tripId,
                                                 @Valid @RequestBody StopRequest request,
                                                 Authentication authentication) {
        StopResponse created = stopService.addStop(tripId, request, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{stopId}")
    public ResponseEntity<StopResponse> updateStop(@PathVariable Long tripId,
                                                    @PathVariable Long stopId,
                                                    @Valid @RequestBody StopRequest request,
                                                    Authentication authentication) {
        return ResponseEntity.ok(stopService.updateStop(tripId, stopId, request, authentication.getName()));
    }

    @DeleteMapping("/{stopId}")
    public ResponseEntity<Void> deleteStop(@PathVariable Long tripId,
                                            @PathVariable Long stopId,
                                            Authentication authentication) {
        stopService.deleteStop(tripId, stopId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
