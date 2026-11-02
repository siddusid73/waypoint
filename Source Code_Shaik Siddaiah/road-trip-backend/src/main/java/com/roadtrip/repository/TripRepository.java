package com.roadtrip.repository;

import com.roadtrip.model.Trip;
import com.roadtrip.model.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByOwnerId(Long ownerId);

    /**
     * Powers GET /api/trips (the browse/search page).
     * Both filters are optional: pass null for "keyword" or "tagName" to skip
     * that condition. :keyword and :tagName are "named parameters" - Spring
     * fills them in safely (preventing SQL injection) from @Param below.
     */
    @Query("""
           SELECT DISTINCT t FROM Trip t LEFT JOIN t.tags tag
           WHERE t.visibility = com.roadtrip.model.Visibility.PUBLIC
           AND (:keyword IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(t.startLocation) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(t.endLocation) LIKE LOWER(CONCAT('%', :keyword, '%')))
           AND (:tagName IS NULL OR LOWER(tag.name) = LOWER(:tagName))
           """)
    Page<Trip> searchPublicTrips(@Param("keyword") String keyword,
                                  @Param("tagName") String tagName,
                                  Pageable pageable);

    Page<Trip> findByVisibility(Visibility visibility, Pageable pageable);
}
