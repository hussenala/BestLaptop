const THEME_KEY = "bestlaptop-theme";
const SEARCH_TOGGLE_ICON =
  '<svg class="search-toggle-ico search-ico-open" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 0 4.74 13.38l4.26 4.26 1.06-1.06-4.26-4.26A7.47 7.47 0 0 0 10.5 3m0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11"/></svg>';

function paintSearchToggleIcons() {
  document.querySelectorAll("[data-search-toggle]").forEach((btn) => {
    if (!btn.querySelector(".search-ico-open")) {
      btn.innerHTML = `${SEARCH_TOGGLE_ICON}<span class="search-label" hidden>بحث</span>`;
    }
    btn.classList.add("has-icons");
    if (!btn.getAttribute("aria-expanded")) btn.setAttribute("aria-expanded", "false");
    if (!btn.getAttribute("aria-label") || btn.getAttribute("aria-label") === "بحث") {
      btn.setAttribute("aria-label", "فتح البحث");
    }
  });
}

function currentTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    const isLight = theme === "light";
    btn.setAttribute("aria-pressed", String(isLight));
    btn.textContent = isLight ? "داكن" : "فاتح";
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-theme-toggle]")) {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  }
});

applyTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
paintSearchToggleIcons();
