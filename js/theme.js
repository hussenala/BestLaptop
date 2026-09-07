const THEME_KEY = "bestlaptop-theme";
const SEARCH_TOGGLE_ICON =
  '<svg class="search-toggle-ico search-ico-open" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 0 4.74 13.38l4.26 4.26 1.06-1.06-4.26-4.26A7.47 7.47 0 0 0 10.5 3m0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11"/></svg>';
const THEME_ICON_SUN =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5.2a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zm0-3.2h.8v3h-1.6V2H12zm0 16.8h.8v3h-1.6v-3H12zM2 11.2h3v1.6H2zm17 0h3v1.6h-3zM4.7 3.6l1.1-1.1 2.1 2.1-1.1 1.1zm11.4 11.4 2.1 2.1-1.1 1.1-2.1-2.1zm2.1-12.5 1.1 1.1-2.1 2.1-1.1-1.1zM6.8 15 8.9 17.1 7.8 18.2 5.7 16.1z"/></svg>';
const THEME_ICON_MOON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.2 3.1a8.8 8.8 0 1 0 7.7 13.4A7.2 7.2 0 0 1 13.2 3.1z"/></svg>';

function themeToggleIcon(theme) {
  return theme === "light" ? THEME_ICON_MOON : THEME_ICON_SUN;
}

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
    const nextLabel = isLight ? "داكن" : "فاتح";
    btn.setAttribute("aria-pressed", String(isLight));
    btn.setAttribute(
      "aria-label",
      isLight ? "التبديل إلى الوضع الداكن" : "التبديل إلى الوضع الفاتح"
    );
    if (btn.hasAttribute("data-theme-icon")) {
      btn.innerHTML = themeToggleIcon(theme);
      return;
    }
    const state = btn.querySelector("[data-theme-state]");
    const chip = btn.querySelector("[data-theme-chip]");
    const label = btn.querySelector("[data-theme-label]");
    if (state) state.textContent = isLight ? "الوضع الفاتح" : "الوضع الداكن";
    if (chip) chip.textContent = nextLabel;
    if (label) label.textContent = nextLabel;
    if (!state && !chip && !label) btn.textContent = nextLabel;
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-theme-toggle]")) {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  }
});

applyTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");
paintSearchToggleIcons();
