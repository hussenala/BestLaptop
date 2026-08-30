const CART_KEY = "bestlaptop-cart";
const SHIP_KEY = "bestlaptop-ship";
const ORDER_KEY = "bestlaptop-last-order";
const ARABIZATION_FEE = 10000;

const ICONS = {
  minus:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 12.75v-1.5h14v1.5z"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11.25 5h1.5v14h-1.5zM5 11.25h14v1.5H5z"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.2 4.5h5.6l.7 1.2H20v1.6H4V5.7h4.5zm1.1 4.2h1.6V18h-1.6zm3.8 0h1.6V18h-1.6zM7.3 8.7h1.6V18H7.3z"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 8.6-8.6 1.4 1.4z"/></svg>',
  bag: '<svg class="cart-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 8V7a5 5 0 0 1 10 0v1h3v13H4V8zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
  truck:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6h11v10H3zm12 3h4l3 4v3h-7zm-9 9.5A1.5 1.5 0 1 0 7.5 18 1.5 1.5 0 0 0 6 18.5zm11 0A1.5 1.5 0 1 0 18.5 18 1.5 1.5 0 0 0 17 18.5z"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6h18v12H3zm2 4h14V8H5z"/></svg>',
  whatsapp:
    '<svg class="wa-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24m4.52 10.4c-.25-.12-1.47-.72-1.7-.8-.22-.09-.39-.12-.55.13-.16.24-.64.79-.78.95-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.24-.02-.37.11-.49.11-.11.25-.29.37-.43.12-.14.16-.24.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.24-.86.84-.86 2.05s.88 2.37 1 2.54c.12.16 1.75 2.67 4.24 3.74 2.49 1.07 2.49.71 2.94.67.45-.04 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29"/></svg>',
  searchEmpty:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 4a6 6 0 1 0 3.8 10.7L19 19.6 20.4 18l-5.2-5.2A6 6 0 0 0 10 4m0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8M4 20h16v2H4z"/></svg>',
  search:
    '<svg class="search-toggle-ico search-ico-open" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3a7.5 7.5 0 1 0 4.74 13.38l4.26 4.26 1.06-1.06-4.26-4.26A7.47 7.47 0 0 0 10.5 3m0 2a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11"/></svg>',
  close:
    '<svg class="search-close-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z"/></svg>',
};

function isMaintenanceMode() {
  return Boolean(STORE?.maintenanceMode);
}

function formatPhoneDisplay(phone) {
  const digits = phoneDigits(phone);
  if (digits.length === 11 && digits.startsWith("07")) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10 && digits.startsWith("7")) {
    return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return String(phone || "").trim();
}

function maintenancePageMarkup({ brand, logo, message, phone, email, hours }) {
  const phoneDisplay = phone ? formatPhoneDisplay(phone) : "";
  const tel = phone ? phoneDigits(phone) : "";
  return `
    <div class="maintenance-bg" aria-hidden="true">
      <span class="maintenance-orb maintenance-orb-a"></span>
      <span class="maintenance-orb maintenance-orb-b"></span>
      <span class="maintenance-grid"></span>
    </div>
    <main class="maintenance-shell">
      <div class="maintenance-status">
        <span class="maintenance-pulse" aria-hidden="true"></span>
        صيانة مؤقتة
      </div>
      <div class="maintenance-brand">
        <img src="${logo}" alt="${brand}" class="maintenance-logo" />
        <p class="maintenance-name">${brand}</p>
      </div>
      <h1>الموقع تحت الصيانة مؤقتاً</h1>
      <p class="maintenance-message">${message}</p>
      ${
        phone || email
          ? `<div class="maintenance-actions">
        ${
          phone
            ? `<a class="maintenance-cta" href="tel:${tel}">
          <span class="maintenance-cta-icon" aria-hidden="true">📞</span>
          <span class="maintenance-cta-copy">
            <small>اتصل بنا</small>
            <strong class="maintenance-phone" dir="ltr">${phoneDisplay}</strong>
          </span>
        </a>`
            : ""
        }
        ${email ? `<a class="maintenance-link" href="mailto:${email}">${email}</a>` : ""}
      </div>`
          : ""
      }
      ${hours ? `<p class="maintenance-hours">${hours}</p>` : ""}
    </main>`;
}

function renderMaintenancePage() {
  const message = (STORE.maintenanceMessage || "").trim() || "نعمل على تحسين تجربتكم. سنعود قريباً.";
  const phone = STORE.phone || STORE.whatsapp || "";
  const brand = STORE.nameAr || STORE.name || "BEST LAPTOP";
  const logo = resolveAsset(STORE.logo || "/img/logo.jpg");
  document.documentElement.dataset.page = "maintenance";
  document.title = `تحت الصيانة | ${brand}`;
  document.body.className = "maintenance-body";
  document.body.innerHTML = maintenancePageMarkup({
    brand,
    logo,
    message,
    phone,
    email: STORE.email || "",
    hours: STORE.hours || "",
  });
}

function money(n) {
  const value = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  return `${value} IQD`;
}

function productIdFromUrl() {
  const pathMatch = location.pathname.match(/\/product\/([^/]+)\/?$/i);
  if (pathMatch) return decodeURIComponent(pathMatch[1]);
  const fromRoutes = window.SitePages?.productIdFromLocation?.();
  if (fromRoutes) return fromRoutes;
  if (typeof SitePages !== "undefined" && SitePages.productIdFromLocation) {
    return SitePages.productIdFromLocation();
  }
  return new URLSearchParams(location.search).get("id");
}

function resolveAsset(src) {
  if (!src) return "/img/logo.jpg";
  if (typeof src === "object") src = src.src || src.url || "";
  if (!src) return "/img/logo.jpg";
  if (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  return `/${String(src).replace(/^\.?\//, "")}`;
}

function galleryImageSrc(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.src || value.url || "";
  return "";
}

function storeHref(key, query) {
  return typeof SitePages !== "undefined" ? SitePages.href(key, query) : `${key}.html`;
}

function productUrl(id) {
  return typeof SitePages !== "undefined" ? SitePages.productUrl(id) : `product.html?id=${encodeURIComponent(id)}`;
}

function youtubeIdFromUrl(url) {
  if (!url || typeof url !== "string") return "";
  const raw = url.trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") return (u.pathname.split("/").filter(Boolean)[0] || "").split("?")[0];
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || "";
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || "";
      if (u.pathname.startsWith("/live/")) return u.pathname.split("/")[2] || "";
      return u.searchParams.get("v") || "";
    }
  } catch {
    /* not a valid URL */
  }
  return "";
}

function youtubeBackgroundEmbedUrl(id, { autoplay = true } = {}) {
  const q = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: "1",
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
    loop: "1",
    playlist: id,
    iv_load_policy: "3",
    disablekb: "1",
    fs: "0",
    cc_load_policy: "0",
    showinfo: "0",
    enablejsapi: "1",
  });
  try {
    if (typeof location !== "undefined" && location.origin && location.origin !== "null") {
      q.set("origin", location.origin);
    }
  } catch {
    /* ignore */
  }
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${q.toString()}`;
}

function heroMediaPanelHtml(videoUrl, imageUrl) {
  const yt = youtubeIdFromUrl(videoUrl);
  if (yt) {
    const src = youtubeBackgroundEmbedUrl(yt, { autoplay: false });
    const poster = imageUrl ? resolveAsset(imageUrl) : "";
    const posterStyle = poster ? ` style="--yt-poster:url('${poster}')"` : "";
    return `<div class="slider-panel slider-panel-video slider-panel-youtube"${posterStyle} data-yt-id="${yt}"><iframe data-yt-src="${src}" title="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="eager" tabindex="-1"></iframe><div class="yt-poster" aria-hidden="true"></div><div class="yt-chrome-mask" aria-hidden="true"></div></div>`;
  }
  if (videoUrl) {
    return `<div class="slider-panel slider-panel-video"><video src="${resolveAsset(videoUrl)}" muted playsinline loop preload="metadata"></video></div>`;
  }
  return `<div class="slider-panel" style="background-image:url('${resolveAsset(imageUrl)}')"></div>`;
}

function youtubeCommand(iframe, func, args = []) {
  if (!iframe?.contentWindow) return;
  const payload = JSON.stringify({ event: "command", func, args });
  try {
    iframe.contentWindow.postMessage(payload, "https://www.youtube-nocookie.com");
    iframe.contentWindow.postMessage(payload, "https://www.youtube.com");
  } catch {
    /* cross-origin guarded */
  }
}

function ensureYoutubeFrame(iframe, ytId, shouldPlay) {
  if (!iframe || !ytId) return;
  const want = youtubeBackgroundEmbedUrl(ytId, { autoplay: shouldPlay });
  iframe.dataset.ytSrc = want;
  const current = iframe.getAttribute("src") || "";
  // حمّل الإطار فقط عند الحاجة (أول تشغيل) حتى يشتغل autoplay
  if (!current && shouldPlay) {
    iframe.setAttribute("src", want);
  }
}

function phoneDigits(phone) {
  return (phone || "").replace(/\D/g, "");
}

function storeWhatsAppNumber() {
  let digits = phoneDigits(STORE.whatsapp || STORE.phone);
  if (digits.startsWith("0")) digits = `964${digits.slice(1)}`;
  else if (digits.length === 10) digits = `964${digits}`;
  return digits;
}

function buildOrderWhatsAppMessage(order) {
  const items = (order.items || [])
    .map((i, n) => {
      const ar = i.arabization ? " (مع تعريب كيبورد)" : "";
      const lineTotal = (i.price || 0) * (i.qty || 1);
      return `${n + 1}. ${i.name}${ar}\n   الكمية: ${i.qty} × ${money(i.price)} = ${money(lineTotal)}\n   ${i.cpu || ""} · ${i.gpu || ""} · ${i.ram || ""} · ${i.storage || ""}`.trim();
    })
    .join("\n\n");

  return [
    "🛒 *طلب جديد — BEST LAPTOP*",
    "",
    `📋 *رقم الطلب:* ${order.id}`,
    `📅 *التاريخ:* ${new Date(order.createdAt).toLocaleString("ar-IQ")}`,
    "",
    "👤 *العميل:*",
    `الاسم: ${order.customer?.name || "—"}`,
    `الهاتف: ${order.customer?.phone || "—"}`,
    "",
    "📍 *مكان التوصيل:*",
    `المدينة: ${order.address?.city || "—"}`,
    `المنطقة: ${order.address?.area || "—"}`,
    `أقرب نقطة دالة: ${order.address?.street || "—"}`,
    order.address?.notes ? `ملاحظات: ${order.address.notes}` : "",
    "",
    "📦 *المنتجات:*",
    items || "—",
    "",
    `🚚 *التوصيل:* ${order.delivery?.label || "—"}${order.shipping ? ` — ${money(order.shipping)}` : ""}`,
    `💳 *الدفع:* ${order.payment?.label || "—"}`,
    "",
    `💰 *الإجمالي:* ${money(order.total)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function orderWhatsAppUrl(order) {
  const num = storeWhatsAppNumber();
  if (!num) return "#";
  return `https://wa.me/${num}?text=${encodeURIComponent(buildOrderWhatsAppMessage(order))}`;
}

function productAbsoluteUrl(productId) {
  try {
    return new URL(productUrl(productId), window.location.origin).href;
  } catch {
    return productUrl(productId);
  }
}

function buildProductInquiryWhatsAppMessage(p) {
  if (!p) return "";
  const storeName = STORE.nameAr || STORE.name || "BEST LAPTOP";
  const oos = !inStock(p);
  return [
    `السلام عليكم، أريد الاستفسار عن منتج من ${storeName}:`,
    "",
    `*${p.name}*`,
    oos ? "*الحالة: غير متوفر حالياً*" : "*الحالة: متوفر*",
    `الماركة: ${p.brand || "—"}`,
    `السعر: ${money(p.price)}`,
    p.oldPrice ? `قبل الخصم: ${money(p.oldPrice)}` : "",
    p.tag ? `الوسم: ${p.tag}` : "",
    "",
    "*تفاصيل المنتج:*",
    p.cpu ? `المعالج: ${p.cpu}` : "",
    p.gpu ? `كرت الشاشة: ${p.gpu}${p.tgp ? ` · ${p.tgp}` : ""}` : "",
    p.ram ? `الذاكرة: ${p.ram}` : "",
    p.storage ? `التخزين: ${p.storage}` : "",
    p.screen ? `الشاشة: ${p.screen}` : "",
    p.cooling ? `التبريد: ${p.cooling}` : "",
    p.specs ? `مواصفات: ${p.specs}` : "",
    "",
    oos ? "أرغب بمعرفة موعد التوفر أو بديل مناسب لهذا الجهاز." : "",
    `*رابط المنتج:*`,
    productAbsoluteUrl(p.id),
  ]
    .filter(Boolean)
    .join("\n");
}

function productInquiryWhatsAppUrl(p) {
  const num = storeWhatsAppNumber();
  if (!num || !p) return "#";
  return `https://wa.me/${num}?text=${encodeURIComponent(buildProductInquiryWhatsAppMessage(p))}`;
}

function productInquiryWhatsAppButton(p, extraClass = "") {
  const href = productInquiryWhatsAppUrl(p);
  const cls = ["btn", "btn-whatsapp", "btn-whatsapp-inquiry", extraClass].filter(Boolean).join(" ");
  return `<a class="${cls}" href="${href}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>استفسار واتساب</span></a>`;
}

function isCartEnabled() {
  return STORE?.cartEnabled !== false;
}

function applyStorefrontCartMode() {
  const on = isCartEnabled();
  document.documentElement.classList.toggle("cart-disabled", !on);
  document.querySelectorAll(".btn-cart").forEach((el) => {
    el.hidden = !on;
  });
  const drawer = document.querySelector("[data-drawer]");
  const overlay = document.querySelector("[data-overlay][data-close-cart]");
  if (drawer) drawer.hidden = !on;
  if (overlay) overlay.hidden = !on;
}

function applyStoreBranding() {
  const s = STORE;
  const notice = s.notice || `${s.city} · ${s.address} · ${s.warranty}`;

  document.querySelectorAll(".logo img, [data-store-logo]").forEach((el) => {
    el.src = resolveAsset(s.logo);
    el.alt = s.name || "BEST LAPTOP";
  });
  document.querySelectorAll(".logo-text strong, [data-store-name]").forEach((el) => {
    el.textContent = s.name || "BEST LAPTOP";
  });
  document.querySelectorAll(".logo-text small, [data-store-name-ar]").forEach((el) => {
    el.textContent = s.nameAr || "بيست لابتوب";
  });

  const topbar = document.querySelector("[data-store-notice], .topbar-inner > span");
  if (topbar) topbar.textContent = notice;

  const fav = document.querySelector('link[rel="icon"]');
  if (fav && s.logo) fav.href = resolveAsset(s.logo);

  const footerTitle = document.querySelector(".site-footer .footer-grid > div:first-child > h3");
  if (footerTitle) footerTitle.textContent = s.nameAr || s.name;

  document.querySelectorAll("[data-store-footer-location]").forEach((el) => {
    el.textContent = s.fullAddress || [s.city, s.address].filter(Boolean).join(" · ");
  });

  const footerAbout = document.querySelector("[data-store-footer-about]");
  const aboutText = `متجر متخصص بلابتوبات القيمنق والإنتاج في العراق، بأسعار ${s.currency || "IQD"} و${s.warranty}.`;
  if (footerAbout) {
    footerAbout.textContent = aboutText;
  } else {
    const footerDesc = document.querySelector(".site-footer .footer-grid > div:first-child p:not([data-store-footer-location])");
    if (footerDesc) footerDesc.textContent = aboutText;
  }

  const footerContact = document.querySelector("[data-store-footer-contact]");
  if (footerContact) {
    footerContact.innerHTML = `
      <li>${s.fullAddress || s.address}</li>
      <li>${s.phone}</li>
      <li>${s.email}</li>
      <li>${s.hours}</li>
      <li><a href="/contact" data-page-link="contact">${typeof SitePages !== "undefined" ? SitePages.label("contact") : "التواصل"}</a></li>
      <li><a href="/admin/login">لوحة التحكم</a></li>
    `;
  }

  const footerCopy = document.querySelector(".footer-copy");
  if (footerCopy) footerCopy.textContent = `© ${new Date().getFullYear()} ${s.nameAr || s.name}. جميع الحقوق محفوظة.`;

  const contactBox = document.querySelector("[data-store-contact]");
  if (contactBox) {
    contactBox.innerHTML = `
      <h2>بيانات المعرض</h2>
      <p class="muted">${s.fullAddress || s.address}</p>
      <p><strong>الجوال:</strong> ${s.phone}</p>
      <p><strong>البريد:</strong> ${s.email}</p>
      <p><strong>ساعات العمل:</strong> ${s.hours}</p>
      <p><strong>الضمان:</strong> ${s.warranty}</p>
      <a class="btn btn-ghost" href="/products" style="margin-top: 18px">العودة للمنتجات</a>
    `;
  }

}

function inStock(p) {
  return Number(p?.stock) > 0;
}

function unitPrice(product, item) {
  if (!product) return 0;
  return product.price + (item?.arabization ? ARABIZATION_FEE : 0);
}

function cartLineKey(item) {
  return `${item.id}__${item.arabization ? "ar" : "std"}`;
}

function parseCartLineKey(lineKey) {
  const [id, flag] = lineKey.split("__");
  return { id, arabization: flag === "ar" };
}

function arabizationNote(item) {
  return item?.arabization
    ? `<p class="line-addon muted">مع تعريب الكيبورد (+${money(ARABIZATION_FEE).replace(" IQD", "")} IQD)</p>`
    : "";
}

function discount(p) {
  if (!p.oldPrice) return 0;
  return Math.round((1 - p.price / p.oldPrice) * 100);
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

function setCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    showToast("تعذر حفظ السلة. تحقق من إعدادات المتصفح أو التخزين.");
    return;
  }
  renderCart();
  renderCartPage();
  renderCheckout();
}

