/* ==========================================================================
   PLACES - nearby hotels, restaurants, attractions & fuel stations, from
   OpenStreetMap data, worldwide, free, no API key.

   PRIMARY:  Photon "reverse" search (photon.komoot.io/reverse) - given a
             point, a radius and an OSM category filter it returns the
             nearest matching places. Fast, CORS-enabled, includes places
             mapped as buildings/areas, not just single points.
   FALLBACK: Overpass API public mirrors. These are shared community servers
             that are frequently overloaded (504 / timeouts), so they are
             only tried if Photon fails completely.

   Depends on fetchWithTimeout() from routing.js (load routing.js first).
   Data (c) OpenStreetMap contributors.
   ========================================================================== */
const PHOTON_REVERSE = "https://photon.komoot.io/reverse";

// Mirrors tried in order, ONLY if Photon fails. Verified against the OSM wiki's
// public-instance list; availability changes, which is why Photon is primary.
const OVERPASS_SERVERS = [
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const PLACE_CATEGORIES = {
  hotels: {
    label: "Hotels",
    icon: "bed",
    photonTags: ["tourism:hotel", "tourism:guest_house"],
    overpassTags: ["tourism=hotel", "tourism=guest_house", "tourism=hostel", "tourism=motel"],
  },
  restaurants: {
    label: "Restaurants",
    icon: "utensils",
    photonTags: ["amenity:restaurant", "amenity:cafe"],
    overpassTags: ["amenity=restaurant", "amenity=cafe", "amenity=fast_food"],
  },
  attractions: {
    label: "Attractions",
    icon: "camera",
    photonTags: ["tourism:attraction", "tourism:viewpoint"],
    overpassTags: ["tourism=attraction", "tourism=viewpoint", "tourism=museum", "historic=monument"],
  },
  fuel: {
    label: "Fuel",
    icon: "fuel",
    photonTags: ["amenity:fuel"],
    overpassTags: ["amenity=fuel"],
  },
};

// Which provider answered most recently - shown by diagnostics.html.
let lastPlacesProvider = null;

/* ----------------------------------------------------------- Photon (primary) */

/** Returns an array of places, or null if EVERY request failed. */
async function findNearbyViaPhoton(lat, lon, radiusMeters, categoryKey) {
  const cat = PLACE_CATEGORIES[categoryKey];
  const settled = await Promise.allSettled(
    cat.photonTags.map(async (tag) => {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        radius: String(radiusMeters / 1000), // Photon wants kilometres
        limit: "15",
        osm_tag: tag,
        lang: "en",
      });
      const response = await fetchWithTimeout(`${PHOTON_REVERSE}?${params.toString()}`, {}, 12000);
      if (!response.ok) throw new Error("Photon HTTP " + response.status);
      const data = await response.json();
      return (data.features || [])
        .filter((f) => f.properties && f.properties.name && f.geometry && f.geometry.coordinates)
        .map((f) => ({
          name: f.properties.name,
          lon: f.geometry.coordinates[0], // GeoJSON order is [lon, lat]
          lat: f.geometry.coordinates[1],
          category: categoryKey,
        }));
    })
  );

  if (settled.every((s) => s.status === "rejected")) {
    console.warn("Photon nearby search failed:", settled[0].reason);
    return null;
  }
  return settled.filter((s) => s.status === "fulfilled").flatMap((s) => s.value);
}

/* --------------------------------------------------------- Overpass (fallback) */

function buildOverpassQuery(lat, lon, radiusMeters, categoryKey) {
  const clauses = PLACE_CATEGORIES[categoryKey].overpassTags
    .map((tag) => {
      const [key, value] = tag.split("=");
      // nwr = nodes, ways AND relations (many hotels are mapped as buildings)
      return `  nwr["${key}"="${value}"](around:${radiusMeters},${lat},${lon});`;
    })
    .join("\n");
  return `[out:json][timeout:20];\n(\n${clauses}\n);\nout center 15;`;
}

/** Returns an array of places, or null if every mirror failed or timed out. */
async function findNearbyViaOverpass(lat, lon, radiusMeters, categoryKey) {
  const query = buildOverpassQuery(lat, lon, radiusMeters, categoryKey);

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetchWithTimeout(
        server,
        {
          method: "POST",
          body: "data=" + encodeURIComponent(query),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
        20000
      );
      if (!response.ok) continue; // 429 / 504 = busy, try the next mirror
      const data = await response.json();
      return (data.elements || [])
        .filter((el) => el.tags && el.tags.name)
        .map((el) => ({
          name: el.tags.name,
          lat: el.lat ?? (el.center && el.center.lat),
          lon: el.lon ?? (el.center && el.center.lon),
          category: categoryKey,
        }))
        .filter((p) => p.lat != null && p.lon != null);
    } catch (err) {
      console.warn("Overpass mirror failed:", server, err);
    }
  }
  return null;
}

/* ------------------------------------------------------------------ public API */

/**
 * Nearby places of one category around one point.
 * Resolves to an array (possibly empty = searched fine, found nothing) or
 * null (every provider failed).
 */
async function findNearbyPlaces(lat, lon, radiusMeters, categoryKey) {
  const viaPhoton = await findNearbyViaPhoton(lat, lon, radiusMeters, categoryKey);
  if (viaPhoton !== null) {
    lastPlacesProvider = "Photon";
    return viaPhoton;
  }
  const viaOverpass = await findNearbyViaOverpass(lat, lon, radiusMeters, categoryKey);
  if (viaOverpass !== null) lastPlacesProvider = "Overpass";
  return viaOverpass;
}

/**
 * Nearby places across a whole trip. Samples at most 5 stops (spread evenly
 * along the trip) so one click never fires dozens of requests at free
 * services, then de-duplicates places found near more than one stop.
 * Resolves to an array, or null if every lookup failed.
 */
async function findNearbyAlongStops(stops, radiusMeters, categoryKey) {
  const MAX_STOPS = 5;
  let sampled = stops;
  if (stops.length > MAX_STOPS) {
    sampled = Array.from({ length: MAX_STOPS }, (_, i) =>
      stops[Math.round((i * (stops.length - 1)) / (MAX_STOPS - 1))]
    );
  }

  const perStop = await Promise.all(
    sampled.map((s) => findNearbyPlaces(s.latitude, s.longitude, radiusMeters, categoryKey))
  );
  if (perStop.every((list) => list === null)) return null;

  const seen = new Set();
  const deduped = [];
  for (const list of perStop) {
    for (const place of list || []) {
      const key = place.name + "|" + place.lat.toFixed(3) + "|" + place.lon.toFixed(3);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(place);
    }
  }
  return deduped;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}
