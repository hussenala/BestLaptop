const StoreAPI = (() => {
  const VERSION_KEY = "bestlaptop-store-version";
  let version = "0";
  let pollTimer;

  function applyStore(payload) {
    if (!payload) return;
    version = payload.version || version;
    localStorage.setItem(VERSION_KEY, version);
    if (typeof PRODUCTS !== "undefined" && payload.products) {
      PRODUCTS.splice(0, PRODUCTS.length, ...payload.products);
    }
    if (typeof CATEGORIES !== "undefined" && payload.categories) {
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
    const res = await fetch("/api/store", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load store");
    const data = await res.json();
    applyStore(data);
    return data;
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
        const res = await fetch("/api/health", { cache: "no-store" });
        if (!res.ok) return;
        const { version: next } = await res.json();
        if (next && next !== version) {
          await fetchStore();
          if (typeof renderFeatured === "function") renderFeatured();
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
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Order failed");
    localStorage.setItem(VERSION_KEY, String(Date.now()));
    await fetchStore();
    return data;
  }

  async function getOrder(id) {
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  }

  function notifyChange() {
    localStorage.setItem(VERSION_KEY, String(Date.now()));
  }

  window.addEventListener("storage", (e) => {
    if (e.key === VERSION_KEY && e.newValue !== version) fetchStore();
  });

  return { bootstrap, fetchStore, createOrder, getOrder, notifyChange, applyStore };
})();