function snapshotFromProduct(p) {
  return {
    name: p.name,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    image: p.image,
    brand: p.brand,
    cpu: p.cpu,
    gpu: p.gpu,
    ram: p.ram,
    storage: p.storage,
    stock: p.stock,
  };
}

function resolveCartProduct(item) {
  const live = PRODUCTS.find((p) => p.id === item.id);
  if (live) return live;
  if (item.name && item.price != null) {
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      oldPrice: item.oldPrice,
      image: item.image || "img/logo.jpg",
      brand: item.brand || "",
      cpu: item.cpu || "",
      gpu: item.gpu || "",
      ram: item.ram || "",
      storage: item.storage || "",
      stock: Number(item.stock) || 0,
    };
  }
  return null;
}

function getShipMethod() {
  const saved = sessionStorage.getItem(SHIP_KEY);
  const shipping = STORE.shipping || [];
  const valid = shipping.some((s) => s.id === saved);
  return valid ? saved : shipping[0]?.id || "baghdad";
}

function setShipMethod(id) {
  const shipping = STORE.shipping || [];
  if (shipping.some((s) => s.id === id)) {
    sessionStorage.setItem(SHIP_KEY, id);
  }
}

function shipOption(id) {
  const shipping = STORE.shipping || [];
  return shipping.find((s) => s.id === (id || getShipMethod())) || shipping[0] || { id: "baghdad", label: "توصيل بغداد", fee: 10000, hint: "" };
}

function payOption(id) {
  const payments = STORE.payments || [];
  return payments.find((p) => p.id === id) || payments[0] || { id: "cod", label: "الدفع عند الاستلام", hint: "" };
}

async function addToCart(id, opts = {}) {
  if (!isCartEnabled()) return;
  if (typeof StoreAPI !== "undefined" && !StoreAPI.isStoreReady?.()) {
    try {
      await StoreAPI.fetchStore();
    } catch {
      showToast("تعذر تحميل بيانات المتجر. حاول مرة أخرى.");
      return;
    }
  }
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) {
    showToast("المنتج غير متوفر حالياً. حدّث الصفحة وحاول مجدداً.");
    return;
  }
  if (!inStock(product)) {
    showToast("هذا الجهاز غير متوفر حالياً");
    return;
  }
  const arabization = !!opts.arabization;
  const cart = getCart();
  const existing = cart.find((i) => i.id === id && !!i.arabization === arabization);
  const next = (existing ? existing.qty : 0) + 1;
  if (next > product.stock) {
    showToast("لا توجد كمية إضافية");
    return;
  }
  if (existing) {
    existing.qty = next;
    Object.assign(existing, snapshotFromProduct(product));
  } else {
    const line = { id, qty: 1, ...snapshotFromProduct(product) };
    if (arabization) line.arabization = true;
    cart.push(line);
  }
  setCart(cart);
  renderCart();
  showCartPrompt(product, arabization);
}

function cartPageUrl() {
  try {
    return new URL("/cart", window.location.origin).href;
  } catch {
    return "/cart";
  }
}

function ensureCartPrompt() {
  let el = document.getElementById("cart-prompt");
  if (el) return el;
  el = document.createElement("div");
  el.id = "cart-prompt";
  el.className = "cart-prompt";
  el.innerHTML = `
    <div class="cart-prompt-backdrop" data-cart-prompt-close></div>
    <div class="cart-prompt-box" role="dialog" aria-labelledby="cart-prompt-title">
      <div class="cart-prompt-icon" aria-hidden="true">✓</div>
      <h3 id="cart-prompt-title">تمت الإضافة للسلة</h3>
      <p class="muted" data-cart-prompt-name></p>
      <div class="cart-prompt-actions">
        <button class="btn btn-ghost" type="button" data-cart-continue>متابعة التسوق</button>
        <a class="btn btn-primary" href="${cartPageUrl()}">الذهاب إلى السلة</a>
      </div>
    </div>`;
  document.body.append(el);
  el.querySelector("[data-cart-prompt-close]")?.addEventListener("click", closeCartPrompt);
  el.querySelector("[data-cart-continue]")?.addEventListener("click", closeCartPrompt);
  return el;
}

function showCartPrompt(product, arabization = false) {
  const el = ensureCartPrompt();
  const nameEl = el.querySelector("[data-cart-prompt-name]");
  if (nameEl) {
    const addon = arabization ? " (مع تعريب الكيبورد)" : "";
    nameEl.textContent = product?.name ? `أُضيف ${product.name}${addon} إلى سلتك.` : "تم تحديث السلة.";
  }
  el.classList.add("open");
  document.body.classList.add("cart-prompt-open");
}

function closeCartPrompt() {
  document.getElementById("cart-prompt")?.classList.remove("open");
  document.body.classList.remove("cart-prompt-open");
}

function changeQty(lineKey, delta) {
  const { id, arabization } = parseCartLineKey(lineKey);
  const cart = getCart()
    .map((i) => {
      if (i.id !== id || !!i.arabization !== arabization) return i;
      const live = resolveCartProduct(i);
      let qty = i.qty + delta;
      if (live && qty > live.stock) qty = live.stock;
      const next = { ...i, qty };
      if (live) Object.assign(next, snapshotFromProduct(live));
      return next;
    })
    .filter((i) => i.qty > 0);
  setCart(cart);
}

function removeFromCart(lineKey) {
  const { id, arabization } = parseCartLineKey(lineKey);
  setCart(getCart().filter((i) => !(i.id === id && !!i.arabization === arabization)));
  showToast("تم حذف المنتج من السلة");
}

function cartDetails() {
  return getCart().map((item) => ({
    ...item,
    product: resolveCartProduct(item),
  }));
}

function cartTotal() {
  return cartPricing().total;
}

function cartPricing(shipId) {
  const items = cartDetails().filter((i) => i.product);
  const subtotal = items.reduce((sum, i) => sum + unitPrice(i.product, i) * i.qty, 0);
  const discount = items.reduce((sum, i) => {
    const old = i.product.oldPrice;
    if (!old || old <= i.product.price) return sum;
    return sum + (old - i.product.price) * i.qty;
  }, 0);
  const ship = shipOption(shipId);
  const shipping = items.length ? (ship?.fee ?? 0) : 0;
  return { items, subtotal, discount, shipping, total: subtotal + shipping };
}

function qtyControl(lineKey, qty) {
  return `
    <div class="qty-ctrl" role="group" aria-label="الكمية">
      <button type="button" data-qty="${lineKey}" data-delta="-1" aria-label="إنقاص الكمية">${ICONS.minus}</button>
      <span>${qty}</span>
      <button type="button" data-qty="${lineKey}" data-delta="1" aria-label="زيادة الكمية">${ICONS.plus}</button>
    </div>
  `;
}

function specPills(p) {
  return `
    <ul class="spec-pills">
      <li>${p.cpu}</li>
      <li>${p.gpu}</li>
      <li>${p.ram}</li>
      <li>${p.storage}</li>
    </ul>
  `;
}

function priceBlock(p, qty = 1, lineUnit = null) {
  const unit = lineUnit ?? p.price;
  const line = unit * qty;
  const old = p.oldPrice ? p.oldPrice * qty : 0;
  return `
    <div class="price">
      <b>${money(line)}</b>
      ${old > p.price * qty && !lineUnit ? `<span class="old">${money(old)}</span>` : ""}
    </div>
  `;
}

function checkoutSteps(active) {
  const steps = [
    { n: 1, id: "cart", label: "السلة", href: "/cart" },
    { n: 2, id: "pay", label: "الدفع", href: "/checkout" },
    { n: 3, id: "done", label: "التأكيد", href: "/order" },
  ];
  return `
    <ol class="checkout-steps" aria-label="خطوات الشراء">
      ${steps
        .map((s) => {
          const state = s.n < active ? "done" : s.n === active ? "active" : "";
          const inner =
            s.n < active
              ? `<a href="${s.href}"><span>${s.n}</span>${s.label}</a>`
              : `<span><span>${s.n}</span>${s.label}</span>`;
          return `<li class="${state}">${inner}</li>`;
        })
        .join("")}
    </ol>
  `;
}

function summaryRows(pricing) {
  return `
    <div class="summary-row"><span>المجموع الفرعي</span><b>${money(pricing.subtotal)}</b></div>
    <div class="summary-row"><span>التوصيل</span><b>${pricing.shipping ? money(pricing.shipping) : "مجاني"}</b></div>
    <div class="summary-row ${pricing.discount ? "is-save" : ""}"><span>الخصم</span><b>${pricing.discount ? `− ${money(pricing.discount)}` : money(0)}</b></div>
    <div class="summary-row total"><span>الإجمالي</span><strong>${money(pricing.total)}</strong></div>
  `;
}

function productCardSpecs(p) {
  const parts = [p.gpu, p.ram, p.storage].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return p.specs || "";
}

function productCard(p, opts = {}) {
  const off = discount(p);
  const oos = !inStock(p);
  const cls = opts.catalog ? "product-card catalog-card" : "product-card";
  const lazy = opts.catalog ? ' loading="lazy" decoding="async"' : "";
  return `
    <article class="${cls} ${oos ? "is-oos" : ""}" data-product-link="${p.id}">
      <a class="pc-media" href="${productUrl(p.id)}">
        <img src="${p.image}" alt="${p.name}"${lazy} />
        <span class="badge">${p.tag}</span>
        ${off && !oos ? `<span class="badge badge-sale">خصم ${off}%</span>` : ""}
        ${oos ? `<span class="oos-ribbon">غير متوفر</span>` : ""}
      </a>
      <div class="card-body">
        <div class="pc-meta-row">
          <p class="pc-meta">${p.brand}</p>
          ${productConditionBadge(p.condition)}
        </div>
        <h3><a href="${productUrl(p.id)}">${p.name}</a></h3>
        <p class="muted pc-specs">${productCardSpecs(p)}</p>
        ${
          oos
            ? ""
            : `<div class="price">
          <b>${money(p.price)}</b>
          ${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}
        </div>`
        }
        <div class="pc-actions">
          <a class="btn btn-ghost" href="${productUrl(p.id)}">التفاصيل</a>
          ${
            oos
              ? `<button class="btn btn-ghost" type="button" disabled>غير متوفر</button>`
              : isCartEnabled()
                ? `<button class="btn btn-primary" data-add="${p.id}">للسلة</button>`
                : productInquiryWhatsAppButton(p, "btn-compact")
          }
        </div>
      </div>
    </article>
  `;
}

