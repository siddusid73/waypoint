package com.roadtrip.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A 1-5 star rating a User gave to a Trip.
 * The unique constraint below stops one user from rating the same trip twice -
 * if they rate it again we UPDATE their existing row instead (see RatingService).
 */
@Entity
@Table(name = "ratings", uniqueConstraints = @UniqueConstraint(columnNames = {"trip_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** 1 to 5. Validated in RatingRequest before it ever reaches this entity. */
    @Column(nullable = false)
    private Integer score;
}
