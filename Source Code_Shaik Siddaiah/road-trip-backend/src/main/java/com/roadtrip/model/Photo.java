package com.roadtrip.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A photo attached to one Stop. We only store the image URL (e.g. from Cloudinary), not the raw file. */
@Entity
@Table(name = "photos")
@Getter
@Setter
@NoArgsConstructor
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stop_id", nullable = false)
    private Stop stop;

    @Column(nullable = false, length = 500)
    private String url;
}