function productListFingerprint(products = []) {
  return products
    .map((p) =>
      [
        p.id,
        normalizeProductCondition(p.condition),
        p.price,
        p.stock,
        p.image,
        p.name,
        p.tag,
      ].join(":")
    )
    .join("|");
}

function clearProductSliderCaches() {
  document.querySelectorAll("[data-ps-mount]").forEach((mount) => {
    delete mount._productSliderFp;
    delete mount._productsFp;
  });
  const newMount = document.querySelector("[data-new-products]");
  if (newMount) {
    delete newMount._newProductsFp;
    delete newMount._productsFp;
  }
}

function getSliderProducts(cfg = {}) {
  const ids = Array.isArray(cfg.productIds) ? cfg.productIds.filter(Boolean) : [];
  if (ids.length) {
    return ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  }
  const brand = (cfg.brand || "").trim();
  const limit = Number(cfg.limit) || 8;
  if (brand) {
    return PRODUCTS.filter((p) => p.brand === brand).slice(0, limit);
  }
  const cat = cfg.category || "all";
  if (cat === "new") {
    return [...PRODUCTS]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit);
  }
  let list = PRODUCTS;
  if (cat !== "all") {
    list = PRODUCTS.filter(
      (p) =>
        p.category === cat ||
        (cat === "oled" && /OLED|DCI|Adobe/i.test(p.screen)) ||
        (cat === "workstation" && p.tag === "محطة عمل")
    );
  }
  return list.slice(0, limit);
}

function prefersFineHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function bindAutoplayEngagePause(root, api) {
  if (!root || root.dataset.engagePauseBound === "1") return;
  root.dataset.engagePauseBound = "1";

  const resumeIfIdle = () => {
    if (api.isHover() || api.isPress()) return;
    api.play();
  };

  root.addEventListener("mouseenter", () => {
    if (!prefersFineHover()) return;
    api.setHover(true);
    api.pause();
  });
  root.addEventListener("mouseleave", () => {
    if (!prefersFineHover()) return;
    api.setHover(false);
    resumeIfIdle();
  });

  root.addEventListener(
    "pointerdown",
    () => {
      api.setPress(true);
      api.pause();
    },
    { passive: true }
  );

  const releasePress = () => {
    if (!api.isPress()) return;
    api.setPress(false);
    resumeIfIdle();
  };
  window.addEventListener("pointerup", releasePress);
  window.addEventListener("pointercancel", releasePress);

  root._engagePauseDestroy = () => {
    window.removeEventListener("pointerup", releasePress);
    window.removeEventListener("pointercancel", releasePress);
  };
}

function productSliderSectionHtml(cfg) {
  const eyebrow = cfg.eyebrow ? `<p class="eyebrow">${cfg.eyebrow}</p>` : "";
  return `
    <section class="section product-slider-section" data-product-slider="${cfg.id}">
      <div class="container">
        <div class="section-head">
          <div>${eyebrow}<h2>${cfg.title || ""}</h2></div>
          <a class="btn btn-ghost" href="${cfg.linkUrl || "/products"}">كل المنتجات</a>
        </div>
        <div class="product-slider-wrap">
          <button class="product-slider-btn icon-btn" type="button" data-ps-prev aria-label="السابق">‹</button>
          <div class="product-slider-viewport">
            <div class="product-slider-track" data-product-track></div>
          </div>
          <button class="product-slider-btn icon-btn" type="button" data-ps-next aria-label="التالي">›</button>
        </div>
      </div>
    </section>`;
}

function initProductSlider(root, products, cfg) {
  const track = root.querySelector("[data-product-track]");
  const viewport = root.querySelector(".product-slider-viewport");
  if (!track || !viewport || !products.length) return;

  if (root._productSliderCleanup) root._productSliderCleanup();

  let offsetPx = root._productSliderOffset || 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let dragMoved = false;

  root._productSliderCfg = cfg;
  root._productSliderProducts = products;

  function visibleCount() {
    const w = viewport.clientWidth || root.clientWidth;
    if (w < 560) return 1;
    if (w < 900) return 2;
    if (w < 1180) return 3;
    return 4;
  }

  function stepPx() {
    const card = track.firstElementChild;
    return card ? card.offsetWidth + 16 : 0;
  }

  function maxOffset() {
    return Math.max(0, (products.length - visibleCount()) * stepPx());
  }

  function clampOffset(px) {
    return Math.max(0, Math.min(px, maxOffset()));
  }

  function syncButtons() {
    const prev = root.querySelector("[data-ps-prev]");
    const next = root.querySelector("[data-ps-next]");
    if (prev) prev.disabled = offsetPx <= 0;
    if (next) next.disabled = offsetPx >= maxOffset() - 1;
  }

  function applyTransform(instant) {
    offsetPx = clampOffset(offsetPx);
    root._productSliderOffset = offsetPx;
    track.style.transition =
      instant || dragging ? "none" : "transform 0.55s cubic-bezier(0.45, 0.05, 0.25, 1)";
    track.style.transform = `translate3d(-${offsetPx}px, 0, 0)`;
    syncButtons();
  }

  function snapToNearest(instant = false) {
    const step = stepPx();
    if (!step) return;
    offsetPx = clampOffset(Math.round(offsetPx / step) * step);
    applyTransform(instant);
  }

  function shiftBy(steps) {
    offsetPx = clampOffset(offsetPx + steps * stepPx());
    applyTransform(false);
  }

  function play() {
    clearInterval(root._productSliderTimer);
    root._productSliderTimer = null;
  }

  function pauseAuto() {
    clearInterval(root._productSliderTimer);
    root._productSliderTimer = null;
  }

  root._productSliderShift = shiftBy;
  root._productSliderPlay = play;
  root._productSliderPause = pauseAuto;
  root._productSliderCleanup = () => {
    clearInterval(root._productSliderTimer);
    if (root._productSliderResize) window.removeEventListener("resize", root._productSliderResize);
  };

  bindAutoplayEngagePause(root, {
    isHover: () => !!root._productSliderHover,
    isPress: () => !!root._productSliderPress,
    setHover: (v) => {
      root._productSliderHover = v;
    },
    setPress: (v) => {
      root._productSliderPress = v;
    },
    pause: () => root._productSliderPause?.(),
    play: () => root._productSliderPlay?.(),
  });

  if (!root.dataset.productSliderBound) {
    root.dataset.productSliderBound = "1";
    root.tabIndex = 0;
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        shiftBy(-1);
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        shiftBy(1);
        e.preventDefault();
      }
    });
    root.addEventListener("click", (e) => {
      const api = e.currentTarget;
      if (e.target.closest("[data-ps-prev]")) {
        api._productSliderShift(-1);
        if (!api._productSliderHover) api._productSliderPlay();
      }
      if (e.target.closest("[data-ps-next]")) {
        api._productSliderShift(1);
        if (!api._productSliderHover) api._productSliderPlay();
      }
    });

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest("[data-add], [data-ps-prev], [data-ps-next]")) return;
      dragging = false;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartOffset = offsetPx;
      viewport._dragArmed = true;
      viewport._dragPointerId = e.pointerId;
      root._productSliderPause();
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!viewport._dragArmed && !dragging) return;
      if (viewport._dragPointerId != null && e.pointerId !== viewport._dragPointerId) return;
      const dx = e.clientX - dragStartX;
      if (!dragging) {
        if (Math.abs(dx) < 12) return;
        dragging = true;
        dragMoved = true;
        viewport._dragArmed = false;
        try {
          viewport.setPointerCapture(e.pointerId);
        } catch {
          /* capture unsupported */
        }
        viewport.classList.add("is-dragging");
      }
      offsetPx = clampOffset(dragStartOffset - dx);
      applyTransform(true);
    });

    const endDrag = (e) => {
      if (viewport._dragPointerId != null && e.pointerId !== viewport._dragPointerId) return;
      const wasDragging = dragging;
      viewport._dragArmed = false;
      viewport._dragPointerId = null;
      if (!wasDragging) {
        dragging = false;
        viewport.classList.remove("is-dragging");
        if (!root._productSliderHover && !root._productSliderPress) play();
        return;
      }
      dragging = false;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      viewport.classList.remove("is-dragging");
      snapToNearest(false);
      if (!root._productSliderHover && !root._productSliderPress) play();
    };
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("lostpointercapture", endDrag);

    viewport.addEventListener(
      "click",
      (e) => {
        if (!dragMoved) return;
        e.preventDefault();
        e.stopPropagation();
        dragMoved = false;
      },
      true
    );
  }

  if (!root._productSliderResize) {
    root._productSliderResize = () => snapToNearest(true);
    window.addEventListener("resize", root._productSliderResize);
  }

  snapToNearest(true);
  if (!root._productSliderHover && !root._productSliderPress) play();
}

function renderOfficeGallery() {
  const mount = document.querySelector("[data-office-gallery]");
  if (!mount) return;
  const layout = getHomeLayout();
  const block = layout.find((b) => b.type === "office-gallery");
  if (block?.active === false) {
    mount.hidden = true;
    mount.innerHTML = "";
    return;
  }

  const g = STORE.officeGallery || {};
  const images = g.images || {};
  const slots = [
    { key: "tall", area: "tall" },
    { key: "wide", area: "wide" },
    { key: "bottomStart", area: "b1" },
    { key: "bottomEnd", area: "b2" },
  ];
  const hasAny = slots.some((s) => galleryImageSrc(images[s.key]));
  if (g.active === false || !hasAny) {
    mount.hidden = true;
    mount.innerHTML = "";
    return;
  }

  const title = g.title || "من داخل مكتب بيست لابتوب";
  const cells = slots
    .map((s) => {
      const src = galleryImageSrc(images[s.key]);
      if (!src) {
        return `<div class="office-gallery-cell office-gallery-cell--empty" style="grid-area:${s.area}" aria-hidden="true"></div>`;
      }
      return `<figure class="office-gallery-cell" style="grid-area:${s.area}">
        <img src="${resolveAsset(src)}" alt="" loading="lazy" decoding="async" />
      </figure>`;
    })
    .join("");

  mount.hidden = false;
  mount.innerHTML = `<div class="container">
    <div class="office-gallery-head">
      <h2 class="office-gallery-title">${title.replace(/</g, "&lt;")}</h2>
    </div>
    <div class="office-gallery-grid">${cells}</div>
  </div>`;
}

function getHomeLayout() {
  const sliders = typeof PRODUCT_SLIDERS !== "undefined" ? PRODUCT_SLIDERS : [];
  const saved = STORE?.homeLayout;
  if (typeof HomeLayout !== "undefined") return HomeLayout.normalize(saved, sliders);
  return [];
}

function ensureProductSliderMount(sliderId) {
  const root = document.querySelector("[data-home-root]");
  if (!root) return null;
  let el = root.querySelector(`[data-ps-mount="${sliderId}"]`);
  if (!el) {
    el = document.createElement("div");
    el.dataset.homeBlock = "product-slider";
    el.dataset.psMount = sliderId;
    root.appendChild(el);
  }
  return el;
}

function getHomeBlockElement(block) {
  const root = document.querySelector("[data-home-root]");
  if (!root || !block) return null;
  if (block.type === "product-slider") return ensureProductSliderMount(block.sliderId);
  return root.querySelector(`[data-home-block="${block.type}"]`);
}

function applyHomeLayout() {
  const root = document.querySelector("[data-home-root]");
  if (!root) return;
  const layout = getHomeLayout();
  layout.forEach((block) => {
    if (block.type === "product-slider") ensureProductSliderMount(block.sliderId);
  });
  layout.forEach((block) => {
    const el = getHomeBlockElement(block);
    if (!el) return;
    el.hidden = block.active === false;
    root.appendChild(el);
  });
}

function renderProductSliderMount(sliderId) {
  const mount = document.querySelector(`[data-ps-mount="${sliderId}"]`);
  if (!mount) return;
  const cfg = (typeof PRODUCT_SLIDERS !== "undefined" ? PRODUCT_SLIDERS : []).find((s) => s.id === sliderId);
  if (!cfg || cfg.active === false) {
    mount.querySelectorAll("[data-product-slider]").forEach((node) => {
      node._productSliderCleanup?.();
      node._engagePauseDestroy?.();
    });
    mount.innerHTML = "";
    mount.hidden = true;
    return;
  }

  const products = getSliderProducts(cfg);
  const configFp = [cfg.id, cfg.title, cfg.category, cfg.brand || "", cfg.limit, ...(cfg.productIds || [])].join("|");
  const productsFp = productListFingerprint(products);
  const fp = `${configFp}::${productsFp}`;
  if (mount._productSliderFp === fp && mount.querySelector("[data-product-slider]")) return;
  mount._productSliderFp = fp;
  mount._productsFp = productsFp;

  mount.querySelectorAll("[data-product-slider]").forEach((node) => {
    node._productSliderCleanup?.();
    node._engagePauseDestroy?.();
  });

  if (!products.length) {
    mount.innerHTML = "";
    mount.hidden = true;
    return;
  }

  mount.hidden = false;
  mount.innerHTML = productSliderSectionHtml(cfg);
  const root = mount.querySelector(`[data-product-slider="${cfg.id}"]`);
  if (!root) return;
  const track = root.querySelector("[data-product-track]");
  if (track) track.innerHTML = products.map(productCard).join("");
  initProductSlider(root, products, cfg);
}

