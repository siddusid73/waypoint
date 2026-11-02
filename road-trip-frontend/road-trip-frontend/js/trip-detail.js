/* Trip detail page: route map, stops, comments, ratings, owner actions, nearby places. */

let detailMap = null;
let nearbyMarkerLayer = null;
let currentTrip = null;
let activeNearbyCategory = null;

function getTripIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}

const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/**
 * Draws the map. Tries a REAL driving route via OSRM first (follows actual
 * roads); if that's unavailable (offline, <2 stops, no road connection) it
 * falls back to a straight dashed line so the page still works.
 */
async function renderMap(stops) {
  detailMap = L.map("detail-map").setView([20, 10], 2);
  L.tileLayer(OSM_TILE_URL, { attribution: "&copy; OpenStreetMap contributors" }).addTo(detailMap);
  nearbyMarkerLayer = L.layerGroup().addTo(detailMap);

  if (!stops.length) return;

  stops.forEach((stop, i) => {
    L.marker([stop.latitude, stop.longitude])
      .addTo(detailMap)
      .bindPopup(`<strong>${i + 1}. ${escapeHtml(stop.name)}</strong>`);
  });

  const straightLatLngs = stops.map((s) => [s.latitude, s.longitude]);
  const routeInfoEl = document.getElementById("route-info-wrap");

  if (stops.length >= 2) {
    const route = await calculateDrivingRoute(stops);
    if (route) {
      L.polyline(route.coordinates, { color: "#a8512f", weight: 4, opacity: 0.85 }).addTo(detailMap);
      detailMap.fitBounds(L.latLngBounds(route.coordinates).pad(0.2));
      routeInfoEl.innerHTML = `
        <div class="route-info-badge">
          <span class="seg"><svg data-lucide="route"></svg>Real driving route: <strong>${route.distanceKm} km</strong></span>
          <span class="seg"><svg data-lucide="clock"></svg>~<strong>${formatDuration(route.durationMin)}</strong> driving</span>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }
  }

  // Fallback: no route service response - draw a straight dashed line instead.
  L.polyline(straightLatLngs, { color: "#a8512f", weight: 3, dashArray: "6 6" }).addTo(detailMap);
  detailMap.fitBounds(L.latLngBounds(straightLatLngs).pad(0.25));
  if (stops.length >= 2) {
    routeInfoEl.innerHTML = `<p class="field-hint">Couldn't reach the live routing service — showing a straight-line preview instead.</p>`;
  }
}

/* ---------------------------------------------------------------- NEARBY PLACES */

function renderNearbyCategoryBar() {
  const bar = document.getElementById("nearby-category-bar");
  bar.innerHTML = Object.entries(PLACE_CATEGORIES)
    .map(
      ([key, cat]) => `<button type="button" class="category-chip" data-cat="${key}">
        <svg data-lucide="${cat.icon}"></svg>${cat.label}
      </button>`
    )
    .join("");
  if (window.lucide) lucide.createIcons();

  bar.querySelectorAll(".category-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.cat;
      const isActive = chip.classList.contains("active");
      bar.querySelectorAll(".category-chip").forEach((c) => c.classList.remove("active"));
      nearbyMarkerLayer.clearLayers();

      if (isActive) {
        activeNearbyCategory = null;
        document.getElementById("nearby-list").innerHTML = "";
        return;
      }
      chip.classList.add("active");
      activeNearbyCategory = key;
      loadNearbyForCategory(key);
    });
  });
}

async function loadNearbyForCategory(categoryKey) {
  const listEl = document.getElementById("nearby-list");
  listEl.innerHTML = `<li class="nearby-empty"><span class="spinner"></span> Searching OpenStreetMap…</li>`;

  const places = await findNearbyAlongStops(currentTrip.stops, 2500, categoryKey);

  if (activeNearbyCategory !== categoryKey) return; // user switched category while this was loading

  if (places === null) {
    listEl.innerHTML = `<li class="nearby-empty">The free places services are busy or unreachable right now. Wait a moment and click the category again.</li>`;
    return;
  }

  if (!places.length) {
    listEl.innerHTML = `<li class="nearby-empty">No ${PLACE_CATEGORIES[categoryKey].label.toLowerCase()} found nearby in OpenStreetMap's data for this area.</li>`;
    return;
  }

  const icon = PLACE_CATEGORIES[categoryKey].icon;
  listEl.innerHTML = places
    .slice(0, 20)
    .map((p) => {
      const nearestStop = currentTrip.stops.reduce((best, s) => {
        const d = haversineKm(p.lat, p.lon, s.latitude, s.longitude);
        return d < best ? d : best;
      }, Infinity);
      return `
      <li class="nearby-item">
        <div class="nearby-icon"><svg data-lucide="${icon}"></svg></div>
        <div class="nearby-info">
          <strong>${escapeHtml(p.name)}</strong>
          <span>${nearestStop.toFixed(1)} km from nearest stop</span>
        </div>
      </li>`;
    })
    .join("");
  if (window.lucide) lucide.createIcons();

  nearbyMarkerLayer.clearLayers();
  places.forEach((p) => {
    L.circleMarker([p.lat, p.lon], { radius: 6, color: "#a8512f", fillColor: "#a8512f", fillOpacity: 0.85, weight: 1 })
      .bindPopup(`<strong>${escapeHtml(p.name)}</strong>`)
      .addTo(nearbyMarkerLayer);
  });
}

