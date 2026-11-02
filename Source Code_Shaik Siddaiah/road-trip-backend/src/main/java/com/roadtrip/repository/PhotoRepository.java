package com.roadtrip.repository;

import com.roadtrip.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PhotoRepository extends JpaRepository<Photo, Long> {

    List<Photo> findByStopId(Long stopId);
}