function renderFeatured() {
  const layout = getHomeLayout();
  const hasLayoutSliders = layout.some((b) => b.type === "product-slider");
  const sliderIds = layout.filter((b) => b.type === "product-slider" && b.active !== false).map((b) => b.sliderId);
  const ids = hasLayoutSliders
    ? sliderIds
    : (typeof PRODUCT_SLIDERS !== "undefined" ? PRODUCT_SLIDERS : [])
        .filter((s) => s.active !== false)
        .map((s) => s.id);
  ids.forEach((id) => renderProductSliderMount(id));
  if (hasLayoutSliders) {
    layout
      .filter((b) => b.type === "product-slider" && b.active === false)
      .forEach((b) => {
        const mount = document.querySelector(`[data-ps-mount="${b.sliderId}"]`);
        if (!mount) return;
        mount.querySelectorAll("[data-product-slider]").forEach((node) => {
          node._productSliderCleanup?.();
          node._engagePauseDestroy?.();
        });
        mount.innerHTML = "";
        mount.hidden = true;
      });
  }
}

function renderNewProductsSlider() {
  const mount = document.querySelector("[data-new-products]");
  if (!mount) return;
  const layout = getHomeLayout();
  const block = layout.find((b) => b.type === "new-products");
  if (block?.active === false) {
    mount.innerHTML = "";
    mount.hidden = true;
    return;
  }
  mount.hidden = false;
  const products = getSliderProducts({ category: "new", limit: 10 });
  const productsFp = productListFingerprint(products);
  const fp = `new-arrivals::${productsFp}`;
  if (mount._newProductsFp === fp && mount.querySelector("[data-product-slider]")) return;
  mount._newProductsFp = fp;
  mount._productsFp = productsFp;

  if (!products.length) {
    const oldEmpty = mount.querySelector("[data-product-slider]");
    oldEmpty?._productSliderCleanup?.();
    oldEmpty?._engagePauseDestroy?.();
    mount.innerHTML = "";
    return;
  }

  const old = mount.querySelector("[data-product-slider]");
  old?._productSliderCleanup?.();
  old?._engagePauseDestroy?.();

  const cfg = {
    id: "new-arrivals",
    eyebrow: "وصل حديثاً",
    title: "أحدث المنتجات",
    autoplay: false,
    speedMs: 4200,
    linkUrl: "/products",
  };

  mount.innerHTML = productSliderSectionHtml(cfg);
  const root = mount.querySelector(`[data-product-slider="${cfg.id}"]`);
  if (!root) return;
  const track = root.querySelector("[data-product-track]");
  if (track) track.innerHTML = products.map(productCard).join("");
  initProductSlider(root, products, cfg);
}

function allowPhonePan() {
  return window.matchMedia("(pointer: coarse), (max-width: 1020px)").matches;
}

function bindTouchPan(el) {
  if (!el || el.dataset.touchPanBound === "1") return;
  el.dataset.touchPanBound = "1";
  let active = false;
  let lastX = 0;
  let moved = false;

  el.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    if (!allowPhonePan()) return;
    active = true;
    moved = false;
    lastX = e.clientX;
    el.classList.add("is-panning");
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* capture unsupported */
    }
  });
  el.addEventListener("pointermove", (e) => {
    if (!active) return;
    const dx = e.clientX - lastX;
    if (Math.abs(dx) > 4) moved = true;
    lastX = e.clientX;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollLeft += rtl ? dx : -dx;
  });
  const stop = () => {
    if (!active) return;
    active = false;
    el.classList.remove("is-panning");
  };
  el.addEventListener("pointerup", stop);
  el.addEventListener("pointercancel", stop);
  el.addEventListener(
    "click",
    (e) => {
      if (!moved) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );
}

function initTouchPanStrips() {
  document.querySelectorAll("[data-header-brands], .cat-grid").forEach(bindTouchPan);
}

function getStoreBrands() {
  const productBrands = new Set(PRODUCTS.map((p) => p.brand).filter(Boolean));
  if (typeof BRANDS !== "undefined" && BRANDS.length) {
    return BRANDS.filter((b) => productBrands.has(b.name));
  }
  return [...productBrands].map((name) => ({ name }));
}

function renderHeaderBrands() {
  const el = document.querySelector("[data-header-brands]");
  if (!el) return;
  const brands = getStoreBrands();
  const section = el.closest(".header-brands");
  if (section) section.hidden = brands.length === 0;
  el.innerHTML = brands
    .map(
      (b) =>
        `<a href="/products?brand=${encodeURIComponent(b.name)}" class="header-brand-link">${b.name}</a>`
    )
    .join("");
  bindTouchPan(el);
}

