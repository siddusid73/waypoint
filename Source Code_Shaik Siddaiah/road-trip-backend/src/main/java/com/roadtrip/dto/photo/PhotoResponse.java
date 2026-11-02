package com.roadtrip.dto.photo;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PhotoResponse {
    private Long id;
    private String url;
}
