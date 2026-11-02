/* ==========================================================================
   GEOCODE - worldwide place search via Photon (https://photon.komoot.io),
   a free, keyless, OpenStreetMap-based geocoder built for search-as-you-type.

   Why not Nominatim? Its public usage policy forbids autocomplete-style
   requests, so a type-ahead box built on it gets throttled or blocked.
   Photon is designed for exactly this use. Fair-use applies: we debounce
   requests (see attachGeocodeAutocomplete) and never fire on every keystroke.
   Data (c) OpenStreetMap contributors.
   ========================================================================== */
const PHOTON_BASE = "https://photon.komoot.io/api/";

/** Builds a readable one-line label from a Photon feature's properties. */
function photonLabel(p) {
  const street = p.street ? (p.housenumber ? p.housenumber + " " + p.street : p.street) : null;
  const parts = [p.name || street, p.district, p.city, p.state, p.country].filter(Boolean);
  // drop consecutive duplicates (e.g. "Paris, Paris, France")
  return parts.filter((part, i) => part !== parts[i - 1]).join(", ");
}

/**
 * Searches for a place name anywhere in the world.
 * Returns [{ displayName, lat, lon, type }]. THROWS on network/HTTP failure so
 * callers can tell "service unavailable" apart from "no matches".
 */
async function geocodeSearch(query, limit = 6) {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({ q: query.trim(), limit: String(limit), lang: "en" });
  const response = await fetch(`${PHOTON_BASE}?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Place search returned HTTP " + response.status);
  }
  const data = await response.json();

  return (data.features || [])
    .filter((f) => f.geometry && f.geometry.coordinates)
    .map((f) => ({
      displayName: photonLabel(f.properties) || "Unnamed place",
      lon: f.geometry.coordinates[0], // GeoJSON order is [lon, lat]
      lat: f.geometry.coordinates[1],
      type: f.properties.osm_value || f.properties.osm_key || "place",
    }));
}

/**
 * Attaches worldwide-search autocomplete to a text input. Shows a dropdown
 * of matches as the user types (debounced) and calls onSelect(result) when
 * they click one.
 */
function attachGeocodeAutocomplete(inputEl, listEl, onSelect) {
  let debounceTimer = null;
  let currentResults = [];

  inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const query = inputEl.value.trim();
    if (query.length < 2) {
      listEl.classList.remove("open");
      return;
    }
    debounceTimer = setTimeout(async () => {
      listEl.innerHTML = `<div class="autocomplete-item" style="color:var(--sage);cursor:default;"><span class="spinner"></span>Searching…</div>`;
      listEl.classList.add("open");
      try {
        currentResults = await geocodeSearch(query);
        renderList();
      } catch (err) {
        console.warn("Waypoint place search failed:", err);
        listEl.innerHTML = `<div class="autocomplete-item" style="color:var(--danger);cursor:default;">
          Place search is unavailable right now (${escapeHtml(err.message)}). You can still click the map to drop a stop.
        </div>`;
        listEl.classList.add("open");
      }
    }, 400); // debounce - avoid hammering the free public endpoint
  });

  function renderList() {
    if (!currentResults.length) {
      listEl.innerHTML = `<div class="autocomplete-item" style="color:var(--sage);cursor:default;">No matches found</div>`;
      listEl.classList.add("open");
      return;
    }
    listEl.innerHTML = currentResults
      .map(
        (r, i) => `<div class="autocomplete-item" data-idx="${i}">
          <svg data-lucide="map-pin"></svg><span>${escapeHtml(r.displayName)}</span>
        </div>`
      )
      .join("");
    if (window.lucide) lucide.createIcons();
    listEl.classList.add("open");

    listEl.querySelectorAll(".autocomplete-item[data-idx]").forEach((item) => {
      item.addEventListener("click", () => {
        const result = currentResults[Number(item.dataset.idx)];
        listEl.classList.remove("open");
        onSelect(result);
      });
    });
  }

  document.addEventListener("click", (e) => {
    if (!inputEl.contains(e.target) && !listEl.contains(e.target)) {
      listEl.classList.remove("open");
    }
  });
}
