package com.roadtrip.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** A single pin/stop that belongs to one Trip (e.g. "Golden Gate Bridge"). */
@Entity
@Table(name = "stops")
@Getter
@Setter
@NoArgsConstructor
public class Stop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 1000)
    private String description;

    /** Order of this stop along the route (1, 2, 3 ...), used to draw the line on the map in order. */
    @Column(name = "stop_order")
    private Integer stopOrder;

    /** Which day of the trip this stop happens on. */
    @Column(name = "day_number")
    private Integer dayNumber;

    @OneToMany(mappedBy = "stop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();
}
