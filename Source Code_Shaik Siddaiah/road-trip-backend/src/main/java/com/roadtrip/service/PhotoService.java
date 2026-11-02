package com.roadtrip.service;

import com.roadtrip.dto.photo.PhotoRequest;
import com.roadtrip.dto.photo.PhotoResponse;
import com.roadtrip.exception.ResourceNotFoundException;
import com.roadtrip.exception.UnauthorizedActionException;
import com.roadtrip.model.Photo;
import com.roadtrip.model.Stop;
import com.roadtrip.repository.PhotoRepository;
import com.roadtrip.repository.StopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PhotoService {

    private final PhotoRepository photoRepository;
    private final StopRepository stopRepository;

    @Transactional(readOnly = true)
    public List<PhotoResponse> listPhotos(Long stopId) {
        return photoRepository.findByStopId(stopId).stream()
                .map(p -> new PhotoResponse(p.getId(), p.getUrl()))
                .toList();
    }

    public PhotoResponse addPhoto(Long stopId, PhotoRequest request, String requesterEmail) {
        Stop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Stop not found with id " + stopId));

        if (!stop.getTrip().getOwner().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new UnauthorizedActionException("You do not have permission to add photos to this stop");
        }

        Photo photo = new Photo();
        photo.setStop(stop);
        photo.setUrl(request.getUrl());

        Photo saved = photoRepository.save(photo);
        return new PhotoResponse(saved.getId(), saved.getUrl());
    }
}
