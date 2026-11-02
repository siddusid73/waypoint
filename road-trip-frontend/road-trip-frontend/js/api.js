/* ==========================================================================
   API — one place that knows how to talk to the Spring Boot backend.
   Change API_BASE if your backend runs on a different port.
   ========================================================================== */
const API_BASE = "http://localhost:8080/api";

/**
 * Wrapper around fetch() that:
 *  - prefixes the API base URL
 *  - attaches the JWT (if the user is logged in)
 *  - parses JSON responses
 *  - throws a readable Error on failure, with the backend's message if present
 */
async function apiFetch(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (!token) throw new Error("You need to be logged in to do that.");
    headers["Authorization"] = "Bearer " + token;
  }

  let response;
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(
      "Could not reach the backend at " + API_BASE +
      ". Is the Spring Boot app running?"
    );
  }

  if (response.status === 204) return null; // No Content (e.g. DELETE)

  let data = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!response.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

const Api = {
  // ---- Auth ----
  register: (payload) => apiFetch("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiFetch("/auth/login", { method: "POST", body: payload }),

  // ---- Trips ----
  browseTrips: (params = {}) => {
    const q = new URLSearchParams();
    if (params.keyword) q.set("keyword", params.keyword);
    if (params.tag) q.set("tag", params.tag);
    q.set("page", params.page ?? 0);
    q.set("size", params.size ?? 12);
    return apiFetch("/trips?" + q.toString());
  },
  myTrips: () => apiFetch("/trips/my", { auth: true }),
  getTrip: (id) => apiFetch(`/trips/${id}`),
  createTrip: (payload) => apiFetch("/trips", { method: "POST", body: payload, auth: true }),
  updateTrip: (id, payload) => apiFetch(`/trips/${id}`, { method: "PUT", body: payload, auth: true }),
  deleteTrip: (id) => apiFetch(`/trips/${id}`, { method: "DELETE", auth: true }),

  // ---- Stops ----
  addStop: (tripId, payload) => apiFetch(`/trips/${tripId}/stops`, { method: "POST", body: payload, auth: true }),

  // ---- Comments ----
  listComments: (tripId) => apiFetch(`/trips/${tripId}/comments`),
  addComment: (tripId, payload) => apiFetch(`/trips/${tripId}/comments`, { method: "POST", body: payload, auth: true }),

  // ---- Ratings ----
  rateTrip: (tripId, score) => apiFetch(`/trips/${tripId}/ratings`, { method: "POST", body: { score }, auth: true }),

  // ---- Tags ----
  listTags: () => apiFetch("/tags"),
};

// ---- Token storage (localStorage, per-browser) ----
function getToken() { return localStorage.getItem("waypoint_token"); }
function getUser() {
  const raw = localStorage.getItem("waypoint_user");
  return raw ? JSON.parse(raw) : null;
}
function setSession(token, user) {
  localStorage.setItem("waypoint_token", token);
  localStorage.setItem("waypoint_user", JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem("waypoint_token");
  localStorage.removeItem("waypoint_user");
}
function isLoggedIn() { return !!getToken(); }
