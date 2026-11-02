package com.roadtrip.service;

import com.roadtrip.dto.rating.RatingRequest;
import com.roadtrip.dto.rating.RatingSummaryResponse;
import com.roadtrip.exception.ResourceNotFoundException;
import com.roadtrip.model.Rating;
import com.roadtrip.model.Trip;
import com.roadtrip.model.User;
import com.roadtrip.repository.RatingRepository;
import com.roadtrip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingService {

    private final RatingRepository ratingRepository;
    private final TripRepository tripRepository;
    private final UserService userService;

    /** Creates the user's rating for this trip, or updates it if they already rated it ("upsert"). */
    public RatingSummaryResponse rateTrip(Long tripId, RatingRequest request, String raterEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id " + tripId));
        User rater = userService.getByEmail(raterEmail);

        Rating rating = ratingRepository.findByTripIdAndUserId(tripId, rater.getId())
                .orElseGet(() -> {
                    Rating newRating = new Rating();
                    newRating.setTrip(trip);
                    newRating.setUser(rater);
                    return newRating;
                });

        rating.setScore(request.getScore());
        ratingRepository.save(rating);

        return getAverage(tripId);
    }

    @Transactional(readOnly = true)
    public RatingSummaryResponse getAverage(Long tripId) {
        Double average = ratingRepository.findAverageScoreByTripId(tripId);
        long count = ratingRepository.countByTripId(tripId);
        return new RatingSummaryResponse(average, count);
    }
}