function catalogPriceBounds() {
  if (!PRODUCTS.length) return { min: 0, max: 0 };
  const prices = PRODUCTS.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

function getCatalogFilterState() {
  const params = new URLSearchParams(location.search);
  const q = (document.querySelector("[data-search]")?.value || params.get("q") || "").trim();
  const cat = document.querySelector("[data-filter]")?.value || params.get("cat") || "all";
  const sort = document.querySelector("[data-sort]")?.value || "featured";
  const minRaw = document.querySelector("[data-price-min]")?.value || params.get("min") || "";
  const maxRaw = document.querySelector("[data-price-max]")?.value || params.get("max") || "";
  const min = minRaw ? Number(minRaw) : 0;
  const max = maxRaw ? Number(maxRaw) : Infinity;
  const urlBrands = params.get("brand") ? params.get("brand").split(",").filter(Boolean) : [];
  const checked = [...document.querySelectorAll("[data-brand-filter]:checked")].map((el) => el.value);
  const brands = checked.length ? checked : urlBrands;
  return { q, cat, sort, min, max, brands };
}

function countActiveFilters() {
  const { q, cat, min, max, brands } = getCatalogFilterState();
  const bounds = catalogPriceBounds();
  let n = 0;
  if (q) n += 1;
  if (cat && cat !== "all") n += 1;
  if (min > bounds.min) n += 1;
  if (max < bounds.max) n += 1;
  n += brands.length;
  return n;
}

function updateFilterUi() {
  const badge = document.querySelector("[data-active-filters]");
  const count = countActiveFilters();
  if (badge) {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  }
  const countEl = document.querySelector("[data-filter-count]");
  if (countEl) countEl.textContent = String(PRODUCTS.length);
}

function closeFiltersDrawer() {
  document.body.classList.remove("filters-open");
}

function renderShopFilters() {
  const listEl = document.querySelector("[data-brand-filters]");
  if (!listEl) return;
  const params = new URLSearchParams(location.search);
  const urlBrands = params.get("brand") ? params.get("brand").split(",").filter(Boolean) : [];
  const checked = [...document.querySelectorAll("[data-brand-filter]:checked")].map((el) => el.value);
  const active = checked.length ? checked : urlBrands;
  const selectedSet = new Set(active);
  const bounds = catalogPriceBounds();
  const minInput = document.querySelector("[data-price-min]");
  const maxInput = document.querySelector("[data-price-max]");
  if (minInput && !minInput.value) {
    minInput.placeholder = money(bounds.min).replace(/\s*IQD$/, "");
  }
  if (maxInput && !maxInput.value) {
    maxInput.placeholder = money(bounds.max).replace(/\s*IQD$/, "");
  }
  listEl.innerHTML = getStoreBrands()
    .map((b) => {
      const count = PRODUCTS.filter((p) => p.brand === b.name).length;
      const checked = selectedSet.has(b.name) ? "checked" : "";
      return `<label class="filter-check">
        <input type="checkbox" data-brand-filter value="${b.name}" ${checked} />
        <span>${b.name}</span>
        <small>${count}</small>
      </label>`;
    })
    .join("");
  const countEl = document.querySelector("[data-filter-count]");
  if (countEl) countEl.textContent = String(PRODUCTS.length);
  updateFilterUi();
}

function renderCategoryFilter() {
  const sel = document.querySelector("[data-filter]");
  if (!sel) return;
  const current = new URLSearchParams(location.search).get("cat") || sel.value || "all";
  sel.innerHTML =
    `<option value="all">كل الفئات</option>` +
    CATEGORIES.map((c) => `<option value="${c.id}">${c.title}</option>`).join("");
  sel.value = [...sel.options].some((o) => o.value === current) ? current : "all";
}

function applyUrlFilters() {
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  const cat = params.get("cat");
  const brand = params.get("brand");
  const min = params.get("min");
  const max = params.get("max");
  const search = document.querySelector("[data-search]");
  const filter = document.querySelector("[data-filter]");
  const headerSearch = document.querySelector("[data-header-search]");
  const minInput = document.querySelector("[data-price-min]");
  const maxInput = document.querySelector("[data-price-max]");
  if (q && search) search.value = q;
  if (q && headerSearch) headerSearch.value = q;
  if (cat && filter) filter.value = cat;
  if (min && minInput) minInput.value = min;
  if (max && maxInput) maxInput.value = max;
  if (brand && document.querySelector("[data-brand-filters]")) {
    renderShopFilters();
  }
}

function catalogEmptyState() {
  const { q, cat, min, max, brands } = getCatalogFilterState();
  const bounds = catalogPriceBounds();
  const chips = [];
  if (q) chips.push(`بحث: «${q}»`);
  if (cat && cat !== "all") chips.push(`الفئة: ${catLabel(cat)}`);
  brands.forEach((b) => chips.push(`ماركة: ${b}`));
  if (min > bounds.min) chips.push(`من ${money(min)}`);
  if (max < bounds.max) chips.push(`إلى ${money(max)}`);

  const chipsHtml = chips.length
    ? `<div class="catalog-empty-chips" aria-label="الفلاتر النشطة">${chips.map((c) => `<span class="catalog-empty-chip">${c}</span>`).join("")}</div>`
    : `<p class="catalog-empty-note muted">لا توجد أجهزة بهذه المواصفات حالياً — جرّب تعديل البحث أو الفلاتر.</p>`;

  return `
    <section class="catalog-empty" role="status" aria-live="polite">
      <div class="catalog-empty-card">
        <div class="catalog-empty-main">
          <div class="catalog-empty-visual" aria-hidden="true">
            <div class="catalog-empty-glow"></div>
            <div class="catalog-empty-icon">${ICONS.searchEmpty}</div>
          </div>
          <div class="catalog-empty-body">
            <p class="eyebrow">لا نتائج</p>
            <h2>لا توجد أجهزة مطابقة للفلاتر</h2>
            <p class="catalog-empty-lead">لدينا <strong>${PRODUCTS.length}</strong> جهاز في المتجر — وسّع البحث أو أزل بعض الفلاتر لعرض المزيد.</p>
            ${chipsHtml}
            <div class="catalog-empty-actions">
              <button class="btn btn-primary btn-lg" type="button" data-filter-reset>مسح كل الفلاتر</button>
              <button class="btn btn-ghost btn-lg" type="button" data-filter-toggle>تعديل الفلاتر</button>
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function renderCatalog() {
  const el = document.querySelector("[data-catalog]");
  if (!el) return;
  const { q, cat, sort, min, max, brands } = getCatalogFilterState();

  let list = PRODUCTS.filter((p) => {
    const matchCat =
      cat === "all" ||
      p.category === cat ||
      (cat === "oled" && /OLED|DCI|Adobe/i.test(p.screen)) ||
      (cat === "workstation" && p.tag === "محطة عمل");
    const matchBrand = !brands.length || brands.includes(p.brand);
    const matchPrice = p.price >= min && p.price <= max;
    const hay = `${p.name} ${p.specs} ${p.brand} ${catLabel(p.category)}`;
    return matchCat && matchBrand && matchPrice && (!q || hay.includes(q));
  });

  if (sort === "featured") {
    list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);

  const countEl = document.querySelector("[data-results-count]");
  if (countEl) countEl.textContent = `${list.length} جهاز`;

  el.innerHTML = list.length
    ? list.map((p) => productCard(p, { catalog: true })).join("")
    : catalogEmptyState();
  updateFilterUi();
}

function renderProductPage() {
  const el = document.querySelector("[data-product]");
  if (!el) return;
  try {
    const id = productIdFromUrl();
    const p = PRODUCTS.find((item) => item.id === id);
    if (!p && id && typeof StoreAPI !== "undefined" && !StoreAPI.isStoreReady?.()) {
      el.innerHTML = `<p class="muted">جاري تحميل المنتج...</p>`;
      return;
    }
    if (!p) {
      el.innerHTML = `<p class="empty">الجهاز غير موجود. <a href="/products">العودة للمتجر</a></p>`;
      return;
    }
    document.title =
      typeof SitePages !== "undefined" ? SitePages.documentTitle("product", p.name) : `${p.name} | BEST LAPTOP`;
    const off = discount(p);
    const oos = !inStock(p);
    const images = (Array.isArray(p.images) && p.images.length ? p.images : [p.image])
      .map((src) => resolveAsset(galleryImageSrc(src)))
      .filter(Boolean);
  const addonHtml = oos
    ? ""
    : `<label class="pdp-addon">
        <input type="checkbox" data-pdp-arabization />
        <span class="pdp-addon-body">
          <strong>تعريب الكيبورد</strong>
          <small>تثبيت كيبورد عربي على الجهاز — يُضاف ${money(ARABIZATION_FEE)} على سعر اللابتوب</small>
        </span>
        <span class="pdp-addon-fee">+${money(ARABIZATION_FEE)}</span>
      </label>`;
  el.innerHTML = `
    <button type="button" class="pdp-back btn btn-ghost" data-back-page aria-label="رجوع">
      رجوع <span aria-hidden="true">→</span>
    </button>
    <div class="pdp-gallery" data-pdp-gallery>
      <div class="pdp-carousel">
        ${images.length > 1 ? `<button class="pdp-nav pdp-prev" type="button" data-pdp-prev aria-label="الصورة السابقة">‹</button>` : ""}
        <div class="pdp-media ${oos ? "is-oos" : ""}" data-pdp-media>
          <img src="${images[0]}" alt="${p.name}" data-pdp-main />
          <span class="badge">${p.tag}</span>
          ${off && !oos ? `<span class="badge badge-sale">خصم ${off}%</span>` : ""}
          ${oos ? `<span class="oos-ribbon">غير متوفر</span>` : ""}
        </div>
        ${images.length > 1 ? `<button class="pdp-nav pdp-next" type="button" data-pdp-next aria-label="الصورة التالية">›</button>` : ""}
      </div>
      ${
        images.length > 1
          ? `<div class="pdp-dots">${images
              .map((_, i) => `<button type="button" class="pdp-dot ${i === 0 ? "on" : ""}" data-pdp-dot="${i}" aria-label="صورة ${i + 1}"></button>`)
              .join("")}</div>`
          : ""
      }
      <p class="muted pdp-zoom-hint">اضغط على الصورة للتكبير · يمكنك التنقل بين الصور</p>
      ${
        images.length > 1
          ? `<div class="pdp-thumbs-slider" data-pdp-thumbs-slider>
              <button type="button" class="pdp-thumbs-btn" data-pdp-thumbs-prev aria-label="الصور السابقة">‹</button>
              <div class="pdp-thumbs-viewport">
                <div class="pdp-thumbs-track" data-pdp-thumbs-track>${images
                  .map(
                    (src, i) =>
                      `<button type="button" class="pdp-thumb ${i === 0 ? "on" : ""}" data-pdp-thumb="${src}" data-pdp-idx="${i}"><img src="${src}" alt="" /></button>`
                  )
                  .join("")}</div>
              </div>
              <button type="button" class="pdp-thumbs-btn" data-pdp-thumbs-next aria-label="الصور التالية">›</button>
            </div>`
          : ""
      }
      ${addonHtml}
    </div>
    <div class="pdp-info">
      <p class="eyebrow">${p.brand} · ${catLabel(p.category)} · ${productConditionLabel(p.condition)}</p>
      <h1>${p.name}</h1>
      <p class="pc-meta">${oos ? "غير متوفر" : `متوفر ${p.stock} أجهزة`}</p>
      <p class="lead muted">${p.headline || p.blurb || p.specs}</p>
      ${
        oos
          ? ""
          : `<div class="price pdp-price" data-pdp-price style="margin: 16px 0">
        <b data-pdp-price-value>${money(p.price)}</b>
        ${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}
      </div>`
      }
      <p class="muted">${STORE.warranty} · الاستلام من ${STORE.fullAddress}</p>
      <div class="pdp-cta">
        <div class="pdp-cta-row${isCartEnabled() ? "" : " is-wa-only"}">
          ${
            oos
              ? `<span class="btn-oos" role="status" aria-live="polite"><span class="oos-dot" aria-hidden="true"></span>غير متوفر حالياً</span>`
              : isCartEnabled()
                ? `<button class="btn btn-primary" data-add="${p.id}">${ICONS.bag}<span>أضف إلى السلة</span></button>`
                : productInquiryWhatsAppButton(p, "btn-lg")
          }
          ${!oos && isCartEnabled() ? productInquiryWhatsAppButton(p) : ""}
        </div>
        <a class="btn btn-ghost" href="/products">كل المنتجات</a>
      </div>
      <table class="spec-table">
        <tr><th>المعالج</th><td>${p.cpu}</td></tr>
        <tr><th>كرت الشاشة</th><td>${p.gpu} · ${p.tgp}</td></tr>
        <tr><th>الذاكرة</th><td>${p.ram}</td></tr>
        <tr><th>التخزين</th><td>${p.storage}</td></tr>
        <tr><th>الشاشة</th><td>${p.screen}</td></tr>
        <tr><th>التبريد</th><td>${p.cooling}</td></tr>
        <tr><th>الضمان</th><td>${STORE.warranty}</td></tr>
      </table>
    </div>
  `;
  const related = document.querySelector("[data-related]");
  if (related) {
    related.innerHTML = PRODUCTS.filter((item) => item.id !== p.id && item.category === p.category)
      .slice(0, 4)
      .map(productCard)
      .join("");
  }
  setupPdpCarousel(images, p.name);
  setupPdpThumbSlider(images);
  setupPdpArabization(p);
  } catch (err) {
    console.error("renderProductPage", err);
    el.innerHTML = `<p class="empty">تعذر عرض المنتج. <a href="/products">العودة للمتجر</a></p>`;
  }
}

function setupPdpArabization(p) {
  const cb = document.querySelector("[data-pdp-arabization]");
  const priceValue = document.querySelector("[data-pdp-price-value]");
  if (!cb || !priceValue) return;
  const sync = () => {
    priceValue.textContent = money(p.price + (cb.checked ? ARABIZATION_FEE : 0));
  };
  cb.addEventListener("change", sync);
}

function setupPdpCarousel(images, alt = "") {
  const gallery = document.querySelector("[data-pdp-gallery]");
  const main = document.querySelector("[data-pdp-main]");
  if (!gallery || !main || !images.length) return;

  if (gallery._pdpCarouselCleanup) gallery._pdpCarouselCleanup();

  let idx = 0;
  let timer = null;
  let paused = false;

  function paint(i) {
    idx = (i + images.length) % images.length;
    main.src = images[idx];
    main.alt = alt;
    document.querySelectorAll(".pdp-thumb").forEach((btn) => {
      btn.classList.toggle("on", Number(btn.dataset.pdpIdx) === idx);
    });
    document.querySelectorAll(".pdp-dot").forEach((dot) => {
      dot.classList.toggle("on", Number(dot.dataset.pdpDot) === idx);
    });
    if (window._pdpZoomSync) window._pdpZoomSync(idx);
    document.querySelector("[data-pdp-thumbs-slider]")?._pdpThumbsGo?.(idx);
  }

  function play() {
    clearInterval(timer);
    if (images.length < 2 || paused) return;
    timer = setInterval(() => paint(idx + 1), 4500);
  }

  function pause() {
    paused = true;
    clearInterval(timer);
  }

  function resume() {
    paused = false;
    play();
  }

  gallery._pdpGo = (n) => {
    paint(n);
    play();
  };
  gallery._pdpIndex = () => idx;
  gallery._pdpImages = images;

  gallery.addEventListener("mouseenter", pause);
  gallery.addEventListener("mouseleave", resume);
  gallery.addEventListener("focusin", pause);
  gallery.addEventListener("focusout", resume);

  gallery._pdpCarouselCleanup = () => {
    clearInterval(timer);
    gallery.removeEventListener("mouseenter", pause);
    gallery.removeEventListener("mouseleave", resume);
    gallery.removeEventListener("focusin", pause);
    gallery.removeEventListener("focusout", resume);
  };

  setupPdpZoom(images, () => idx, paint);
  play();
}

function setupPdpThumbSlider(images) {
  const root = document.querySelector("[data-pdp-thumbs-slider]");
  const track = document.querySelector("[data-pdp-thumbs-track]");
  const viewport = root?.querySelector(".pdp-thumbs-viewport");
  if (!root || !track || !viewport || images.length < 2) return;

  if (root._pdpThumbsCleanup) root._pdpThumbsCleanup();

  let offsetPx = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartOffset = 0;

  function thumbStep() {
    const thumb = track.firstElementChild;
    if (!thumb) return 80;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "8") || 8;
    return thumb.offsetWidth + gap;
  }

  function visibleCount() {
    const step = thumbStep();
    if (!step) return 1;
    return Math.max(1, Math.floor((viewport.clientWidth + 8) / step));
  }

  function maxOffset() {
    return Math.max(0, (images.length - visibleCount()) * thumbStep());
  }

  function clampOffset(px) {
    return Math.max(0, Math.min(px, maxOffset()));
  }

  function syncButtons() {
    const prev = root.querySelector("[data-pdp-thumbs-prev]");
    const next = root.querySelector("[data-pdp-thumbs-next]");
    if (prev) prev.disabled = offsetPx <= 0;
    if (next) next.disabled = offsetPx >= maxOffset() - 1;
  }

  function applyTransform(animate = true) {
    offsetPx = clampOffset(offsetPx);
    track.style.transition = animate && !dragging ? "transform 0.35s ease" : "none";
    track.style.transform = `translate3d(-${offsetPx}px, 0, 0)`;
    syncButtons();
  }

  function shiftBy(steps) {
    offsetPx = clampOffset(offsetPx + steps * thumbStep());
    applyTransform(true);
  }

  function scrollToIndex(idx) {
    const step = thumbStep();
    const vis = visibleCount();
    const target = idx * step;
    if (target < offsetPx) offsetPx = target;
    else if (target + step > offsetPx + vis * step) offsetPx = target - (vis - 1) * step;
    applyTransform(true);
  }

  const onPrev = () => shiftBy(-1);
  const onNext = () => shiftBy(1);
  const onResize = () => applyTransform(false);

  const prevBtn = root.querySelector("[data-pdp-thumbs-prev]");
  const nextBtn = root.querySelector("[data-pdp-thumbs-next]");
  prevBtn?.addEventListener("click", onPrev);
  nextBtn?.addEventListener("click", onNext);
  window.addEventListener("resize", onResize);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    dragStartX = e.clientX;
    dragStartOffset = offsetPx;
    viewport.classList.add("is-dragging");
    try {
      viewport.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    offsetPx = clampOffset(dragStartOffset - (e.clientX - dragStartX));
    applyTransform(false);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("is-dragging");
    const step = thumbStep();
    if (step) offsetPx = clampOffset(Math.round(offsetPx / step) * step);
    applyTransform(true);
  };

  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointermove", onPointerMove);
  viewport.addEventListener("pointerup", onPointerUp);
  viewport.addEventListener("pointercancel", onPointerUp);

  root._pdpThumbsGo = scrollToIndex;
  root._pdpThumbsCleanup = () => {
    window.removeEventListener("resize", onResize);
    prevBtn?.removeEventListener("click", onPrev);
    nextBtn?.removeEventListener("click", onNext);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointermove", onPointerMove);
    viewport.removeEventListener("pointerup", onPointerUp);
    viewport.removeEventListener("pointercancel", onPointerUp);
  };

  applyTransform(false);
}

function setupPdpZoom(images, getIndex, setIndex) {
  const main = document.querySelector("[data-pdp-main]");
  if (!main) return;
  main.style.cursor = "zoom-in";
  main.onclick = () => openImageZoom(images, getIndex?.() ?? 0, setIndex);
}

function ensureZoomLayer() {
  let box = document.getElementById("pdp-zoom-layer");
  if (box) return box;
  box = document.createElement("div");
  box.id = "pdp-zoom-layer";
  box.className = "pdp-zoom-layer";
  box.innerHTML = `
    <button type="button" class="pdp-zoom-close" aria-label="إغلاق">×</button>
    <button type="button" class="pdp-zoom-nav pdp-zoom-prev" data-zoom-prev aria-label="الصورة السابقة">‹</button>
    <button type="button" class="pdp-zoom-nav pdp-zoom-next" data-zoom-next aria-label="الصورة التالية">›</button>
    <div class="pdp-zoom-stage" data-zoom-stage>
      <img data-zoom-img alt="" draggable="false" />
    </div>
    <p class="pdp-zoom-counter" data-zoom-counter hidden></p>
    <p class="pdp-zoom-hint-layer">عجلة الفأرة للتكبير · اسحب للتحريك · ← → للتنقل · Esc للإغلاق</p>
  `;
  document.body.append(box);
  const stage = box.querySelector("[data-zoom-stage]");
  const img = box.querySelector("[data-zoom-img]");
  const state = { scale: 1, panX: 0, panY: 0, dragging: false, startX: 0, startY: 0 };

  function applyTransform() {
    img.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.scale})`;
  }

  box.querySelector(".pdp-zoom-close").addEventListener("click", closeImageZoom);
  box.querySelector("[data-zoom-prev]")?.addEventListener("click", (e) => {
    e.stopPropagation();
    box._step?.(-1);
  });
  box.querySelector("[data-zoom-next]")?.addEventListener("click", (e) => {
    e.stopPropagation();
    box._step?.(1);
  });
  box.addEventListener("click", (e) => {
    if (e.target === box) closeImageZoom();
  });
  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      state.scale = Math.min(4, Math.max(1, state.scale + (e.deltaY < 0 ? 0.12 : -0.12)));
      if (state.scale === 1) {
        state.panX = 0;
        state.panY = 0;
      }
      applyTransform();
    },
    { passive: false }
  );
  stage.addEventListener("pointerdown", (e) => {
    if (state.scale <= 1) return;
    state.dragging = true;
    state.startX = e.clientX - state.panX;
    state.startY = e.clientY - state.panY;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!state.dragging) return;
    state.panX = e.clientX - state.startX;
    state.panY = e.clientY - state.startY;
    applyTransform();
  });
  stage.addEventListener("pointerup", () => {
    state.dragging = false;
  });

  box._open = (imageList, startIndex = 0, onChange) => {
    box._images = Array.isArray(imageList) ? imageList : [imageList];
    box._index = Math.max(0, Math.min(startIndex, box._images.length - 1));
    box._onChange = onChange;
    const counter = box.querySelector("[data-zoom-counter]");
    const showNav = box._images.length > 1;
    box.querySelector("[data-zoom-prev]").hidden = !showNav;
    box.querySelector("[data-zoom-next]").hidden = !showNav;
    if (counter) {
      counter.hidden = !showNav;
      counter.textContent = showNav ? `${box._index + 1} / ${box._images.length}` : "";
    }
    img.src = box._images[box._index];
    state.scale = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
    box.classList.add("open");
    document.body.classList.add("zoom-open");
  };

  box._step = (delta) => {
    if (!box._images?.length) return;
    box._index = (box._index + delta + box._images.length) % box._images.length;
    img.src = box._images[box._index];
    state.scale = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
    const counter = box.querySelector("[data-zoom-counter]");
    if (counter && box._images.length > 1) counter.textContent = `${box._index + 1} / ${box._images.length}`;
    box._onChange?.(box._index);
    window._pdpZoomSync = null;
  };

  window._pdpZoomSync = (i) => {
    if (!box.classList.contains("open") || !box._images?.length) return;
    box._index = i;
    img.src = box._images[i];
    state.scale = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
    const counter = box.querySelector("[data-zoom-counter]");
    if (counter) counter.textContent = `${i + 1} / ${box._images.length}`;
  };
  return box;
}

function openImageZoom(imagesOrSrc, index = 0, onChange) {
  const list = Array.isArray(imagesOrSrc) ? imagesOrSrc : [imagesOrSrc];
  ensureZoomLayer()._open(list, index, onChange);
}

function closeImageZoom() {
  document.getElementById("pdp-zoom-layer")?.classList.remove("open");
  document.body.classList.remove("zoom-open");
}

