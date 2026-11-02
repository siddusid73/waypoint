/* Renders the login/logout area of the navbar. Runs on every page. */
function renderNavAuth() {
  const el = document.getElementById("nav-auth");
  if (!el) return;

  if (isLoggedIn()) {
    const user = getUser();
    el.innerHTML = `
      <span>Hi, ${escapeHtml(user?.name ?? "traveler")}</span>
      <a href="my-trips.html" class="btn btn-secondary btn-sm">My trips</a>
      <button id="logout-btn" class="btn btn-text btn-sm">Log out</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", () => {
      clearSession();
      window.location.href = "index.html";
    });
  } else {
    el.innerHTML = `
      <a href="login.html" class="btn btn-text btn-sm">Log in</a>
      <a href="register.html" class="btn btn-primary btn-sm">Sign up</a>
    `;
  }
}

/** Minimal HTML-escaping for any text we insert via innerHTML. */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Shows a message in an .alert box (error or success variant). */
function showAlert(el, message, type = "error") {
  el.textContent = message;
  el.className = "alert alert-" + type;
  el.style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavAuth();
  if (window.lucide) lucide.createIcons(); // paints any static data-lucide icons already in the HTML
});
