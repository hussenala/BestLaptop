const StoreAPI = (() => {
  const VERSION_KEY = "bestlaptop-store-version";
  const API_MODE_KEY = "bestlaptop-api-mode";
  let version = "0";
  let pollTimer;
  let storeReady = false;

  function isLocalDev() {
    const h = location.hostname;
    return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  }

  function isProductionHost() {
    return !isLocalDev();
  }

  function siteRoot() {
    const el = document.querySelector("script[src*='api-client.js']");
    if (el?.src) return new URL("../", el.src).href;
    if (/^\/admin(\/|$)/.test(location.pathname)) {
      return new URL("../", location.origin + location.pathname.replace(/[^/]+$/, "")).href;
    }
    return new URL("./", location.href.replace(/[^/]*$/, "")).href;
  }

  function apiUrl(path) {
    return new URL(String(path).replace(/^\//, ""), siteRoot()).href;
  }

  function phpApiUrl(path) {
    const route = String(path).replace(/^\/api/, "") || "/";
    const url = new URL(apiUrl("api/index.php"));
    url.searchParams.set("r", route);
    url.searchParams.set("_", String(Date.now()));
    return url.href;
  }

  function withCacheBust(url) {
    const next = new URL(url, location.href);
    next.searchParams.set("_", String(Date.now()));
    return next.href;
  }

  function formatApiError(body, fallback) {
    if (!body?.error) return fallback;
    return body.path ? `${body.error} (${body.path})` : body.error;
  }

  function looksJson(text) {
    const t = String(text || "").trim();
    return t.startsWith("{") || t.startsWith("[");
  }

  async function fetchApi(path, options = {}) {
    if (isProductionHost()) sessionStorage.setItem(API_MODE_KEY, "php");
    const mode = sessionStorage.getItem(API_MODE_KEY);
    const preferPhp = isProductionHost() || mode === "php";
    const urls = preferPhp ? [phpApiUrl(path), apiUrl(path)] : [apiUrl(path), phpApiUrl(path)];
    let lastMessage = "تعذر الاتصال بواجهة المتجر.";
    for (const url of urls) {
      try {
        const res = await fetch(withCacheBust(url), { ...options, cache: "no-store" });
        const text = await res.text();
        if (!looksJson(text)) {
          lastMessage =
            "مسار /api غير متصل. على Hostinger: أوقف Node.js إن كان مفعّلاً، وفعّل PDO SQLite، وارفع api/index.php و .htaccess.";
          continue;
        }
        const body = JSON.parse(text);
        sessionStorage.setItem(API_MODE_KEY, url.includes("index.php") ? "php" : preferPhp ? "php" : "node");
        if (!res.ok) {
          lastMessage = formatApiError(body, lastMessage);
          if (body.error === "API route not found" && url !== urls[urls.length - 1]) continue;
        }
        return { res, body };
      } catch (err) {
        lastMessage = err.message || lastMessage;
      }
    }
    throw new Error(lastMessage);
  }

  function applyStore(payload) {
    if (!payload) return;
    version = payload.version || version;
    localStorage.setItem(VERSION_KEY, version);
    storeReady = true;
    if (typeof PRODUCTS !== "undefined" && Array.isArray(payload.products)) {
      PRODUCTS.splice(0, PRODUCTS.length, ...payload.products);
    }
    if (typeof CATEGORIES !== "undefined" && Array.isArray(payload.categories)) {
      CATEGORIES.splice(0, CATEGORIES.length, ...payload.categories);
    }
    if (typeof SLIDES !== "undefined" && Array.isArray(payload.slides)) {
      SLIDES.splice(0, SLIDES.length, ...payload.slides);
    }
    if (typeof PRODUCT_SLIDERS !== "undefined" && Array.isArray(payload.productSliders)) {
      PRODUCT_SLIDERS.splice(0, PRODUCT_SLIDERS.length, ...payload.productSliders);
    }
    if (typeof BRANDS !== "undefined" && Array.isArray(payload.brands)) {
      BRANDS.splice(0, BRANDS.length, ...payload.brands);
    }
    if (typeof STORE !== "undefined" && payload.store) {
      const next = { ...payload.store };
      if (!next.cities?.length && STORE.cities?.length) next.cities = STORE.cities;
      if (!next.shipping?.length && STORE.shipping?.length) next.shipping = STORE.shipping;
      if (!next.payments?.length && STORE.payments?.length) next.payments = STORE.payments;
      Object.assign(STORE, next);
    }
    if (typeof STORE !== "undefined" && payload.settings?.officeGallery) {
      STORE.officeGallery = payload.settings.officeGallery;
    }
    window.dispatchEvent(new CustomEvent("store:updated", { detail: payload }));
  }

  async function fetchStore() {
    const { res, body } = await fetchApi("/api/store", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load store");
    applyStore(body);
    return body;
  }

  async function bootstrap() {
    const data = await fetchStore();
    startPolling();
    return data;
  }

  function startPolling() {
    clearInterval(pollTimer);
    pollTimer = setInterval(checkForUpdates, 5000);
  }

  async function checkForUpdates() {
    try {
      const { res, body } = await fetchApi("/api/health", { cache: "no-store" });
      if (!res.ok) return;
      const next = body.version;
      if (next && next !== version) {
        await fetchStore();
        if (typeof renderFeatured === "function") renderFeatured();
        if (typeof renderOfficeGallery === "function") renderOfficeGallery();
        if (typeof renderHeaderBrands === "function") renderHeaderBrands();
        if (typeof renderShopFilters === "function") renderShopFilters();
        if (typeof renderCatalog === "function") renderCatalog();
        if (typeof renderProductPage === "function") renderProductPage();
        if (typeof renderSlider === "function") renderSlider();
        if (typeof renderCategoryFilter === "function") renderCategoryFilter();
      }
    } catch {
      /* offline */
    }
  }

  async function createOrder(order) {
    const { res, body } = await fetchApi("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(body.error || "Order failed");
    localStorage.setItem(VERSION_KEY, String(Date.now()));
    await fetchStore();
    return body;
  }

  async function getOrder(id) {
    const { res, body } = await fetchApi(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return body;
  }

  function notifyChange(nextVersion) {
    const v = nextVersion ? String(nextVersion) : String(Date.now());
    localStorage.setItem(VERSION_KEY, v);
    if (nextVersion) version = v;
  }

  window.addEventListener("storage", (e) => {
    if (e.key === VERSION_KEY && e.newValue !== version) fetchStore();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && storeReady) checkForUpdates();
  });

  return { bootstrap, fetchStore, createOrder, getOrder, notifyChange, applyStore, apiUrl, fetchApi, isStoreReady: () => storeReady };
})();