function catLabel(cat) {
  return cat === "gaming" ? "قيمنق" : "إنتاج";
}

function renderCart() {
  const list = document.querySelector("[data-cart-items]");
  const total = document.querySelector("[data-cart-total]");
  if (!list) return;
  const { items, subtotal } = cartPricing();
  list.innerHTML = items.length
    ? items
        .map(
          (i) => `
        <div class="cart-item">
          <a href="${productUrl(i.id)}"><img src="${i.product.image}" alt="${i.product.name}" /></a>
          <div>
            <strong><a href="${productUrl(i.id)}">${i.product.name}</a></strong>
            <div class="muted">${i.product.cpu} · ${i.product.gpu}</div>
            ${i.arabization ? `<div class="muted line-addon">مع تعريب الكيبورد</div>` : ""}
            ${qtyControl(cartLineKey(i), i.qty)}
          </div>
          <div class="cart-item-side">
            <b>${money(unitPrice(i.product, i) * i.qty)}</b>
            <button class="icon-action" type="button" data-remove="${cartLineKey(i)}" aria-label="حذف">${ICONS.trash}</button>
          </div>
        </div>`
        )
        .join("")
    : `<p class="empty">سلتك فارغة حالياً.</p>`;
  if (total) total.textContent = money(subtotal);
}

function openCart() {
  closeMobileNav();
  document.querySelector("[data-overlay]")?.classList.add("open");
  document.querySelector("[data-drawer]")?.classList.add("open");
}

function closeCart() {
  document.querySelector("[data-overlay]")?.classList.remove("open");
  document.querySelector("[data-drawer]")?.classList.remove("open");
}

function navHrefActive(href) {
  const dest = new URL(href, location.origin);
  if (typeof SitePages !== "undefined") {
    const hereKey = SitePages.pathKey(location.pathname);
    const destKey = SitePages.pathKey(dest.pathname);
    if (hereKey !== destKey) return false;
    if (destKey === "products") {
      return (dest.searchParams.get("cat") || "") === (new URLSearchParams(location.search).get("cat") || "");
    }
    return true;
  }
  const destFile = (dest.pathname.split("/").pop() || "index.html").toLowerCase();
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (destFile !== here) return false;
  if (destFile === "products.html") {
    return (dest.searchParams.get("cat") || "") === (new URLSearchParams(location.search).get("cat") || "");
  }
  return true;
}

function closeMobileNav() {
  document.body.classList.remove("nav-open");
  document.querySelectorAll("[data-menu]").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
  const drawer = document.querySelector("[data-mobile-nav]");
  if (drawer) drawer.setAttribute("aria-hidden", "true");
}

function openMobileNav() {
  closeCart();
  closeFiltersDrawer();
  document.querySelector("[data-search-box]")?.classList.remove("open");
  document.body.classList.remove("search-open");
  paintMobileNav();
  document.body.classList.add("nav-open");
  document.querySelectorAll("[data-menu]").forEach((btn) => btn.setAttribute("aria-expanded", "true"));
  const drawer = document.querySelector("[data-mobile-nav]");
  if (drawer) drawer.setAttribute("aria-hidden", "false");
  drawer?.querySelector(".mobile-nav-close")?.focus();
}

function toggleMobileNav() {
  if (document.body.classList.contains("nav-open")) closeMobileNav();
  else openMobileNav();
}

function paintMobileNav() {
  const drawer = document.querySelector("[data-mobile-nav]");
  if (!drawer) return;
  const s = typeof STORE !== "undefined" ? STORE : {};
  const cats =
    typeof CATEGORIES !== "undefined" && CATEGORIES.length
      ? CATEGORIES
      : [
          { id: "gaming", title: "لابتوبات القيمنق", text: "شاشات عالية التردد وكروت RTX" },
          { id: "production", title: "لابتوبات الإنتاج", text: "OLED ودقة ألوان للمونتاج" },
          { id: "oled", title: "شاشات OLED", text: "تغطية لونية للمصممين" },
          { id: "workstation", title: "محطات العمل", text: "ذاكرة واسعة ورندر ثقيل" },
        ];
  const pages = typeof SitePages !== "undefined"
    ? SitePages.MAIN_NAV.map((key) => ({ href: SitePages.href(key), label: SitePages.label(key), key })).concat(
        isCartEnabled() ? [{ href: SitePages.href("cart"), label: SitePages.label("cart"), key: "cart" }] : []
      )
    : [
        { href: "/", label: "الرئيسية", key: "home" },
        { href: "/products", label: "المنتجات", key: "products" },
        { href: "/contact", label: "التواصل", key: "contact" },
        ...(isCartEnabled() ? [{ href: "/cart", label: "السلة", key: "cart" }] : []),
      ];
  const phone = s.phone || "";
  const tel = phoneDigits(phone);
  const wa = storeWhatsAppNumber();
  const address = s.fullAddress || [s.city, s.address].filter(Boolean).join(" · ");
  const logo = resolveAsset(s.logo || "img/logo.jpg");

  drawer.innerHTML = `
    <div class="mobile-nav-head">
      <a class="logo" href="/" data-close-nav>
        <img src="${logo}" alt="${s.name || "BEST LAPTOP"}" />
        <span class="logo-text">
          <strong>${s.name || "BEST LAPTOP"}</strong>
          <small>${s.nameAr || "بيست لابتوب"}</small>
        </span>
      </a>
      <button class="icon-btn mobile-nav-close" type="button" data-close-nav aria-label="إغلاق القائمة">×</button>
    </div>
    <div class="mobile-nav-body">
      <form class="mobile-nav-search" action="/products" method="get">
        <input name="q" type="search" placeholder="ابحث عن لابتوب..." aria-label="بحث" />
        <button class="btn btn-primary" type="submit">بحث</button>
      </form>
      <p class="mobile-nav-label">القائمة</p>
      ${pages
        .map(
          (p) =>
            `<a class="mobile-nav-link${navHrefActive(p.href) ? " active" : ""}" href="${p.href}">${p.label}</a>`
        )
        .join("")}
      <p class="mobile-nav-label">الأقسام</p>
      <div class="mobile-nav-cats">
        ${cats
          .map((c) => {
            const href = `/products?cat=${encodeURIComponent(c.id)}`;
            return `<a class="mobile-nav-cat${navHrefActive(href) ? " active" : ""}" href="${href}"><strong>${c.title}</strong><small>${c.text || ""}</small></a>`;
          })
          .join("")}
      </div>
      <p class="mobile-nav-label">تواصل سريع</p>
      <div class="mobile-nav-actions">
        ${tel ? `<a class="mobile-nav-link" href="tel:${tel}">اتصال · ${phone}</a>` : ""}
        ${wa ? `<a class="mobile-nav-link" href="https://wa.me/${wa}" target="_blank" rel="noopener">واتساب</a>` : ""}
        <a class="mobile-nav-link" href="/contact">موقع المعرض</a>
      </div>
    </div>
    <div class="mobile-nav-foot">
      <p class="mobile-nav-meta">${address || ""}${s.hours ? `<br>${s.hours}` : ""}</p>
      <button class="btn btn-ghost mobile-nav-theme" data-theme-toggle type="button" aria-label="تبديل المظهر">فاتح</button>
    </div>`;

  if (typeof applyTheme === "function") applyTheme(currentTheme());
}

function setupMobileNav() {
  document.querySelectorAll("[data-menu]").forEach((btn) => {
    btn.setAttribute("aria-controls", "mobile-nav");
    btn.setAttribute("aria-expanded", document.body.classList.contains("nav-open") ? "true" : "false");
    if (!btn.querySelector(".menu-bars")) {
      btn.innerHTML = '<span class="menu-bars" aria-hidden="true"></span>';
    }
    if (!btn.getAttribute("aria-label")) btn.setAttribute("aria-label", "فتح القائمة");
  });

  if (!document.querySelector("[data-mobile-nav-backdrop]")) {
    const backdrop = document.createElement("div");
    backdrop.className = "mobile-nav-backdrop";
    backdrop.dataset.mobileNavBackdrop = "";
    backdrop.dataset.closeNav = "";
    document.body.appendChild(backdrop);
  }
  if (!document.querySelector("[data-mobile-nav]")) {
    const drawer = document.createElement("aside");
    drawer.className = "mobile-nav";
    drawer.id = "mobile-nav";
    drawer.dataset.mobileNav = "";
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("aria-label", "قائمة الموقع");
    document.body.appendChild(drawer);
  }

  paintMobileNav();

  if (setupMobileNav._bound) return;
  setupMobileNav._bound = true;

  window.matchMedia("(max-width: 1020px)").addEventListener("change", (e) => {
    if (!e.matches) closeMobileNav();
  });
}

function showToast(msg) {
  const toast = document.querySelector("[data-toast]");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function checkout() {
  if (!isCartEnabled()) {
    showToast("الشراء عبر السلة غير متاح حالياً — تواصل معنا عبر واتساب");
    return;
  }
  if (!getCart().length) {
    showToast("أضف جهازاً أولاً");
    return;
  }
  location.href = "/checkout";
}

function renderCartPage() {
  const el = document.querySelector("[data-cart-page]");
  if (!el) return;
  if (!isCartEnabled()) {
    el.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">${ICONS.whatsapp}</div>
        <h2>الشراء عبر السلة متوقف</h2>
        <p class="muted">يمكنك الاستفسار عن أي جهاز وطلبه مباشرة عبر واتساب.</p>
        <a class="btn btn-whatsapp btn-whatsapp-inquiry btn-lg" href="https://wa.me/${storeWhatsAppNumber()}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>تواصل عبر واتساب</span></a>
        <a class="btn btn-ghost" href="/products" style="margin-top:10px">تصفح المنتجات</a>
      </div>`;
    return;
  }
  const ship = getShipMethod();
  const pricing = cartPricing(ship);
  const steps = document.querySelector("[data-checkout-steps]");
  if (steps) steps.innerHTML = checkoutSteps(1);

  if (!pricing.items.length) {
    el.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">${ICONS.bag}</div>
        <h2>سلتك فارغة</h2>
        <p class="muted">أضف لابتوب من التشكيلة ثم ارجع هنا لإتمام الطلب.</p>
        <a class="btn btn-primary" href="/products">تصفح المنتجات</a>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="shop-layout">
      <div class="cart-list">
        ${pricing.items
          .map(
            (i) => `
          <article class="cart-line">
            <a class="cart-line-media" href="${productUrl(i.id)}">
              <img src="${i.product.image}" alt="${i.product.name}" />
            </a>
            <div class="cart-line-info">
              <p class="eyebrow">${i.product.brand}</p>
              <h3><a href="${productUrl(i.id)}">${i.product.name}</a></h3>
              ${specPills(i.product)}
              ${arabizationNote(i)}
              ${priceBlock(i.product, i.qty, unitPrice(i.product, i))}
            </div>
            <div class="cart-line-actions">
              ${qtyControl(cartLineKey(i), i.qty)}
              <p class="line-total">${money(unitPrice(i.product, i) * i.qty)}</p>
              <button class="icon-action" type="button" data-remove="${cartLineKey(i)}" aria-label="حذف المنتج">${ICONS.trash} حذف</button>
            </div>
          </article>`
          )
          .join("")}
      </div>
      <aside class="order-summary">
        <h2>ملخص الطلب</h2>
        <label class="summary-ship">
          التوصيل
          <select data-ship-estimate>
            ${STORE.shipping
              .map(
                (s) =>
                  `<option value="${s.id}" ${s.id === ship ? "selected" : ""}>${s.label}${s.fee ? ` — ${money(s.fee)}` : " — مجاني"}</option>`
              )
              .join("")}
          </select>
        </label>
        ${summaryRows(pricing)}
        <a class="btn btn-primary btn-lg" href="/checkout">المتابعة للدفع</a>
        <a class="btn btn-ghost" href="/products">متابعة التسوق</a>
        <p class="muted summary-note">${STORE.warranty}</p>
      </aside>
    </div>
  `;
}

function renderCheckout() {
  const form = document.querySelector("[data-checkout-form]");
  const summary = document.querySelector("[data-checkout-summary]");
  const steps = document.querySelector("[data-checkout-steps]");
  if (!form && !summary) return;
  if (!isCartEnabled()) {
    if (summary) {
      summary.innerHTML = `
        <div class="order-summary">
          <h3>الشراء عبر السلة متوقف</h3>
          <p class="muted">تواصل معنا عبر واتساب لطلب جهازك مباشرة.</p>
          <a class="btn btn-whatsapp btn-whatsapp-inquiry btn-lg" href="https://wa.me/${storeWhatsAppNumber()}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>تواصل عبر واتساب</span></a>
        </div>`;
    }
    if (form) form.hidden = true;
    return;
  }
  if (form) form.hidden = false;
  if (location.pathname.includes("/checkout") && new URLSearchParams(location.search).get("done") === "1") {
    location.replace("/order");
    return;
  }
  if (steps) steps.innerHTML = checkoutSteps(2);

  const ship = form?.elements.delivery?.value || getShipMethod();
  const pricing = cartPricing(ship);
  if (!pricing.items.length) {
    if (summary) {
      summary.innerHTML = `
        <div class="empty-cart compact">
          <h2>لا يوجد طلب</h2>
          <p class="muted">أضف جهازاً للسلة أولاً.</p>
          <a class="btn btn-primary" href="/products">العودة للمتجر</a>
        </div>`;
    }
    form?.querySelector("[data-place-order]")?.setAttribute("disabled", "disabled");
    return;
  }

  setShipMethod(ship);
  if (summary) {
    summary.innerHTML = `
      <h2>ملخص الطلب</h2>
      <ul class="summary-items">
        ${pricing.items
          .map(
            (i) => `
          <li>
            <img src="${i.product.image}" alt="" />
            <div>
              <strong>${i.product.name}</strong>
              <span class="muted">${i.qty} × ${money(unitPrice(i.product, i))}${i.arabization ? " · تعريب كيبورد" : ""}</span>
            </div>
            <b>${money(unitPrice(i.product, i) * i.qty)}</b>
          </li>`
          )
          .join("")}
      </ul>
      ${summaryRows(pricing)}
      <button class="btn btn-primary btn-lg" type="submit" data-place-order form="checkout-form">تأكيد الطلب</button>
      <p class="muted summary-note">سنتواصل معك لتأكيد التسليم على ${STORE.phone}</p>
    `;
  }
}

function setupCheckoutForm() {
  const form = document.querySelector("[data-checkout-form]");
  if (!form) return;
  const city = form.elements.city;
  if (city && !city.options.length) {
    STORE.cities.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      if (c === STORE.city) opt.selected = true;
      city.append(opt);
    });
  }
  const deliveryBox = form.querySelector("[data-delivery-options]");
  if (deliveryBox && !deliveryBox.childElementCount) {
    const current = getShipMethod();
    deliveryBox.innerHTML = STORE.shipping
      .map(
        (s) => `
      <label class="choice-card">
        <input type="radio" name="delivery" value="${s.id}" ${s.id === current ? "checked" : ""} />
        <span>
          <strong>${s.label}</strong>
          <small>${s.hint}</small>
        </span>
        <b>${s.fee ? money(s.fee) : "مجاني"}</b>
      </label>`
      )
      .join("");
  }
  const payBox = form.querySelector("[data-payment-options]");
  if (payBox && !payBox.childElementCount) {
    payBox.innerHTML = STORE.payments
      .map(
        (p, idx) => `
      <label class="choice-card">
        <input type="radio" name="payment" value="${p.id}" ${idx === 0 ? "checked" : ""} />
        <span>
          <strong>${p.label}</strong>
          <small>${p.hint}</small>
        </span>
      </label>`
      )
      .join("");
  }
  form.addEventListener("change", () => {
    if (form.elements.delivery?.value) setShipMethod(form.elements.delivery.value);
    renderCheckout();
  });
}

