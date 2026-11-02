package com.roadtrip.dto.trip;

import com.roadtrip.model.Visibility;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/** Body for POST /api/trips and PUT /api/trips/{id} */
@Getter
@Setter
public class TripRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String startLocation;
    private String endLocation;
    private Double totalDistanceKm;
    private Integer durationDays;
    private Visibility visibility = Visibility.PUBLIC;

    /** Simple tag names, e.g. ["beach", "budget"]. New ones are created automatically. */
    private List<String> tagNames;
}
