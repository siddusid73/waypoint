package com.roadtrip.service;

import com.roadtrip.dto.stop.StopResponse;
import com.roadtrip.dto.trip.TripRequest;
import com.roadtrip.dto.trip.TripResponse;
import com.roadtrip.dto.trip.TripSummaryResponse;
import com.roadtrip.exception.ResourceNotFoundException;
import com.roadtrip.exception.UnauthorizedActionException;
import com.roadtrip.model.Photo;
import com.roadtrip.model.Stop;
import com.roadtrip.model.Tag;
import com.roadtrip.model.Trip;
import com.roadtrip.model.User;
import com.roadtrip.repository.RatingRepository;
import com.roadtrip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TripService {

    private final TripRepository tripRepository;
    private final RatingRepository ratingRepository;
    private final UserService userService;
    private final TagService tagService;

    // ---------------------------------------------------------------- CREATE
    public TripResponse createTrip(TripRequest request, String ownerEmail) {
        User owner = userService.getByEmail(ownerEmail);

        Trip trip = new Trip();
        trip.setOwner(owner);
        applyRequestToTrip(request, trip);

        Trip saved = tripRepository.save(trip);
        return toTripResponse(saved);
    }

    // ------------------------------------------------------------------ GET
    @Transactional(readOnly = true)
    public TripResponse getTripById(Long tripId) {
        Trip trip = findTripOrThrow(tripId);
        return toTripResponse(trip);
    }

    // --------------------------------------------------------------- BROWSE
    @Transactional(readOnly = true)
    public Page<TripSummaryResponse> searchPublicTrips(String keyword, String tag, Pageable pageable) {
        return tripRepository.searchPublicTrips(blankToNull(keyword), blankToNull(tag), pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public List<TripSummaryResponse> getTripsForUser(Long userId) {
        return tripRepository.findByOwnerId(userId).stream()
                .map(this::toSummaryResponse)
                .toList();
    }

    // --------------------------------------------------------------- UPDATE
    public TripResponse updateTrip(Long tripId, TripRequest request, String requesterEmail) {
        Trip trip = findTripOrThrow(tripId);
        assertOwnership(trip, requesterEmail);

        applyRequestToTrip(request, trip);
        return toTripResponse(trip); // still managed by JPA -> auto-saved at commit ("dirty checking")
    }

    // --------------------------------------------------------------- DELETE
    public void deleteTrip(Long tripId, String requesterEmail) {
        Trip trip = findTripOrThrow(tripId);
        assertOwnership(trip, requesterEmail);
        tripRepository.delete(trip);
    }

    // ------------------------------------------------------------- HELPERS

    private Trip findTripOrThrow(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id " + tripId));
    }

    private void assertOwnership(Trip trip, String requesterEmail) {
        if (!trip.getOwner().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new UnauthorizedActionException("You do not have permission to modify this trip");
        }
    }

    private void applyRequestToTrip(TripRequest request, Trip trip) {
        trip.setTitle(request.getTitle());
        trip.setDescription(request.getDescription());
        trip.setStartLocation(request.getStartLocation());
        trip.setEndLocation(request.getEndLocation());
        trip.setTotalDistanceKm(request.getTotalDistanceKm());
        trip.setDurationDays(request.getDurationDays());
        trip.setVisibility(request.getVisibility());
        trip.setTags(tagService.resolveOrCreate(request.getTagNames()));
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }

    private TripResponse toTripResponse(Trip trip) {
        Double average = ratingRepository.findAverageScoreByTripId(trip.getId());
        long count = ratingRepository.countByTripId(trip.getId());

        List<StopResponse> stops = trip.getStops().stream().map(this::toStopResponse).toList();
        List<String> tagNames = trip.getTags().stream().map(Tag::getName).sorted().toList();

        return TripResponse.builder()
                .id(trip.getId())
                .ownerId(trip.getOwner().getId())
                .ownerName(trip.getOwner().getName())
                .title(trip.getTitle())
                .description(trip.getDescription())
                .startLocation(trip.getStartLocation())
                .endLocation(trip.getEndLocation())
                .totalDistanceKm(trip.getTotalDistanceKm())
                .durationDays(trip.getDurationDays())
                .visibility(trip.getVisibility())
                .createdAt(trip.getCreatedAt())
                .averageRating(average)
                .ratingCount(count)
                .tags(tagNames)
                .stops(stops)
                .build();
    }

    private TripSummaryResponse toSummaryResponse(Trip trip) {
        Double average = ratingRepository.findAverageScoreByTripId(trip.getId());
        List<String> tagNames = trip.getTags().stream().map(Tag::getName).sorted().toList();

        return TripSummaryResponse.builder()
                .id(trip.getId())
                .title(trip.getTitle())
                .startLocation(trip.getStartLocation())
                .endLocation(trip.getEndLocation())
                .durationDays(trip.getDurationDays())
                .ownerName(trip.getOwner().getName())
                .averageRating(average)
                .tags(tagNames)
                .visibility(trip.getVisibility())
                .build();
    }

    private StopResponse toStopResponse(Stop stop) {
        return StopResponse.builder()
                .id(stop.getId())
                .name(stop.getName())
                .latitude(stop.getLatitude())
                .longitude(stop.getLongitude())
                .description(stop.getDescription())
                .stopOrder(stop.getStopOrder())
                .dayNumber(stop.getDayNumber())
                .photoUrls(stop.getPhotos().stream().map(Photo::getUrl).toList())
                .build();
    }
}
