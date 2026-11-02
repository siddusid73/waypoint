package com.roadtrip.dto.rating;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RatingSummaryResponse {
    private Double averageScore;
    private Long numberOfRatings;
}
