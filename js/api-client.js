const StoreAPI = (() => {
  const VERSION_KEY = "bestlaptop-store-version";
  const API_MODE_KEY = "bestlaptop-api-mode";
  let version = "0";
  let pollTimer;

  function siteRoot() {
    const el = document.querySelector("script[src*='api-client.js']");
    if (el?.src) return new URL("../", el.src).href;
    if (location.pathname.includes("/admin/")) return new URL("../", location.href.replace(/[^/]+$/, "")).href;
    return new URL("./", location.href.replace(/[^/]*$/, "")).href;
  }

  function apiUrl(path) {
    return new URL(String(path).replace(/^\//, ""), siteRoot()).href;
  }

  function phpApiUrl(path) {
    const route = String(path).replace(/^\/api/, "") || "/";
    return `${apiUrl("api/index.php")}?r=${encodeURIComponent(route)}`;
  }

  function looksJson(text) {
    const t = String(text || "").trim();
    return t.startsWith("{") || t.startsWith("[");
  }

  async function fetchApi(path, options = {}) {
    const mode = sessionStorage.getItem(API_MODE_KEY);
    const urls = mode === "php" ? [phpApiUrl(path), apiUrl(path)] : [apiUrl(path), phpApiUrl(path)];
    let lastMessage = "تعذر الاتصال بواجهة المتجر.";
    for (const url of urls) {
      try {
        const res = await fetch(url, options);
        const text = await res.text();
        if (!looksJson(text)) {
          lastMessage = "مسار /api غير متصل بقاعدة البيانات.";
          continue;
        }
        const body = JSON.parse(text);
        sessionStorage.setItem(API_MODE_KEY, url.includes("index.php") ? "php" : "node");
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
    if (typeof PRODUCTS !== "undefined" && payload.products?.length) {
      PRODUCTS.splice(0, PRODUCTS.length, ...payload.products);
    }
    if (typeof CATEGORIES !== "undefined" && payload.categories?.length) {
      CATEGORIES.splice(0, CATEGORIES.length, ...payload.categories);
    }
    if (typeof SLIDES !== "undefined" && payload.slides) {
      SLIDES.splice(0, SLIDES.length, ...payload.slides);
    }
    if (typeof PRODUCT_SLIDERS !== "undefined" && payload.productSliders) {
      PRODUCT_SLIDERS.splice(0, PRODUCT_SLIDERS.length, ...payload.productSliders);
    }
    if (typeof BRANDS !== "undefined" && payload.brands) {
      BRANDS.splice(0, BRANDS.length, ...payload.brands);
    }
    if (typeof STORE !== "undefined" && payload.store) {
      Object.assign(STORE, payload.store);
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
    pollTimer = setInterval(async () => {
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
    }, 8000);
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

  function notifyChange() {
    localStorage.setItem(VERSION_KEY, String(Date.now()));
  }

  window.addEventListener("storage", (e) => {
    if (e.key === VERSION_KEY && e.newValue !== version) fetchStore();
  });

  return { bootstrap, fetchStore, createOrder, getOrder, notifyChange, applyStore, apiUrl, fetchApi };
})();
