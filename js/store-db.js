const StoreDB = (() => {
  const TOKEN_KEY = "bestlaptop-admin-token";
  const USER_KEY = "bestlaptop-admin-user";
  const ORDER_KEY = "bestlaptop-last-order";

  const ORDER_STATUSES = [
    { id: "new", label: "جديد" },
    { id: "confirming", label: "قيد التأكيد" },
    { id: "preparing", label: "قيد التجهيز" },
    { id: "ready", label: "جاهز للتسليم" },
    { id: "done", label: "مكتمل" },
    { id: "canceled", label: "ملغي" },
  ];

  let cache = null;

  function migrateAuthStorage() {
    try {
      const t = sessionStorage.getItem(TOKEN_KEY);
      const u = sessionStorage.getItem(USER_KEY);
      if (t && !localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(TOKEN_KEY, t);
        if (u) localStorage.setItem(USER_KEY, u);
      }
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }
  migrateAuthStorage();

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function authHeaders(json = true) {
    const h = {};
    if (json) h["Content-Type"] = "application/json";
    const t = token();
    if (t) h.Authorization = `Bearer ${t}`;
    return h;
  }

  async function api(path, options = {}) {
    const { res, body } = await StoreAPI.fetchApi(path, {
      ...options,
      headers: { ...authHeaders(options.body != null), ...(options.headers || {}) },
    });
    if (res.status === 401) {
      logout();
      if (location.pathname.includes("/admin/") && !location.pathname.includes("login")) {
        location.replace("login.html");
      }
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      const msg = body.detail
        ? `${body.error || "Request failed"}: ${body.detail}`
        : body.path
          ? `${body.error || "Request failed"} (${body.path})`
          : body.error || "Request failed";
      throw new Error(msg);
    }
    return body;
  }

  async function refresh() {
    cache = await api("/api/admin/state");
    syncGlobals();
    if (typeof StoreAPI.publishStorefront === "function") {
      StoreAPI.publishStorefront(cache?.version);
    } else {
      StoreAPI.notifyChange(cache?.version);
    }
    return cache;
  }

  function syncGlobals() {
    if (!cache) return;
    if (typeof PRODUCTS !== "undefined") PRODUCTS.splice(0, PRODUCTS.length, ...cache.products);
    if (typeof CATEGORIES !== "undefined") CATEGORIES.splice(0, CATEGORIES.length, ...cache.categories);
    if (typeof BRANDS !== "undefined" && cache.brands) BRANDS.splice(0, BRANDS.length, ...cache.brands);
    if (typeof SLIDES !== "undefined" && cache.slides) SLIDES.splice(0, SLIDES.length, ...cache.slides);
    if (typeof PRODUCT_SLIDERS !== "undefined" && cache.productSliders) {
      PRODUCT_SLIDERS.splice(0, PRODUCT_SLIDERS.length, ...cache.productSliders);
    }
    if (typeof STORE !== "undefined" && cache.settings) {
      Object.assign(STORE, {
        name: cache.settings.name || STORE.name,
        nameAr: cache.settings.nameAr || STORE.nameAr,
        logo: cache.settings.logo || STORE.logo,
        notice: cache.settings.notice || "",
        featured: cache.settings.featured || STORE.featured,
        officeGallery: cache.settings.officeGallery || STORE.officeGallery,
        homeLayout: cache.settings.homeLayout ?? null,
        cartEnabled: cache.settings.cartEnabled !== false,
        hideAllProducts: !!cache.settings.hideAllProducts,
        productsHiddenMessage: cache.settings.productsHiddenMessage || "",
        city: cache.settings.city,
        address: cache.settings.address,
        fullAddress: cache.settings.fullAddress,
        phone: cache.settings.phone,
        whatsapp: cache.settings.whatsapp || cache.settings.phone,
        email: cache.settings.email,
        hours: cache.settings.hours,
        warranty: cache.settings.warranty,
        currency: cache.settings.currency || "IQD",
        cities: cache.settings.cities || [],
        shipping: cache.settings.shipping || [],
        payments: cache.settings.payments || [],
      });
    }
  }

  function load() {
    return cache;
  }

  async function login(username, password) {
    let res;
    let body = {};
    try {
      ({ res, body } = await StoreAPI.fetchApi("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: String(username || "").trim(), password }),
      }));
    } catch (err) {
      throw new Error(err.message || "تعذر الاتصال بالخادم. تحقق من PHP و api/index.php على الاستضافة.");
    }
    if (!res.ok) {
      const msg = body.path ? `${body.error || "Request failed"} (${body.path})` : body.error || "Login failed";
      if (body.error === "Invalid credentials") throw new Error("Invalid credentials");
      if (body.error === "Database unavailable") throw new Error("قاعدة البيانات غير متصلة على السيرفر.");
      if (body.error === "Admin accounts missing") throw new Error("لا يوجد حساب أدمن في قاعدة البيانات.");
      throw new Error(msg);
    }
    localStorage.setItem(TOKEN_KEY, body.token);
    localStorage.setItem(USER_KEY, JSON.stringify(body.user));
    await refresh();
    return body.user;
  }

  function session() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  async function verifySession() {
    if (!token()) return null;
    try {
      const { res, body } = await StoreAPI.fetchApi("/api/auth/me", {
        headers: authHeaders(false),
        cache: "no-store",
      });
      if (!res.ok || !body?.user) {
        logout();
        return null;
      }
      localStorage.setItem(USER_KEY, JSON.stringify(body.user));
      return body.user;
    } catch {
      return session();
    }
  }

  function logout() {
    const t = token();
    if (t) StoreAPI.fetchApi("/api/auth/logout", { method: "POST", headers: authHeaders(false) }).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    cache = null;
  }

  function can(role, page) {
    if (role === "admin") return true;
    return !["settings", "users"].includes(page);
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}`;
  }

  function normalizeImagePath(src) {
    const raw = String(src || "").trim();
    if (!raw) return "";
    if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    if (raw.startsWith("/")) return raw;
    return `/${raw.replace(/^\.?\//, "")}`;
  }

  function normalizeProductImages(item) {
    const raw =
      Array.isArray(item?.images) && item.images.length
        ? item.images.filter(Boolean)
        : item?.image
          ? [item.image]
          : [];
    const seen = new Set();
    const images = raw
      .map((src) => normalizeImagePath(src))
      .filter((src) => {
        if (!src || seen.has(src)) return false;
        seen.add(src);
        return true;
      });
    const cover = normalizeImagePath(item?.image || "");
    if (cover && images.length > 1) {
      const idx = images.indexOf(cover);
      if (idx < 0) images.unshift(cover);
      else if (idx > 0) {
        images.splice(idx, 1);
        images.unshift(cover);
      }
    }
    return images;
  }

  async function ensureProductConditionSupport() {
    if (typeof StoreAPI?.fetchApi !== "function") return;
    const { res, body } = await StoreAPI.fetchApi("/api/health", { cache: "no-store" });
    if (!res.ok) throw new Error("تعذر التحقق من السيرفر");
    const ready = body.productConditionReady || (body.features || []).includes("productCondition");
    const build = Number(body.build || 0);
    if (!ready || build < 101) {
      throw new Error(
        "حالة المنتج غير مدعومة على السيرفر (build " +
          (build || "?") +
          "). ارفع api/index.php و js/app.js و js/product-condition.js ثم امسح كاش LiteSpeed."
      );
    }
  }

  async function saveProduct(item) {
    const images = normalizeProductImages(item);
    const payload = {
      ...item,
      images,
      image: images[0] || "",
      condition: normalizeProductCondition(item.condition ?? item.productCondition ?? "new"),
    };
    let conditionReady = true;
    try {
      await ensureProductConditionSupport();
    } catch {
      conditionReady = false;
    }
    const saved = cache?.products?.some((p) => p.id === item.id)
      ? await api(`/api/admin/products/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(payload) })
      : await api("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
    if (conditionReady) {
      if (!saved || !("condition" in saved)) {
        throw new Error("السيرفر لم يحفظ حالة المنتج — ارفع api/index.php المحدّث على الاستضافة");
      }
      if (normalizeProductCondition(saved.condition) !== payload.condition) {
        throw new Error("حالة المنتج لم تُحفظ بشكل صحيح — ارفع api/index.php المحدّث");
      }
    }
    await refresh();
    if (typeof StoreAPI.publishStorefront === "function") {
      StoreAPI.publishStorefront(cache?.version);
    }
    return saved;
  }

  async function deleteProduct(id) {
    await api(`/api/admin/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function saveCategory(item) {
    if (cache?.categories?.some((c) => c.id === item.id)) {
      await api(`/api/admin/categories/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(item) });
    } else {
      await api("/api/admin/categories", { method: "POST", body: JSON.stringify(item) });
    }
    await refresh();
  }

  async function deleteCategory(id) {
    await api(`/api/admin/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function saveBrand(item) {
    if (cache?.brands?.some((b) => b.id === item.id)) {
      await api(`/api/admin/brands/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(item) });
    } else {
      await api("/api/admin/brands", { method: "POST", body: JSON.stringify(item) });
    }
    await refresh();
  }

  async function deleteBrand(id) {
    await api(`/api/admin/brands/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function saveCoupon(item) {
    if (cache?.coupons?.some((c) => c.id === item.id)) {
      await api(`/api/admin/coupons/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(item) });
    } else {
      await api("/api/admin/coupons", { method: "POST", body: JSON.stringify(item) });
    }
    await refresh();
  }

  async function deleteCoupon(id) {
    await api(`/api/admin/coupons/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function saveSlide(item) {
    if (cache?.slides?.some((s) => s.id === item.id)) {
      await api(`/api/admin/slides/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(item) });
    } else {
      await api("/api/admin/slides", { method: "POST", body: JSON.stringify(item) });
    }
    await refresh();
  }

  async function deleteSlide(id) {
    await api(`/api/admin/slides/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function reorderSlides(ids) {
    await api("/api/admin/slides/reorder", { method: "PATCH", body: JSON.stringify({ ids }) });
    await refresh();
  }

  async function saveProductSlider(item) {
    if (cache?.productSliders?.some((s) => s.id === item.id)) {
      await api(`/api/admin/product-sliders/${encodeURIComponent(item.id)}`, { method: "PUT", body: JSON.stringify(item) });
    } else {
      await api("/api/admin/product-sliders", { method: "POST", body: JSON.stringify(item) });
    }
    await refresh();
  }

  async function deleteProductSlider(id) {
    await api(`/api/admin/product-sliders/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function reorderProductSliders(ids) {
    await api("/api/admin/product-sliders/reorder", { method: "PATCH", body: JSON.stringify({ ids }) });
    await refresh();
  }

  async function updateOrderStatus(id, status) {
    await api(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
    await refresh();
  }

  async function deleteOrder(id) {
    await api(`/api/admin/orders/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  async function uploadImage(dataUrl, folder = "products") {
    const data = await api("/api/admin/upload", {
      method: "POST",
      body: JSON.stringify({ data: dataUrl, folder }),
    });
    return normalizeImagePath(data.url);
  }

  async function updateStock(id, stock) {
    await api("/api/admin/inventory", { method: "PATCH", body: JSON.stringify({ id, stock }) });
    await refresh();
  }

  async function saveSettings(settings) {
    await api("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
    await refresh();
  }

  async function saveOfficeGallery(officeGallery) {
    await api("/api/admin/office-gallery", { method: "PATCH", body: JSON.stringify(officeGallery) });
    await refresh();
  }

  async function createUser(user) {
    await api("/api/admin/users", { method: "POST", body: JSON.stringify(user) });
    await refresh();
  }

  async function updateUser(id, user) {
    const updated = await api(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
    const current = session();
    if (current?.id === id) {
      localStorage.setItem(USER_KEY, JSON.stringify({ ...current, ...updated }));
    }
    await refresh();
    return updated;
  }

  async function deleteUser(id) {
    await api(`/api/admin/users/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refresh();
  }

  return {
    ORDER_STATUSES,
    refresh,
    load,
    login,
    verifySession,
    session,
    logout,
    can,
    uid,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveBrand,
    deleteBrand,
    saveCoupon,
    deleteCoupon,
    saveSlide,
    deleteSlide,
    reorderSlides,
    saveProductSlider,
    deleteProductSlider,
    reorderProductSliders,
    updateOrderStatus,
    deleteOrder,
    updateStock,
    saveSettings,
    saveOfficeGallery,
    createUser,
    updateUser,
    deleteUser,
    uploadImage,
    ORDER_KEY,
  };
})();
