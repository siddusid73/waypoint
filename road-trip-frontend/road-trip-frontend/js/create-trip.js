/* Create/edit trip: step 1 (details) -> step 2 (click-to-add stops on a map). */

let currentTripId = null;
let pendingLatLng = null;
let stopCount = 0;
let stopMap;

function showStep(n) {
  document.querySelectorAll(".step-panel").forEach((p) => p.classList.remove("active"));
  document.getElementById("step-" + n).classList.add("active");
  // The step-2 map was created while its panel was hidden (0x0 size). Tell
  // Leaflet to re-measure now that it is visible, or tiles/clicks are misaligned.
  if (n === 2 && stopMap) setTimeout(() => stopMap.invalidateSize(), 60);

  document.querySelectorAll(".step-pill").forEach((p) => p.classList.remove("active"));
  document.getElementById("step-pill-" + n).classList.add("active");
  if (n === 2) document.getElementById("step-pill-1").classList.add("done");
}

let pendingMarker = null;
const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

function initStopMap() {
  stopMap = L.map("stop-map").setView([20, 10], 2);
  L.tileLayer(OSM_TILE_URL, { attribution: "&copy; OpenStreetMap contributors" }).addTo(stopMap);

  stopMap.on("click", (e) => placePendingMarker(e.latlng));

  window.__clearPendingMarker = () => {
    if (pendingMarker) stopMap.removeLayer(pendingMarker);
    pendingMarker = null;
  };
}

/** Shared by both "click the map" and "pick a worldwide search result". */
function placePendingMarker(latlng) {
  pendingLatLng = latlng;
  if (pendingMarker) stopMap.removeLayer(pendingMarker);
  pendingMarker = L.marker(latlng, { opacity: 0.7 }).addTo(stopMap);
  document.getElementById("add-stop-btn").disabled = false;
  document.getElementById("add-stop-btn").textContent = "Add this stop";
}

/** Worldwide place search (Nominatim) for picking a stop without knowing exact coordinates. */
function initPlaceSearch() {
  const input = document.getElementById("place-search");
  const list = document.getElementById("place-search-list");

  attachGeocodeAutocomplete(input, list, (result) => {
    const latlng = L.latLng(result.lat, result.lon);
    stopMap.flyTo(latlng, 13, { duration: 0.8 });
    placePendingMarker(latlng);

    // Pre-fill the stop name with a short version of the place's full address.
    const shortName = result.displayName.split(",")[0];
    const nameInput = document.getElementById("stop-name");
    if (!nameInput.value.trim()) nameInput.value = shortName;

    input.value = result.displayName;
  });
}

/** Worldwide autocomplete for the plain-text start/end location fields in Step 1. */
function initLocationFieldAutocomplete(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  attachGeocodeAutocomplete(input, list, (result) => {
    input.value = result.displayName;
  });
}

function renderStopDraftList(stops) {
  const el = document.getElementById("stop-draft-list");
  if (!stops.length) {
    el.innerHTML = `<li style="color:var(--sage); list-style:none;">No stops added yet.</li>`;
    return;
  }
  el.innerHTML = stops
    .map(
      (s, i) => `
      <li class="stop-draft">
        <div class="idx">${i + 1}</div>
        <div class="info">
          <strong>${escapeHtml(s.name)}</strong>
          <span>${s.dayNumber ? "Day " + s.dayNumber + " · " : ""}${s.latitude.toFixed(3)}, ${s.longitude.toFixed(3)}</span>
        </div>
      </li>`
    )
    .join("");
}

const addedStops = [];

async function handleAddStop() {
  const name = document.getElementById("stop-name").value.trim();
  if (!name) { alert("Give this stop a name first."); return; }
  if (!pendingLatLng) { alert("Click the map to choose a location first."); return; }

  const payload = {
    name,
    latitude: pendingLatLng.lat,
    longitude: pendingLatLng.lng,
    description: document.getElementById("stop-description").value.trim(),
    stopOrder: stopCount + 1,
    dayNumber: document.getElementById("stop-day").value ? Number(document.getElementById("stop-day").value) : null,
  };

  try {
    const saved = await Api.addStop(currentTripId, payload);
    stopCount++;
    addedStops.push(saved);
    renderStopDraftList(addedStops);

    L.marker([saved.latitude, saved.longitude]).addTo(stopMap).bindPopup(`${stopCount}. ${escapeHtml(saved.name)}`);
    window.__clearPendingMarker();
    pendingLatLng = null;

    document.getElementById("stop-name").value = "";
    document.getElementById("stop-day").value = "";
    document.getElementById("stop-description").value = "";
    document.getElementById("add-stop-btn").disabled = true;
    document.getElementById("add-stop-btn").textContent = "Click the map first";
  } catch (err) {
    alert(err.message);
  }
}

async function handleStep1Submit(e) {
  e.preventDefault();
  const alertBox = document.getElementById("alert-box");

  const tagNames = document
    .getElementById("tags").value.split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const payload = {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    startLocation: document.getElementById("start-location").value.trim(),
    endLocation: document.getElementById("end-location").value.trim(),
    durationDays: document.getElementById("duration-days").value ? Number(document.getElementById("duration-days").value) : null,
    totalDistanceKm: document.getElementById("total-distance").value ? Number(document.getElementById("total-distance").value) : null,
    visibility: document.getElementById("visibility").value,
    tagNames,
  };

  try {
    const trip = currentTripId
      ? await Api.updateTrip(currentTripId, payload)
      : await Api.createTrip(payload);
    currentTripId = trip.id;
    document.getElementById("finish-btn").href = `trip-detail.html?id=${trip.id}`;
    showStep(2);
  } catch (err) {
    showAlert(alertBox, err.message, "error");
  }
}

async function prefillForEdit(tripId) {
  try {
    const trip = await Api.getTrip(tripId);
    document.getElementById("page-title").textContent = "Edit trip";
    document.getElementById("step1-submit").textContent = "Save changes →";
    document.getElementById("title").value = trip.title;
    document.getElementById("description").value = trip.description ?? "";
    document.getElementById("start-location").value = trip.startLocation ?? "";
    document.getElementById("end-location").value = trip.endLocation ?? "";
    document.getElementById("duration-days").value = trip.durationDays ?? "";
    document.getElementById("total-distance").value = trip.totalDistanceKm ?? "";
    document.getElementById("visibility").value = trip.visibility;
    document.getElementById("tags").value = (trip.tags || []).join(", ");
    currentTripId = trip.id;
    stopCount = trip.stops.length;
  } catch (err) {
    alert("Could not load this trip for editing: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!isLoggedIn()) {
    document.getElementById("guard").style.display = "block";
    document.getElementById("form-wrap").style.display = "none";
    return;
  }

  initStopMap();
  initPlaceSearch();
  initLocationFieldAutocomplete("start-location", "start-location-list");
  initLocationFieldAutocomplete("end-location", "end-location-list");
  if (window.lucide) lucide.createIcons();

  const editId = new URLSearchParams(window.location.search).get("edit");
  if (editId) prefillForEdit(editId);

  document.getElementById("trip-form").addEventListener("submit", handleStep1Submit);
  document.getElementById("add-stop-btn").addEventListener("click", handleAddStop);
  document.getElementById("back-btn").addEventListener("click", () => showStep(1));
});
