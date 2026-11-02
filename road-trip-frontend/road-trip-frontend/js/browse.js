/* Browse / home page: world map, search, tag filters, trip grid. */

let heroMap;
let activeTag = null;

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function initHeroMap() {
  heroMap = L.map("hero-map", { scrollWheelZoom: false }).setView([20, 10], 2);
  L.tileLayer(OSM_TILE_URL, { attribution: "&copy; OpenStreetMap contributors", maxZoom: 18 }).addTo(heroMap);
}

/** Pulls each trip's first stop (if any) so we can drop a pin for it on the world map. */
async function plotTripsOnMap(trips) {
  const withDetail = await Promise.allSettled(
    trips.slice(0, 12).map((t) => Api.getTrip(t.id))
  );

  const markers = [];
  withDetail.forEach((result) => {
    if (result.status !== "fulfilled") return;
    const trip = result.value;
    const firstStop = trip.stops && trip.stops[0];
    if (!firstStop) return;

    const marker = L.marker([firstStop.latitude, firstStop.longitude]).addTo(heroMap);
    marker.bindPopup(
      `<strong>${escapeHtml(trip.title)}</strong><br>${escapeHtml(trip.startLocation ?? "")} → ${escapeHtml(trip.endLocation ?? "")}<br><a href="trip-detail.html?id=${trip.id}">View trip →</a>`
    );
    markers.push(marker);
  });

  if (markers.length) {
    const group = L.featureGroup(markers);
    heroMap.fitBounds(group.getBounds().pad(0.3));
  }
}

function tripCardHtml(trip) {
  const rating = trip.averageRating ? trip.averageRating.toFixed(1) : "—";
  const tags = (trip.tags || []).map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join("");
  return `
    <article class="trip-card">
      <h3><a href="trip-detail.html?id=${trip.id}">${escapeHtml(trip.title)}</a></h3>
      <div class="route-line">${escapeHtml(trip.startLocation ?? "?")} &rarr; ${escapeHtml(trip.endLocation ?? "?")}</div>
      <div class="tag-list">${tags}</div>
      <div class="trip-meta">
        <span>By ${escapeHtml(trip.ownerName)} &middot; ${trip.durationDays ?? "?"} days</span>
        <span class="rating">&#9733; ${rating}</span>
      </div>
    </article>
  `;
}

async function loadTrips(keyword = "", tag = null) {
  const grid = document.getElementById("trip-grid");
  grid.classList.remove("in");
  grid.innerHTML = `<div class="loading-state"><span class="spinner"></span>Loading trips…</div>`;

  try {
    const page = await Api.browseTrips({ keyword, tag, page: 0, size: 24 });
    const trips = page.content ?? [];

    document.getElementById("results-heading").textContent =
      keyword || tag ? `${trips.length} trip${trips.length === 1 ? "" : "s"} found` : "All trips";

    if (!trips.length) {
      grid.innerHTML = `<div class="empty-state">No trips match yet. Be the first to <a href="create-trip.html">create one</a>.</div>`;
      return;
    }

    grid.innerHTML = trips.map(tripCardHtml).join("");
    requestAnimationFrame(() => requestAnimationFrame(() => grid.classList.add("in"))); // fade+stagger the cards in
    plotTripsOnMap(trips);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

async function loadTagChips() {
  const el = document.getElementById("tag-chips");
  try {
    const tags = await Api.listTags();
    el.innerHTML = tags
      .map((t) => `<button type="button" class="chip" data-tag="${escapeHtml(t.name)}">${escapeHtml(t.name)}</button>`)
      .join("");

    el.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const tag = chip.dataset.tag;
        const isActive = chip.classList.contains("active");
        el.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
        activeTag = isActive ? null : tag;
        if (!isActive) chip.classList.add("active");
        loadTrips(document.getElementById("keyword-input").value.trim(), activeTag);
      });
    });
  } catch {
    el.innerHTML = ""; // tag loading is a nice-to-have, fail silently
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroMap();
  loadTagChips();
  loadTrips();

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    loadTrips(document.getElementById("keyword-input").value.trim(), activeTag);
  });
});
