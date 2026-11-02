# Waypoint — Frontend

The View layer of the Road Trip Sharing Platform (MVC). Plain HTML, CSS and
JavaScript — no build step, no framework, no npm install. It talks to the
Spring Boot backend entirely through the REST API documented in
`Road_Trip_Backend_Design_Document.docx`, plus three free, no-API-key public
services for real-world map features (see below).

## What's new in this version

- **Three themes** — Explorer (light), Premium Midnight (dark), Forest Escape
  (sage/nature). Switch via the palette icon in the navbar; it's saved per
  browser and applied instantly, including the map tiles.
- **Custom logo + icon set** — a hand-made two-tone pin mark, and Lucide icons
  throughout (nav, buttons, categories) instead of plain text.
- **Animations** — staggered fade-ins for trip cards, hero entrance motion,
  marker pop-ins, smooth theme transitions. Respects `prefers-reduced-motion`.
- **Real driving routes** — trip detail pages now calculate an actual
  road-following route (not a straight line) via OSRM, with live distance and
  duration.
- **Nearby places** — hotels, restaurants, attractions and fuel stations near
  a trip's stops, pulled live from OpenStreetMap's places database.
- **Worldwide place search** — typing a start/end location or a stop name now
  autocompletes against any place on Earth (not just typed text), via
  Photon (OpenStreetMap data).

### The free services this relies on

| Service | What it does | Cost | Limits worth knowing |
|---|---|---|---|
| [Photon](https://photon.komoot.io) | Search any place name worldwide (type-ahead) | Free, no key | Fair use; requests are debounced. Chosen over Nominatim because Nominatim's public policy forbids autocomplete |
| [OSRM @ FOSSGIS](https://routing.openstreetmap.de) | Real driving routes (falls back to the older router.project-osrm.org) | Free, no key | ~1 request/sec, light use only, attribution required (in the footer); no live traffic, so times are approximate |
| [Photon reverse search](https://photon.komoot.io) (backup: Overpass mirrors) | Hotels/restaurants/attractions/fuel near each stop | Free, no key | Photon is primary. The public Overpass servers are shared and often overloaded (504/timeouts in Oct 2026), so they are only a fallback; the app says so instead of showing a false "nothing found" |
| OpenStreetMap tiles | The map images | Free, no key | Light use only; Midnight and Forest themes recolor the same tiles with CSS |

**Not working?** Open `diagnostics.html` (right-click, Open with Live Server). It tests the
backend, map tiles, place search, routing and nearby places one by one and shows the exact
reason for any failure.

If you ever outgrow these (e.g. deploying somewhere with real traffic),
the honest next step is a paid provider (Mapbox, Google Places, HERE) or
self-hosting your own Nominatim/OSRM/Overpass instance — not a code change,
just swapping the base URLs in `js/geocode.js`, `js/routing.js`, `js/places.js`.

## Pages

| File | What it does |
|---|---|
| `index.html` | Browse/search public trips, world map of pins, tag filters |
| `trip-detail.html` | One trip's route map, stops, comments, star rating |
| `create-trip.html` | Two-step form: trip details, then click-to-add stops on a map |
| `login.html` / `register.html` | Authentication |
| `my-trips.html` | The logged-in user's own trips (public + private), with edit links |

## How it's wired together

- `js/api.js` — the only file that knows the backend's URL (`API_BASE`) and
  how to attach the JWT. Every page calls the `Api.*` functions from here
  instead of calling `fetch()` directly.
- `js/theme.js` — the 3-theme switcher. Each page also has a tiny inline
  `<script>` at the very top of `<head>` that applies the saved theme
  instantly, before the CSS paints, so there's no flash of the wrong theme.
- `js/geocode.js` — worldwide place search (Photon). `attachGeocodeAutocomplete()`
  is a reusable helper wired to any text input that needs a "search anywhere
  on Earth" dropdown.
- `js/routing.js` — real driving routes (OSRM). `calculateDrivingRoute()`
  takes an ordered list of stops and returns the actual road geometry,
  distance and duration, or `null` if the free public server can't be reached.
- `js/places.js` — nearby hotels/restaurants/attractions/fuel (Photon reverse search, Overpass as fallback).
  `PLACE_CATEGORIES` defines the 4 categories and their OSM tags/icons.
- `js/nav.js` — renders the "Log in / Sign up" vs "Hi, name / Log out" area
  of the navbar on every page, based on what's in `localStorage`.
- Each page has its own `js/<page>.js` for page-specific logic.

## Running it

**You need the backend running first** (`http://localhost:8080`) — see the
backend project's own README. This frontend does nothing on its own; it's
just the View, calling that API.

1. In VS Code, install the **"Live Server"** extension (by Ritwick Dey) if
   you don't have it — Extensions panel (Ctrl+Shift+X), search "Live Server".
2. Open this `road-trip-frontend` folder in VS Code (a *separate* window
   from the backend, or a second folder in the same workspace).
3. Right-click `index.html` in the Explorer panel → **"Open with Live
   Server"**. It opens in your browser at something like
   `http://127.0.0.1:5500`.

Why Live Server and not just double-clicking the HTML file? Opening a file
directly (`file://...`) makes some browsers block the API requests to
`localhost:8080` for security reasons. Live Server serves the page over
`http://`, which avoids that entirely.

## If something doesn't load

- **Blank trip list / "Could not reach the backend"** → the Spring Boot app
  isn't running, or isn't on port 8080. Check the terminal where you ran it.
- **CORS error in the browser console** → the backend's `SecurityConfig`
  already allows all origins for local development, so this usually means
  the backend isn't actually running yet, not a real CORS problem.
- **Map doesn't appear** → check your internet connection; map tiles load
  live from OpenStreetMap and the Leaflet library loads from a CDN.
