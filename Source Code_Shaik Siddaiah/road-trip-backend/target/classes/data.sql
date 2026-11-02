-- =============================================================================
-- Road Trip Sharing Platform - Sample Data Dump
-- Demo password for every user below is:  password123
-- (the value stored is its real BCrypt hash - this is exactly how the app
--  would store it after someone registers through POST /api/auth/register)
-- =============================================================================

USE roadtrip_db;

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password, bio, avatar_url, created_at) VALUES
(1, 'Asha Mehta',  'asha@example.com',  '$2b$10$edblkv.uPVTTNLVQM4nnIuO2yGrglxXng2Wg3ugCGUxpceNmkK23q', 'Full-time wanderer, part-time photographer.', 'https://i.pravatar.cc/150?img=47', '2026-08-01 09:15:00'),
(2, 'Liam Carter',  'liam@example.com',  '$2b$10$edblkv.uPVTTNLVQM4nnIuO2yGrglxXng2Wg3ugCGUxpceNmkK23q', 'I plan road trips for a living (not really, but I wish).', 'https://i.pravatar.cc/150?img=12', '2026-08-03 14:22:00'),
(3, 'Sofia Rossi',  'sofia@example.com', '$2b$10$edblkv.uPVTTNLVQM4nnIuO2yGrglxXng2Wg3ugCGUxpceNmkK23q', 'Slow travel, good coffee, longer scenic routes.', 'https://i.pravatar.cc/150?img=32', '2026-08-05 11:40:00');

-- -----------------------------------------------------------------------------
-- TAGS
-- -----------------------------------------------------------------------------
INSERT INTO tags (id, name) VALUES
(1, 'beach'), (2, 'road-trip'), (3, 'desert'), (4, 'heritage'),
(5, 'countryside'), (6, 'glacier'), (7, 'waterfalls'), (8, 'hiking'), (9, 'budget');

-- -----------------------------------------------------------------------------
-- TRIPS
-- -----------------------------------------------------------------------------
INSERT INTO trips (id, user_id, title, description, start_location, end_location, total_distance_km, duration_days, visibility, created_at) VALUES
(1, 1, 'Pacific Coast Highway Road Trip', 'A classic 5-day drive along California''s most scenic coastal road, from San Francisco down to Los Angeles.', 'San Francisco, USA', 'Los Angeles, USA', 880.0, 5, 'PUBLIC', '2026-08-10 10:00:00'),
(2, 2, 'Rajasthan Desert Circuit', 'Forts, palaces and golden dunes across the Thar Desert.', 'Jaipur, India', 'Jaisalmer, India', 650.0, 7, 'PUBLIC', '2026-08-12 08:30:00'),
(3, 3, 'Tuscany Hill Towns', 'A slow 3-day loop through Florence, San Gimignano and Siena.', 'Florence, Italy', 'Siena, Italy', 120.0, 3, 'PUBLIC', '2026-08-15 16:45:00'),
(4, 1, 'Ring Road Iceland Adventure', 'Waterfalls, glaciers and black-sand beaches on Iceland''s full Ring Road.', 'Reykjavik, Iceland', 'Reykjavik, Iceland', 1332.0, 9, 'PUBLIC', '2026-08-20 09:00:00'),
(5, 2, 'Weekend Getaway (Draft)', 'Still planning this one - not ready to share yet.', 'Delhi, India', 'Rishikesh, India', 240.0, 2, 'PRIVATE', '2026-09-01 20:10:00');

-- -----------------------------------------------------------------------------
-- TRIP_TAGS (many-to-many)
-- -----------------------------------------------------------------------------
INSERT INTO trip_tags (trip_id, tag_id) VALUES
(1, 1), (1, 2),               -- PCH: beach, road-trip
(2, 3), (2, 4), (2, 9),       -- Rajasthan: desert, heritage, budget
(3, 4), (3, 5),               -- Tuscany: heritage, countryside
(4, 6), (4, 7), (4, 8);       -- Iceland: glacier, waterfalls, hiking

