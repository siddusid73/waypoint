package com.roadtrip.dto.stop;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class StopResponse {
    private Long id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String description;
    private Integer stopOrder;
    private Integer dayNumber;
    private List<String> photoUrls;
}
