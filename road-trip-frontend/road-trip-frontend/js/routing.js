/* ==========================================================================
   ROUTING - real driving directions via OSRM (Open Source Routing Machine).
   No API key. We try the FOSSGIS-hosted server first (the one the OSRM
   project points people to now), then the older demo server as a fallback.

   Usage policy (FOSSGIS): light use only, max ~1 request/second, no scraping,
   and the map must credit "Routes: OSRM / FOSSGIS - Data (c) OpenStreetMap
   contributors" (shown in each page footer). We call it once per trip view.
   Note: the car profile has no live traffic, so times are approximate.
   ========================================================================== */
const ROUTING_SERVERS = [
  "https://routing.openstreetmap.de/routed-car/route/v1/driving/",
  "https://router.project-osrm.org/route/v1/driving/",
];

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * stops: ordered array of { latitude, longitude } (2+ required).
 * Resolves to { coordinates: [[lat,lng],...], distanceKm, durationMin,
 * server } or null if no server could produce a route. Never throws, so
 * callers can fall back to a straight line.
 */
async function calculateDrivingRoute(stops) {
  if (!stops || stops.length < 2) return null;

  const coordString = stops.map((s) => `${s.longitude},${s.latitude}`).join(";");
  const query = "?overview=full&geometries=geojson";

  for (const base of ROUTING_SERVERS) {
    try {
      const response = await fetchWithTimeout(base + coordString + query);
      if (!response.ok) continue; // try the next server
      const data = await response.json();
      if (data.code !== "Ok" || !data.routes || !data.routes.length) continue;

      const route = data.routes[0];
      return {
        // GeoJSON is [lng, lat]; Leaflet wants [lat, lng]
        coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distanceKm: Math.round(route.distance / 100) / 10,
        durationMin: Math.round(route.duration / 60),
        server: base,
      };
    } catch (err) {
      console.warn("Routing server failed:", base, err);
    }
  }
  return null;
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
