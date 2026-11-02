package com.roadtrip.service;

import com.roadtrip.dto.stop.StopRequest;
import com.roadtrip.dto.stop.StopResponse;
import com.roadtrip.exception.ResourceNotFoundException;
import com.roadtrip.exception.UnauthorizedActionException;
import com.roadtrip.model.Photo;
import com.roadtrip.model.Stop;
import com.roadtrip.model.Trip;
import com.roadtrip.repository.StopRepository;
import com.roadtrip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StopService {

    private final StopRepository stopRepository;
    private final TripRepository tripRepository;

    @Transactional(readOnly = true)
    public List<StopResponse> listStops(Long tripId) {
        return stopRepository.findByTripIdOrderByStopOrderAsc(tripId).stream()
                .map(this::toResponse)
                .toList();
    }

    public StopResponse addStop(Long tripId, StopRequest request, String requesterEmail) {
        Trip trip = findTripOrThrow(tripId);
        assertOwnership(trip, requesterEmail);

        Stop stop = new Stop();
        stop.setTrip(trip);
        applyRequestToStop(request, stop);

        return toResponse(stopRepository.save(stop));
    }

    public StopResponse updateStop(Long tripId, Long stopId, StopRequest request, String requesterEmail) {
        Trip trip = findTripOrThrow(tripId);
        assertOwnership(trip, requesterEmail);

        Stop stop = stopRepository.findByIdAndTripId(stopId, tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Stop not found with id " + stopId));

        applyRequestToStop(request, stop);
        return toResponse(stop);
    }

    public void deleteStop(Long tripId, Long stopId, String requesterEmail) {
        Trip trip = findTripOrThrow(tripId);
        assertOwnership(trip, requesterEmail);

        Stop stop = stopRepository.findByIdAndTripId(stopId, tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Stop not found with id " + stopId));
        stopRepository.delete(stop);
    }

    // ------------------------------------------------------------- HELPERS

    private Trip findTripOrThrow(Long tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id " + tripId));
    }

    private void assertOwnership(Trip trip, String requesterEmail) {
        if (!trip.getOwner().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new UnauthorizedActionException("You do not have permission to modify this trip's stops");
        }
    }

    private void applyRequestToStop(StopRequest request, Stop stop) {
        stop.setName(request.getName());
        stop.setLatitude(request.getLatitude());
        stop.setLongitude(request.getLongitude());
        stop.setDescription(request.getDescription());
        stop.setStopOrder(request.getStopOrder());
        stop.setDayNumber(request.getDayNumber());
    }

    private StopResponse toResponse(Stop stop) {
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
