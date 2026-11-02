/* ==========================================================================
   THEME — three design themes (Explorer / Midnight / Forest), persisted in
   localStorage. The actual theme SWITCH happens instantly via a tiny inline
   script in each page's <head> (before CSS paints, to avoid a flash) - this
   file only renders the switcher UI and handles clicks afterward.
   ========================================================================== */
const THEMES = [
  { key: "explorer", label: "Explorer (light)", swatch: "swatch-explorer" },
  { key: "midnight", label: "Premium Midnight", swatch: "swatch-midnight" },
  { key: "forest", label: "Forest Escape", swatch: "swatch-forest" },
];

function getCurrentTheme() {
  return localStorage.getItem("waypoint_theme") || "explorer";
}

function setTheme(key) {
  document.documentElement.setAttribute("data-theme", key);
  localStorage.setItem("waypoint_theme", key);
  renderThemeSwitcher();
  // No tile-swapping needed: every map uses the same OpenStreetMap tiles,
  // and a pure-CSS filter on .leaflet-tile-pane (see style.css) recolors
  // them per theme automatically, the instant data-theme changes.
}

/**
 * Historical no-op, kept so existing call sites (browse.js, trip-detail.js,
 * create-trip.js) don't need changes. Map theming is handled entirely by
 * CSS now (see .leaflet-tile-pane in style.css).
 */
function registerThemedMap(_map, _layer) {}

function renderThemeSwitcher() {
  const slot = document.getElementById("theme-switcher-slot");
  if (!slot) return;
  const current = getCurrentTheme();

  slot.innerHTML = `
    <div class="theme-switcher">
      <button type="button" class="theme-btn" id="theme-btn">
        <svg data-lucide="palette"></svg>
        <span class="theme-btn-label">Theme</span>
      </button>
      <div class="theme-menu" id="theme-menu">
        ${THEMES.map(
          (t) => `
          <button type="button" class="theme-option ${t.key === current ? "active" : ""}" data-theme-key="${t.key}">
            <span class="theme-swatch ${t.swatch}"></span>${t.label}
          </button>`
        ).join("")}
      </div>
    </div>
  `;
  if (window.lucide) lucide.createIcons();

  const btn = document.getElementById("theme-btn");
  const menu = document.getElementById("theme-menu");
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });
  document.addEventListener("click", () => menu.classList.remove("open"));

  slot.querySelectorAll(".theme-option").forEach((opt) => {
    opt.addEventListener("click", () => setTheme(opt.dataset.themeKey));
  });
}

document.addEventListener("DOMContentLoaded", renderThemeSwitcher);