async function placeOrder(form) {
  const pricing = cartPricing(form.elements.delivery?.value);
  if (!pricing.items.length) {
    showToast("أضف جهازاً أولاً");
    return;
  }

  const name = form.elements.name.value.trim();
  const phoneRaw = form.elements.phone.value.trim();
  const phoneDigitsOnly = phoneRaw.replace(/\D/g, "");
  const area = form.elements.area.value.trim();
  const street = form.elements.street.value.trim();
  const notes = form.elements.notes?.value.trim() || "";

  if (!name) {
    showToast("أدخل الاسم الكامل");
    form.elements.name.focus();
    return;
  }
  if (phoneDigitsOnly.length !== 11) {
    showToast("رقم الهاتف يجب أن يكون 11 رقم");
    form.elements.phone.focus();
    return;
  }
  if (!form.elements.city.value) {
    showToast("اختر المدينة");
    form.elements.city.focus();
    return;
  }
  if (!area) {
    showToast("أدخل المنطقة");
    form.elements.area.focus();
    return;
  }
  if (!street) {
    showToast("أدخل أقرب نقطة دالة");
    form.elements.street.focus();
    return;
  }
  if (!notes) {
    showToast("أدخل ملاحظات التوصيل");
    form.elements.notes.focus();
    return;
  }

  const delivery = shipOption(form.elements.delivery?.value);
  const payment = payOption(form.elements.payment?.value);
  const order = {
    id: `BL-${String(Date.now()).slice(-6)}`,
    createdAt: new Date().toISOString(),
    customer: {
      name,
      phone: phoneRaw,
      email: "",
    },
    address: {
      city: form.elements.city.value,
      area,
      street,
      notes,
    },
    delivery: { id: delivery.id, label: delivery.label, fee: delivery.fee },
    payment: { id: payment.id, label: payment.label },
    items: pricing.items.map((i) => ({
      id: i.id,
      qty: i.qty,
      name: i.product.name,
      image: i.product.image,
      cpu: i.product.cpu,
      gpu: i.product.gpu,
      ram: i.product.ram,
      storage: i.product.storage,
      price: unitPrice(i.product, i),
      oldPrice: i.product.oldPrice,
      arabization: !!i.arabization,
    })),
    subtotal: pricing.subtotal,
    discount: pricing.discount,
    shipping: pricing.shipping,
    total: pricing.total,
  };
  try {
    const saved = await StoreAPI.createOrder(order);
    sessionStorage.setItem(ORDER_KEY, JSON.stringify(saved));
    localStorage.setItem(CART_KEY, "[]");
    location.href = "/order";
  } catch (err) {
    showToast(err.message || "تعذر إتمام الطلب");
  }
}

function renderOrderPage() {
  const el = document.querySelector("[data-order-page]");
  if (!el) return;
  const steps = document.querySelector("[data-checkout-steps]");
  if (steps) steps.innerHTML = checkoutSteps(3);
  let order;
  try {
    order = JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null");
  } catch {
    order = null;
  }
  if (!order) {
    el.innerHTML = `
      <div class="empty-cart">
        <h2>لا يوجد طلب حديث</h2>
        <p class="muted">أكمل الشراء من السلة لإظهار تأكيد الطلب هنا.</p>
        <a class="btn btn-primary" href="/cart">افتح السلة</a>
      </div>`;
    return;
  }
  el.innerHTML = `
    <div class="order-success">
      <div class="success-mark">${ICONS.check}</div>
      <p class="eyebrow">تم استلام طلبك</p>
      <h1>شكراً لك، ${order.customer.name}</h1>
      <p class="muted">رقم الطلب <strong>${order.id}</strong> — سنتواصل على ${order.customer.phone} لتأكيد التسليم.</p>
      <div class="order-wa-actions">
        <a class="btn btn-whatsapp btn-lg" href="${orderWhatsAppUrl(order)}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>تأكيد الطلب عبر واتساب</span></a>
        <p class="muted">يُفتح واتساب برسالة جاهزة فيها كل تفاصيل طلبك للمدير.</p>
      </div>
      <div class="shop-layout">
        <div class="panel">
          <h2>تفاصيل الطلب</h2>
          <ul class="summary-items">
            ${order.items
              .map(
                (i) => `
              <li>
                <img src="${i.image}" alt="${i.name}" />
                <div>
                  <strong>${i.name}</strong>
                  <span class="muted">${i.cpu} · ${i.gpu} · ${i.ram} · ${i.storage}${i.arabization ? " · تعريب كيبورد" : ""}</span>
                </div>
                <b>${i.qty} × ${money(i.price)}</b>
              </li>`
              )
              .join("")}
          </ul>
          ${summaryRows(order)}
        </div>
        <aside class="panel">
          <h2>التسليم والدفع</h2>
          <p><strong>${order.delivery.label}</strong><br /><span class="muted">${order.address.city} — ${order.address.area}، ${order.address.street}</span></p>
          <p><strong>${order.payment.label}</strong><br /><span class="muted">${STORE.warranty}</span></p>
          <a class="btn btn-primary btn-lg" href="/products">العودة للمتجر</a>
        </aside>
      </div>
    </div>
  `;
}

function goSearch(value) {
  const q = (value || "").trim();
  const url = q ? `/products?q=${encodeURIComponent(q)}` : "/products";
  location.href = url;
}

function slidePayload(slide) {
  const p = slide.productId ? PRODUCTS.find((x) => x.id === slide.productId) : null;
  return {
    ...slide,
    name: slide.title,
    image: slide.image || p?.image || "",
    headline: slide.headline || p?.headline || "",
    blurb: slide.blurb || p?.blurb || "",
    gpu: slide.gpu || p?.gpu || "",
    tgp: slide.tgp || p?.tgp || "",
    cooling: slide.cooling || p?.cooling || "",
    screen: slide.screen || p?.screen || "",
    productId: slide.productId || p?.id || "",
    price: p?.price,
    stock: p?.stock,
  };
}

function heroSlidesSource() {
  const fromApi = typeof StoreAPI !== "undefined" && StoreAPI.isStoreReady?.();
  if (typeof SLIDES !== "undefined" && (fromApi || SLIDES.length)) {
    return SLIDES.filter((s) => s.active !== false).map((s) => slidePayload(s));
  }
  return PRODUCTS.filter((p) => p.slide).map((s) => (s.title ? slidePayload(s) : s));
}

function normalizeHeroTextPosition(value) {
  const v = String(value || "default").trim();
  return v === "center" || v === "right" ? v : "default";
}

function applyHeroTextPosition(root, slide) {
  const heroInner = root?.querySelector(".hero-inner");
  if (!root || !heroInner) return;
  root.classList.remove("is-hero-text-center", "is-hero-text-right");
  heroInner.removeAttribute("data-text-position");
  if (slide?.imageOnly) return;
  const pos = normalizeHeroTextPosition(slide?.textPosition);
  if (pos === "center") {
    root.classList.add("is-hero-text-center");
    heroInner.dataset.textPosition = "center";
  } else if (pos === "right") {
    root.classList.add("is-hero-text-right");
    heroInner.dataset.textPosition = "right";
  }
}