function renderStops(stops) {
  const el = document.getElementById("stop-list");
  if (!stops.length) {
    el.innerHTML = `<p>No stops added to this trip yet.</p>`;
    return;
  }
  el.innerHTML = stops
    .map(
      (s, i) => `
      <li class="stop-item">
        <div class="stop-num">${i + 1}</div>
        <div>
          ${s.dayNumber ? `<div class="stop-day">Day ${s.dayNumber}</div>` : ""}
          <h4>${escapeHtml(s.name)}</h4>
          <p style="margin:0;">${escapeHtml(s.description ?? "")}</p>
        </div>
      </li>`
    )
    .join("");
}

async function renderComments(tripId) {
  const list = document.getElementById("comment-list");
  try {
    const comments = await Api.listComments(tripId);
    list.innerHTML = comments.length
      ? comments
          .map(
            (c) => `
        <div class="comment-item">
          <div class="comment-meta"><strong>${escapeHtml(c.userName)}</strong> &middot; ${new Date(c.createdAt).toLocaleDateString()}</div>
          <div>${escapeHtml(c.content)}</div>
        </div>`
          )
          .join("")
      : `<p>No comments yet.</p>`;
  } catch (err) {
    list.innerHTML = `<p>${escapeHtml(err.message)}</p>`;
  }
}

function renderCommentForm(tripId) {
  const wrap = document.getElementById("comment-form-wrap");
  if (!isLoggedIn()) {
    wrap.innerHTML = `<p><a href="login.html">Log in</a> to leave a comment.</p>`;
    return;
  }
  wrap.innerHTML = `
    <form id="comment-form" style="margin-bottom:20px;">
      <div class="field"><textarea id="comment-input" placeholder="Share a tip, a question, anything useful for other travelers…" required></textarea></div>
      <button type="submit" class="btn btn-primary btn-sm">Post comment</button>
    </form>
  `;
  document.getElementById("comment-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("comment-input");
    try {
      await Api.addComment(tripId, { content: input.value.trim() });
      input.value = "";
      renderComments(tripId);
    } catch (err) {
      alert(err.message);
    }
  });
}

function renderRatingWidget(tripId, currentAverage) {
  const wrap = document.getElementById("rating-widget-wrap");
  if (!isLoggedIn()) {
    wrap.innerHTML = `<p><a href="login.html">Log in</a> to rate this trip.</p>`;
    return;
  }
  wrap.innerHTML = `
    <div class="rating-widget" id="stars"></div>
    <p class="field-hint">Click a star to submit your rating.</p>
  `;
  const starsEl = document.getElementById("stars");
  starsEl.innerHTML = [1, 2, 3, 4, 5]
    .map((n) => `<button type="button" class="star-btn" data-score="${n}">&#9733;</button>`)
    .join("");

  starsEl.querySelectorAll(".star-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const score = Number(btn.dataset.score);
      try {
        const summary = await Api.rateTrip(tripId, score);
        document.getElementById("stat-rating").textContent = summary.averageScore?.toFixed(1) ?? "—";
        starsEl.querySelectorAll(".star-btn").forEach((b) => {
          b.classList.toggle("filled", Number(b.dataset.score) <= score);
        });
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

async function loadTrip() {
  const id = getTripIdFromUrl();
  if (!id) {
    document.getElementById("loading").innerHTML = `<div class="empty-state">No trip specified.</div>`;
    return;
  }

  try {
    const trip = await Api.getTrip(id);
    currentTrip = trip;

    document.getElementById("trip-title").textContent = trip.title;
    document.getElementById("trip-owner").textContent = "Planned by " + trip.ownerName;
    document.getElementById("trip-route").textContent =
      `${trip.startLocation ?? "?"} → ${trip.endLocation ?? "?"}`;
    document.getElementById("trip-description").textContent = trip.description || "No description provided.";
    document.getElementById("stat-duration").textContent = trip.durationDays ?? "—";
    document.getElementById("stat-distance").textContent = trip.totalDistanceKm ?? "—";
    document.getElementById("stat-rating").textContent = trip.averageRating ? trip.averageRating.toFixed(1) : "—";
    document.getElementById("stat-stops").textContent = trip.stops.length;
    document.getElementById("stat-visibility").textContent = trip.visibility;

    const user = getUser();
    if (user && user.userId === trip.ownerId) {
      document.getElementById("owner-actions").style.display = "flex";
      document.getElementById("edit-link").href = `create-trip.html?edit=${trip.id}`;
      document.getElementById("delete-btn").addEventListener("click", async () => {
        if (!confirm("Delete this trip permanently?")) return;
        try {
          await Api.deleteTrip(trip.id);
          window.location.href = "my-trips.html";
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // The map container must be VISIBLE before Leaflet measures it, otherwise
    // it initialises at 0x0 and renders grey/misaligned. So reveal first.
    document.getElementById("loading").style.display = "none";
    document.getElementById("trip-content").style.display = "block";

    await renderMap(trip.stops);
    renderStops(trip.stops);
    renderCommentForm(trip.id);
    renderComments(trip.id);
    renderRatingWidget(trip.id, trip.averageRating);
    if (trip.stops.length) renderNearbyCategoryBar();
    else document.querySelector(".nearby-panel").style.display = "none";

    if (detailMap) detailMap.invalidateSize();
  } catch (err) {
    document.getElementById("loading").innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadTrip);
