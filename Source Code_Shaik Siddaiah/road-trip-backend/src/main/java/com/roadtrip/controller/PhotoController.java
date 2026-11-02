package com.roadtrip.controller;

import com.roadtrip.dto.photo.PhotoRequest;
import com.roadtrip.dto.photo.PhotoResponse;
import com.roadtrip.service.PhotoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stops/{stopId}/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;

    @GetMapping
    public ResponseEntity<List<PhotoResponse>> listPhotos(@PathVariable Long stopId) {
        return ResponseEntity.ok(photoService.listPhotos(stopId));
    }

    @PostMapping
    public ResponseEntity<PhotoResponse> addPhoto(@PathVariable Long stopId,
                                                   @Valid @RequestBody PhotoRequest request,
                                                   Authentication authentication) {
        PhotoResponse created = photoService.addPhoto(stopId, request, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}
