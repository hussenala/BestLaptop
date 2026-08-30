const SitePages = (() => {
  const BRAND = "BEST LAPTOP";

  const PAGES = {
    home: { path: "/", file: "index.html", title: "الرئيسية", label: "الرئيسية" },
    products: { path: "/products", file: "products.html", title: "المنتجات", label: "المنتجات" },
    contact: { path: "/contact", file: "contact.html", title: "التواصل", label: "التواصل" },
    cart: { path: "/cart", file: "cart.html", title: "السلة", label: "السلة" },
    checkout: { path: "/checkout", file: "checkout.html", title: "إتمام الطلب", label: "إتمام الطلب" },
    order: { path: "/order", file: "order.html", title: "تأكيد الطلب", label: "تأكيد الطلب" },
    product: { path: "/product", file: "product.html", title: "المنتج", label: "المنتج" },
  };

  const MAIN_NAV = ["home", "products", "contact"];

  function pathKey(pathname) {
    const path = (pathname || "/").replace(/\/+$/, "") || "/";
    if (path === "/" || path.endsWith("/index.html")) return "home";
    const found = Object.keys(PAGES).find((key) => {
      const pagePath = PAGES[key].path.replace(/\/+$/, "") || "/";
      if (pagePath === path) return true;
      if (key === "product" && /^\/product\/[^/]+/.test(path)) return true;
      return path.endsWith(`/${PAGES[key].file}`);
    });
    return found || "home";
  }

  function currentKey() {
    const fromBody = document.body?.dataset?.page;
    if (fromBody && PAGES[fromBody]) return fromBody;
    return pathKey(location.pathname);
  }

  function label(key) {
    return PAGES[key]?.label || key;
  }

  function href(key, query = {}) {
    const page = PAGES[key] || PAGES.home;
    const url = new URL(page.path, location.origin);
    Object.entries(query || {}).forEach(([k, v]) => {
      if (v != null && v !== "") url.searchParams.set(k, String(v));
    });
    return `${url.pathname}${url.search}`;
  }

  function productUrl(id) {
    if (!id) return href("products");
    return `/product/${encodeURIComponent(id)}`;
  }

  function productIdFromLocation(loc = location) {
    const match = loc.pathname.match(/\/product\/([^/]+)\/?$/);
    if (match) return decodeURIComponent(match[1]);
    return new URLSearchParams(loc.search).get("id");
  }

  function documentTitle(key, extra) {
    const page = PAGES[key] || PAGES.home;
    const name = extra || page.title;
    return `${name} | ${BRAND}`;
  }

  function paintLinks() {
    const here = currentKey();

    document.querySelectorAll("[data-page-link]").forEach((el) => {
      const key = el.getAttribute("data-page-link");
      const page = PAGES[key];
      if (!page) return;
      el.textContent = page.label;
      el.setAttribute("href", page.path);
      const isActive = key === here;
      if (el.closest(".nav-links")) el.classList.toggle("active", isActive);
    });

    document.querySelectorAll(".nav-links li").forEach((li) => {
      const link = li.querySelector("a[data-page-link]");
      if (!link) return;
      li.classList.toggle("active", link.getAttribute("data-page-link") === here);
    });
  }

  function applyPageMeta(extraTitle) {
    const key = currentKey();
    const title = documentTitle(key, extraTitle);
    const titleEl = document.querySelector("title[data-page-title]") || document.querySelector("title");
    if (titleEl) titleEl.textContent = title;
    else document.title = title;
    paintLinks();
  }

  function init(extraTitle) {
    applyPageMeta(extraTitle);
  }

  return {
    BRAND,
    PAGES,
    MAIN_NAV,
    pathKey,
    currentKey,
    label,
    href,
    productUrl,
    productIdFromLocation,
    documentTitle,
    paintLinks,
    applyPageMeta,
    init,
  };
})();
