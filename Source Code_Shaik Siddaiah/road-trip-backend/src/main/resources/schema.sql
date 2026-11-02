-- =============================================================================
-- Road Trip Sharing Platform - Database Structure (DDL)
-- Engine: MySQL 8
-- This file is for REFERENCE / manual import (e.g. MySQL Workbench, phpMyAdmin).
-- When you run the Spring Boot app itself, Hibernate creates/updates these
-- same tables automatically from the @Entity classes (see application.properties,
-- spring.jpa.hibernate.ddl-auto=update) - you do NOT need to run this file by
-- hand just to start the app. Use it to inspect, present, or hand-create the DB.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS roadtrip_db;
USE roadtrip_db;

-- -----------------------------------------------------------------------------
-- USERS: one row per registered person
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,          -- BCrypt hash, never plain text
    bio         VARCHAR(500),
    avatar_url  VARCHAR(500),
    created_at  DATETIME      NOT NULL
);

-- -----------------------------------------------------------------------------
-- TRIPS: one road trip, owned by one user
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id            BIGINT        NOT NULL,
    title              VARCHAR(150)  NOT NULL,
    description        VARCHAR(2000),
    start_location     VARCHAR(150),
    end_location       VARCHAR(150),
    total_distance_km  DOUBLE,
    duration_days      INT,
    visibility         VARCHAR(20)   NOT NULL DEFAULT 'PUBLIC',
    created_at         DATETIME      NOT NULL,
    CONSTRAINT fk_trips_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- STOPS: a pin along one trip's route
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stops (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id      BIGINT        NOT NULL,
    name         VARCHAR(150)  NOT NULL,
    latitude     DOUBLE        NOT NULL,
    longitude    DOUBLE        NOT NULL,
    description  VARCHAR(1000),
    stop_order   INT,                        -- order of this stop along the route
    day_number   INT,                        -- which day of the trip
    CONSTRAINT fk_stops_trip
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- PHOTOS: an image attached to one stop (we store the URL only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photos (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    stop_id  BIGINT        NOT NULL,
    url      VARCHAR(500)  NOT NULL,
    CONSTRAINT fk_photos_stop
        FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- COMMENTS: a user's comment on a trip
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id     BIGINT        NOT NULL,
    user_id     BIGINT        NOT NULL,
    content     VARCHAR(1000) NOT NULL,
    created_at  DATETIME      NOT NULL,
    CONSTRAINT fk_comments_trip
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- RATINGS: a 1-5 score a user gave a trip (one rating per user per trip)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id  BIGINT  NOT NULL,
    user_id  BIGINT  NOT NULL,
    score    INT     NOT NULL,
    CONSTRAINT fk_ratings_trip
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_ratings_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_rating_trip_user UNIQUE (trip_id, user_id),
    CONSTRAINT chk_rating_score CHECK (score BETWEEN 1 AND 5)
);

-- -----------------------------------------------------------------------------
-- TAGS: labels like "beach", "mountains", "budget"
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tags (
    id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(50)  NOT NULL UNIQUE
);

-- -----------------------------------------------------------------------------
-- TRIP_TAGS: join table for the many-to-many relationship between trips and tags
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trip_tags (
    trip_id  BIGINT NOT NULL,
    tag_id   BIGINT NOT NULL,
    PRIMARY KEY (trip_id, tag_id),
    CONSTRAINT fk_triptags_trip
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_triptags_tag
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- Helpful indexes for the lookups the API does most often
-- -----------------------------------------------------------------------------
CREATE INDEX idx_trips_visibility   ON trips(visibility);
CREATE INDEX idx_stops_trip_id      ON stops(trip_id);
CREATE INDEX idx_comments_trip_id   ON comments(trip_id);
CREATE INDEX idx_ratings_trip_id    ON ratings(trip_id);
