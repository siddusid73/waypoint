package com.roadtrip.repository;

import com.roadtrip.model.Stop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StopRepository extends JpaRepository<Stop, Long> {

    List<Stop> findByTripIdOrderByStopOrderAsc(Long tripId);

    Optional<Stop> findByIdAndTripId(Long id, Long tripId);
}
