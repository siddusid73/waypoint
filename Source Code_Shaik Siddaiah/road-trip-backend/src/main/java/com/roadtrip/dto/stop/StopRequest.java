package com.roadtrip.dto.stop;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Body for POST/PUT .../trips/{tripId}/stops */
@Getter
@Setter
public class StopRequest {

    @NotBlank
    private String name;

    @NotNull
    private Double latitude;

    @NotNull
    private Double longitude;

    private String description;
    private Integer stopOrder;
    private Integer dayNumber;
}