-- -----------------------------------------------------------------------------
-- STOPS (stop_order = order along the route, day_number = which day)
-- -----------------------------------------------------------------------------
INSERT INTO stops (id, trip_id, name, latitude, longitude, description, stop_order, day_number) VALUES
-- Trip 1: Pacific Coast Highway
(1, 1, 'Golden Gate Bridge',        37.8199,  -122.4783, 'Starting point - photo stop at sunrise.', 1, 1),
(2, 1, 'Santa Cruz Beach Boardwalk', 36.9641, -122.0178, 'Classic boardwalk and beach break.',       2, 2),
(3, 1, 'Bixby Creek Bridge, Big Sur', 36.3716, -121.9012, 'The most photographed bridge on the coast.', 3, 3),
(4, 1, 'Hearst Castle',              35.6852, -121.1685, 'Guided tour of the historic estate.',       4, 4),

-- Trip 2: Rajasthan Desert Circuit
(5, 2, 'Amber Fort, Jaipur',   26.9855, 75.8513, 'Hilltop fort with mirrored halls.',        1, 1),
(6, 2, 'Chittorgarh Fort',     24.8887, 74.6269, 'Largest fort complex in India.',           2, 3),
(7, 2, 'Jaisalmer Fort',       26.9124, 70.9129, 'A living fort still inhabited today.',     3, 6),

-- Trip 3: Tuscany Hill Towns
(8, 3, 'Piazzale Michelangelo', 43.7629, 11.2650, 'Best skyline view of Florence.',          1, 1),
(9, 3, 'San Gimignano',         43.4677, 11.0430, 'Medieval hill town of towers.',            2, 2),
(10, 3, 'Piazza del Campo, Siena', 43.3188, 11.3307, 'Famous shell-shaped main square.',      3, 3),

-- Trip 4: Ring Road Iceland
(11, 4, 'Thingvellir National Park', 64.2559, -21.1297, 'Where two tectonic plates meet.',   1, 1),
(12, 4, 'Gullfoss Waterfall',        64.3271, -20.1199, 'Part of the Golden Circle.',         2, 2),
(13, 4, 'Jokulsarlon Glacier Lagoon', 64.0784, -16.2300, 'Icebergs floating out to sea.',     3, 5),
(14, 4, 'Skogafoss',                 63.5320, -19.5116, 'Walk right up to the waterfall base.', 4, 8);

-- -----------------------------------------------------------------------------
-- PHOTOS (sample - one per first stop of each trip)
-- -----------------------------------------------------------------------------
INSERT INTO photos (id, stop_id, url) VALUES
(1, 1, 'https://images.unsplash.com/photo-golden-gate-bridge.jpg'),
(2, 5, 'https://images.unsplash.com/photo-amber-fort.jpg'),
(3, 8, 'https://images.unsplash.com/photo-florence-skyline.jpg'),
(4, 11, 'https://images.unsplash.com/photo-thingvellir.jpg');

-- -----------------------------------------------------------------------------
-- COMMENTS
-- -----------------------------------------------------------------------------
INSERT INTO comments (id, trip_id, user_id, content, created_at) VALUES
(1, 1, 2, 'Did this exact route last year - Big Sur is unreal. Great itinerary!', '2026-08-18 12:00:00'),
(2, 1, 3, 'How many days would you recommend for someone without a car reservation yet?', '2026-08-19 09:30:00'),
(3, 2, 1, 'Jaisalmer Fort at sunset is magical, glad you included it.', '2026-08-20 17:15:00'),
(4, 4, 2, 'Saving this for next summer. Did you rent a 4x4 for the F-roads?', '2026-08-25 21:05:00');

-- -----------------------------------------------------------------------------
-- RATINGS (one per user per trip - enforced by the uq_rating_trip_user constraint)
-- -----------------------------------------------------------------------------
INSERT INTO ratings (id, trip_id, user_id, score) VALUES
(1, 1, 2, 5),
(2, 1, 3, 4),
(3, 2, 1, 5),
(4, 3, 1, 4),
(5, 4, 2, 5),
(6, 4, 3, 5);
