package com.roadtrip.dto.photo;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PhotoRequest {
    @NotBlank
    private String url;
}
