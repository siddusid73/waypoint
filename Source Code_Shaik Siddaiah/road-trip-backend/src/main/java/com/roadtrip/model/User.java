package com.roadtrip.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * One row in the "users" table = one registered person.
 * @Entity tells Hibernate "this class maps to a database table".
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increment primary key
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Always a BCrypt HASH, never the real password. See SecurityConfig. */
    @Column(nullable = false)
    private String password;

    @Column(length = 500)
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // "mappedBy" means the Trip entity owns the foreign key (user_id column).
    // This side is just the Java-side convenience list, not a real column.
    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Trip> trips = new ArrayList<>();

    @PrePersist // Hibernate calls this automatically right before INSERT
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