function renderSlider() {
  const root = document.querySelector("[data-slider]");
  if (!root) return;
  const layoutBlock = getHomeLayout().find((b) => b.type === "hero");
  if (layoutBlock?.active === false) {
    root.hidden = true;
    if (root._sliderCleanup) root._sliderCleanup();
    return;
  }
  const slides = heroSlidesSource();
  if (!slides.length) {
    root.hidden = true;
    if (root._sliderCleanup) root._sliderCleanup();
    return;
  }
  root.hidden = false;

  const track = root.querySelector("[data-slide-track]");
  const fp = JSON.stringify(
    slides.map((s) =>
      [s.id, s.image, s.videoUrl, s.title, s.productId, s.imageOnly, s.hideSpecs, s.textPosition || "default", s.showAddToCart !== false].join("|")
    )
  );
  const structureChanged = root._sliderFp !== fp;

  if (structureChanged) {
    root._sliderFp = fp;
    if (root._sliderCleanup) root._sliderCleanup();
    if (track) {
      track.innerHTML = [...slides]
        .reverse()
        .map((s) => heroMediaPanelHtml(s.videoUrl, s.image))
        .join("");
    }
    const dotsEl = root.querySelector("[data-slide-dots]");
    if (dotsEl) {
      dotsEl.innerHTML = slides
        .map((_, idx) => `<button data-dot="${idx}" type="button" aria-label="شريحة ${idx + 1}"></button>`)
        .join("");
    }
    if (root._sliderIndex == null || root._sliderIndex >= slides.length) root._sliderIndex = 0;
  }

  root._sliderSlides = slides;

  function moveTrack(index) {
    if (!track) return;
    const offset = (root._sliderSlides.length - 1 - index) * 100;
    track.style.transform = `translate3d(-${offset}%, 0, 0)`;
  }

  function paintContent() {
    const s = root._sliderSlides[root._sliderIndex];
    root.classList.toggle("is-image-only", !!s.imageOnly);
    root.classList.toggle("is-no-specs", !!s.hideSpecs && !s.imageOnly);
    applyHeroTextPosition(root, s);
    const heroInner = root.querySelector(".hero-inner");
    if (heroInner) heroInner.hidden = !!s.imageOnly;
    const specCard = root.querySelector(".spec-card");
    if (specCard) specCard.hidden = !!s.imageOnly || !!s.hideSpecs;
    const chips = root.querySelector(".chips");
    if (chips) {
      chips.innerHTML = [s.chip1, s.chip2].filter(Boolean).map((t) => `<span class="chip">${t}</span>`).join("");
    }
    root.querySelector("[data-slide-name]").textContent = s.name || s.title;
    root.querySelector("[data-slide-head]").textContent = s.headline || "";
    root.querySelector("[data-slide-blurb]").textContent = s.blurb || "";
    const priceEl = root.querySelector("[data-slide-price]");
    if (priceEl) {
      const showPrice = s.productId && inStock({ stock: s.stock });
      priceEl.hidden = !showPrice;
      priceEl.textContent = showPrice ? money(s.price) : "";
    }
    root.querySelector("[data-slide-gpu]").textContent = s.gpu || "";
    root.querySelector("[data-slide-tgp]").textContent = s.tgp || "";
    root.querySelector("[data-slide-cool]").textContent = s.cooling || "";
    root.querySelector("[data-slide-screen]").textContent = s.screen || "";
    const link = root.querySelector("[data-slide-link]");
    if (link) link.href = s.productId ? productUrl(s.productId) : "/products";
    const addBtn = root.querySelector("[data-slide-add]");
    if (addBtn) {
      const showAdd = s.productId && isCartEnabled() && s.showAddToCart !== false;
      if (showAdd) {
        addBtn.dataset.add = s.productId;
        addBtn.disabled = !inStock({ stock: s.stock });
        addBtn.textContent = inStock({ stock: s.stock }) ? "أضف إلى السلة" : "غير متوفر";
        addBtn.hidden = false;
      } else {
        addBtn.hidden = true;
        addBtn.removeAttribute("data-add");
      }
    }
    root.querySelectorAll("[data-dot]").forEach((dot, idx) => {
      dot.classList.toggle("on", idx === root._sliderIndex);
    });
    syncHeroMedia();
  }

  function syncHeroMedia() {
    if (!track) return;
    const list = root._sliderSlides || [];
    [...track.children].forEach((panel, domIdx) => {
      const slideIdx = list.length - 1 - domIdx;
      const active = slideIdx === root._sliderIndex;
      const iframe = panel.querySelector("iframe[data-yt-src]");
      const video = panel.querySelector("video");
      const ytId = panel.dataset.ytId || youtubeIdFromUrl(iframe?.dataset.ytSrc || "");

      if (iframe && ytId) {
        ensureYoutubeFrame(iframe, ytId, active);

        if (!iframe.dataset.ytApiBound) {
          iframe.dataset.ytApiBound = "1";
          iframe.addEventListener("load", () => {
            youtubeCommand(iframe, "mute");
            const stillActive =
              list.length - 1 - [...track.children].indexOf(panel) === root._sliderIndex;
            if (stillActive) {
              youtubeCommand(iframe, "playVideo");
              panel.classList.add("is-yt-playing");
            } else {
              youtubeCommand(iframe, "pauseVideo");
              panel.classList.remove("is-yt-playing");
            }
          });
        }

        if (active) {
          // أول ظهور: حمّل مع autoplay حتى يشتغل حتى لو فشل postMessage
          if (!iframe.getAttribute("src")) {
            iframe.setAttribute("src", youtubeBackgroundEmbedUrl(ytId, { autoplay: true }));
          } else {
            youtubeCommand(iframe, "mute");
            youtubeCommand(iframe, "playVideo");
          }
          window.clearTimeout(panel._ytRevealTimer);
          panel._ytRevealTimer = window.setTimeout(() => panel.classList.add("is-yt-playing"), 200);
        } else {
          if (iframe.getAttribute("src")) {
            youtubeCommand(iframe, "pauseVideo");
          }
          window.clearTimeout(panel._ytRevealTimer);
          panel.classList.remove("is-yt-playing");
        }
      }

      if (video) {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.loop = true;
        if (active) {
          const playPromise = video.play();
          if (playPromise?.catch) playPromise.catch(() => {});
        } else {
          video.pause();
        }
      }
    });
  }

  function go(n, instant = false) {
    const list = root._sliderSlides;
    if (root._sliderAnimating && !instant) return;
    const next = (n + list.length) % list.length;
    if (next === root._sliderIndex && !instant) return;

    if (instant) {
      root._sliderIndex = next;
      moveTrack(root._sliderIndex);
      paintContent();
      return;
    }

    root._sliderAnimating = true;
    root.classList.add("is-sliding");
    moveTrack(next);
    root._sliderIndex = next;

    window.setTimeout(() => {
      paintContent();
      root.classList.remove("is-sliding");
      root._sliderAnimating = false;
    }, 420);
  }

  function play() {
    clearInterval(root._sliderTimer);
    root._sliderTimer = null;
    if (root._sliderHover || root._sliderPress) return;
    if (!root._sliderSlides || root._sliderSlides.length < 2) return;
    root._sliderTimer = setInterval(() => go(root._sliderIndex + 1), 6500);
  }

  function pauseAuto() {
    clearInterval(root._sliderTimer);
    root._sliderTimer = null;
  }

  root._sliderGo = go;
  root._sliderPlay = play;
  root._sliderPause = pauseAuto;
  root._sliderCleanup = () => clearInterval(root._sliderTimer);

  bindAutoplayEngagePause(root, {
    isHover: () => !!root._sliderHover,
    isPress: () => !!root._sliderPress,
    setHover: (v) => {
      root._sliderHover = v;
    },
    setPress: (v) => {
      root._sliderPress = v;
    },
    pause: () => root._sliderPause?.(),
    play: () => root._sliderPlay?.(),
  });

  if (!root.dataset.sliderBound) {
    root.dataset.sliderBound = "1";
    root.addEventListener("click", (e) => {
      const api = e.currentTarget;
      if (e.target.closest("[data-prev]")) {
        api._sliderGo(api._sliderIndex - 1);
        api._sliderPlay();
        return;
      }
      if (e.target.closest("[data-next]")) {
        api._sliderGo(api._sliderIndex + 1);
        api._sliderPlay();
        return;
      }
      const dot = e.target.closest("[data-dot]");
      if (dot) {
        api._sliderGo(Number(dot.dataset.dot));
        api._sliderPlay();
        return;
      }
      if (e.target.closest("a, button, input, textarea, select, .slider-nav")) return;
      const slideLink = api.querySelector("[data-slide-link]");
      if (slideLink?.href) location.href = slideLink.href;
    });
    let touchX = 0;
    root.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );
    root.addEventListener(
      "touchend",
      (e) => {
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) < 48) return;
        if (dx > 0) root._sliderGo(root._sliderIndex - 1);
        else root._sliderGo(root._sliderIndex + 1);
        root._sliderPlay();
      },
      { passive: true }
    );
  }

  if (structureChanged) {
    go(root._sliderIndex, true);
    play();
  } else {
    moveTrack(root._sliderIndex);
    paintContent();
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-back-page]")) {
    if (window.history.length > 1) window.history.back();
    else location.href = "/products";
    return;
  }

  const pdpPrev = e.target.closest("[data-pdp-prev]");
  if (pdpPrev) {
    const gallery = document.querySelector("[data-pdp-gallery]");
    gallery?._pdpGo?.((gallery._pdpIndex?.() ?? 0) - 1);
    return;
  }
  const pdpNext = e.target.closest("[data-pdp-next]");
  if (pdpNext) {
    const gallery = document.querySelector("[data-pdp-gallery]");
    gallery?._pdpGo?.((gallery._pdpIndex?.() ?? 0) + 1);
    return;
  }
  const pdpDot = e.target.closest("[data-pdp-dot]");
  if (pdpDot) {
    const gallery = document.querySelector("[data-pdp-gallery]");
    gallery?._pdpGo?.(Number(pdpDot.dataset.pdpDot));
    return;
  }

  const thumb = e.target.closest("[data-pdp-thumb]");
  if (thumb) {
    const gallery = document.querySelector("[data-pdp-gallery]");
    const idx = thumb.dataset.pdpIdx != null ? Number(thumb.dataset.pdpIdx) : null;
    if (gallery?._pdpGo && idx != null) gallery._pdpGo(idx);
    else {
      const main = document.querySelector("[data-pdp-main]");
      if (main) main.src = thumb.dataset.pdpThumb;
      document.querySelectorAll(".pdp-thumb").forEach((btn) => btn.classList.toggle("on", btn === thumb));
    }
    return;
  }

  const add = e.target.closest("[data-add]");
  if (add) {
    void addToCart(add.dataset.add, { arabization: !!document.querySelector("[data-pdp-arabization]:checked") });
  }

  const qty = e.target.closest("[data-qty]");
  if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.delta));

  const remove = e.target.closest("[data-remove]");
  if (remove) removeFromCart(remove.dataset.remove);

  if (e.target.closest("[data-open-cart]")) openCart();
  if (e.target.closest("[data-close-cart]")) closeCart();
  if (e.target.closest("[data-checkout]")) checkout();
  if (e.target.closest("[data-menu]")) {
    toggleMobileNav();
  }
  if (e.target.closest("[data-close-nav]")) {
    closeMobileNav();
  }
  if (e.target.closest("[data-mobile-nav] a")) {
    closeMobileNav();
  }
  if (e.target.closest("[data-filter-reset]")) {
    document.querySelectorAll("[data-price-min], [data-price-max], [data-search]").forEach((el) => {
      el.value = "";
    });
    document.querySelectorAll("[data-brand-filter]").forEach((el) => {
      el.checked = false;
    });
    const filter = document.querySelector("[data-filter]");
    if (filter) filter.value = "all";
    renderCatalog();
    closeFiltersDrawer();
  }
  if (e.target.closest("[data-filter-toggle]")) {
    document.body.classList.toggle("filters-open");
  }
  if (e.target.closest("[data-filter-close]")) {
    closeFiltersDrawer();
  }
  if (e.target.closest("[data-filter-apply]")) {
    renderCatalog();
    closeFiltersDrawer();
  }
  if (!e.target.closest("a, button, input, select, textarea")) {
    const card = e.target.closest("[data-product-link]");
    if (card) location.href = productUrl(card.dataset.productLink);
  }
});

document.addEventListener("input", (e) => {
  if (e.target.matches("[data-search], [data-sort], [data-price-min], [data-price-max]")) {
    renderCatalog();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.matches("[data-brand-filter], [data-filter]")) {
    renderCatalog();
  }
  if (e.target.matches("[data-ship-estimate]")) {
    setShipMethod(e.target.value);
    renderCartPage();
    renderCheckout();
  }
});

function setupHeaderSearch() {
  const box = document.querySelector("[data-search-box]");
  const input = document.querySelector("[data-header-search]");
  const toggle = document.querySelector("[data-search-toggle]");
  if (!box || !input || !toggle) return;
  if (box.dataset.searchReady === "1") return;
  box.dataset.searchReady = "1";

  if (typeof paintSearchToggleIcons === "function") paintSearchToggleIcons();

  let panel = box.querySelector(".header-search-panel");
  let closeBtn = box.querySelector("[data-search-close]");
  let submitBtn = box.querySelector("[data-search-submit]");

  if (!closeBtn) {
    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "search-close";
    closeBtn.dataset.searchClose = "";
    closeBtn.setAttribute("aria-label", "إغلاق البحث");
    closeBtn.innerHTML = ICONS.close;
  }

  if (!panel) {
    panel = document.createElement("div");
    panel.className = "header-search-panel";
    panel.hidden = true;
    submitBtn = document.createElement("button");
    submitBtn.type = "button";
    submitBtn.className = "search-submit";
    submitBtn.dataset.searchSubmit = "";
    submitBtn.textContent = "بحث";
    panel.append(input, closeBtn, submitBtn);
    box.appendChild(panel);
  } else {
    submitBtn = box.querySelector("[data-search-submit]");
  }

  if (!toggle.querySelector(".search-ico-open")) {
    toggle.innerHTML = `${ICONS.search}<span class="search-label" hidden>بحث</span>`;
    toggle.classList.add("has-icons");
  }

  const mobileSearchMq = window.matchMedia("(max-width: 1020px)");
  const isMobileSearch = () => mobileSearchMq.matches;

  function syncSearchToggle(open) {
    const mobile = isMobileSearch();
    toggle.classList.toggle("is-open", open && !mobile);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? (mobile ? "إغلاق البحث" : "تنفيذ البحث") : "فتح البحث");
    toggle.querySelector(".search-ico-open")?.toggleAttribute("hidden", open && !mobile);
    toggle.querySelector(".search-label")?.toggleAttribute("hidden", !open || mobile);
    panel.hidden = !open;
    document.body.classList.toggle("search-open", open);
  }

  function openSearch() {
    box.classList.add("open");
    syncSearchToggle(true);
    requestAnimationFrame(() => input.focus());
  }

  function closeSearch() {
    box.classList.remove("open");
    syncSearchToggle(false);
    input.blur();
  }

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    if (!box.classList.contains("open")) {
      openSearch();
      return;
    }
    if (isMobileSearch()) {
      closeSearch();
      return;
    }
    if (input.value.trim()) goSearch(input.value);
    else input.focus();
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    closeSearch();
    toggle.focus();
  });

  submitBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (input.value.trim()) goSearch(input.value);
    else input.focus();
  });

  box.addEventListener("submit", (e) => {
    if (!input.value.trim()) {
      e.preventDefault();
      closeSearch();
    }
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.value.trim()) goSearch(input.value);
    }
    if (e.key === "Escape") {
      closeSearch();
      toggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!box.classList.contains("open")) return;
    if (!e.target.closest("[data-search-box]")) closeSearch();
  });

  mobileSearchMq.addEventListener("change", () => {
    if (box.classList.contains("open")) syncSearchToggle(true);
  });

  if (input.value.trim()) {
    box.classList.add("open");
    syncSearchToggle(true);
  } else {
    syncSearchToggle(false);
  }
}

document.querySelector("[data-contact-form]")?.addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  showToast("وصلت رسالتك. سنرد خلال ساعات العمل");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeImageZoom();
    closeCartPrompt();
    closeMobileNav();
    return;
  }
  const zoom = document.getElementById("pdp-zoom-layer");
  if (!zoom?.classList.contains("open")) return;
  if (e.key === "ArrowRight") zoom._step?.(1);
  if (e.key === "ArrowLeft") zoom._step?.(-1);
});

document.querySelector("[data-checkout-form]")?.addEventListener("submit", (e) => {
  e.preventDefault();
  placeOrder(e.target);
});

function initHomeEffects() {
  if (document.body.dataset.page !== "home") return;
  const root = document.querySelector("[data-home-root]");
  if (!root) return;

  requestAnimationFrame(() => {
    document.body.classList.add("home-ready");
  });

  const targets = root.querySelectorAll("[data-home-block], [data-home-root] > .section");
  targets.forEach((el) => {
    if (el.dataset.homeBlock === "hero") return;
    el.classList.add("home-reveal");
    if (el.classList.contains("is-visible")) return;
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  if (!initHomeEffects._io) {
    initHomeEffects._io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          initHomeEffects._io.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );
  }

  targets.forEach((el) => {
    if (el.dataset.homeBlock === "hero" || el.classList.contains("is-visible")) return;
    initHomeEffects._io.observe(el);
  });
}

async function bootStorefront() {
  if (typeof SitePages !== "undefined") SitePages.init();
  setupHeaderSearch();
  setupMobileNav();
  initTouchPanStrips();
  if (document.querySelector("[data-catalog]")) renderCatalog();
  if (document.querySelector("[data-product]")) renderProductPage();
  try {
    await StoreAPI.bootstrap();
  } catch {
    showToast("تعذر تحميل بيانات المتجر");
  }
  if (isMaintenanceMode()) {
    renderMaintenancePage();
    return;
  }
  applyStoreBranding();
  applyStorefrontCartMode();
  renderHeaderBrands();
  renderCategoryFilter();
  applyUrlFilters();
  renderShopFilters();
  renderSlider();
  renderNewProductsSlider();
  renderFeatured();
  renderOfficeGallery();
  applyHomeLayout();
  initHomeEffects();
  renderCatalog();
  renderProductPage();
  setupCheckoutForm();
  renderCart();
  renderCartPage();
  renderCheckout();
  renderOrderPage();
  applyStoreBranding();
}

window.refreshStorefrontViews = function refreshStorefrontViews() {
  clearProductSliderCaches();
  if (isMaintenanceMode()) {
    renderMaintenancePage();
    return;
  }
  if (typeof SitePages !== "undefined") SitePages.paintLinks();
  applyStoreBranding();
  applyStorefrontCartMode();
  renderHeaderBrands();
  renderCategoryFilter();
  renderShopFilters();
  renderNewProductsSlider();
  renderFeatured();
  renderOfficeGallery();
  applyHomeLayout();
  initHomeEffects();
  renderCatalog();
  renderProductPage();
  setupMobileNav();
  renderSlider();
  renderCart();
  renderCartPage();
  renderCheckout();
  setupCheckoutForm();
  setupHeaderSearch();
  initTouchPanStrips();
};

window.addEventListener("store:updated", () => {
  window.refreshStorefrontViews();
});

bootStorefront();
