const THEME_KEY = "bestlaptop-theme";

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
