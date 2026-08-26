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
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 8V7a5 5 0 0 1 10 0v1h3v13H4V8zm2 0h6V7a3 3 0 0 0-6 0z"/></svg>',
  truck:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6h11v10H3zm12 3h4l3 4v3h-7zm-9 9.5A1.5 1.5 0 1 0 7.5 18 1.5 1.5 0 0 0 6 18.5zm11 0A1.5 1.5 0 1 0 18.5 18 1.5 1.5 0 0 0 17 18.5z"/></svg>',
  card: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 6h18v12H3zm2 4h14V8H5z"/></svg>',
  searchEmpty:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10 4a6 6 0 1 0 3.8 10.7L19 19.6 20.4 18l-5.2-5.2A6 6 0 0 0 10 4m0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8M4 20h16v2H4z"/></svg>',
};

function money(n) {
  const value = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  return `${value} IQD`;
}

function resolveAsset(src) {
  if (!src) return "img/logo.jpg";
  if (src.startsWith("data:") || src.startsWith("http") || src.startsWith("/")) return src;
  return src;
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

  const footerTitle = document.querySelector(".site-footer .footer-grid > div:first-child h3");
  if (footerTitle) footerTitle.textContent = s.nameAr || s.name;

  const footerDesc = document.querySelector(".site-footer .footer-grid > div:first-child p");
  if (footerDesc && footerDesc.closest(".site-footer")) {
    footerDesc.textContent = `متجر متخصص بلابتوبات القيمنق والإنتاج في العراق، بأسعار ${s.currency || "IQD"} و${s.warranty}.`;
  }

  const footerContact = document.querySelector("[data-store-footer-contact]");
  if (footerContact) {
    footerContact.innerHTML = `
      <li>${s.fullAddress || s.address}</li>
      <li>${s.phone}</li>
      <li>${s.email}</li>
      <li>${s.hours}</li>
      <li><a href="contact.html">نموذج التواصل</a></li>
      <li><a href="admin/login.html">لوحة التحكم</a></li>
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
      <a class="btn btn-ghost" href="products.html" style="margin-top: 18px">العودة للمنتجات</a>
    `;
  }

  const warrantyBlurb = document.querySelector("[data-store-warranty-blurb]");
  if (warrantyBlurb) {
    warrantyBlurb.textContent = `كفالة حقيقية وصيانة في مكتب ${s.city}: ${s.address}.`;
  }

  const rail = document.querySelector(".site-rail");
  if (rail) {
    const wa = storeWhatsAppNumber();
    rail.innerHTML = `
      <a href="https://wa.me/${wa}" target="_blank" rel="noopener">واتساب</a>
      <a href="tel:+${wa}">اتصال</a>
      <a href="cart.html">السلة</a>
      <a href="contact.html">المكتب</a>
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
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  renderCart();
  renderCartPage();
  renderCheckout();
}

function getShipMethod() {
  const saved = sessionStorage.getItem(SHIP_KEY);
  const valid = STORE.shipping.some((s) => s.id === saved);
  return valid ? saved : STORE.shipping[0]?.id || "baghdad";
}

function setShipMethod(id) {
  if (STORE.shipping.some((s) => s.id === id)) {
    sessionStorage.setItem(SHIP_KEY, id);
  }
}

function shipOption(id) {
  return STORE.shipping.find((s) => s.id === (id || getShipMethod())) || STORE.shipping[0];
}

function payOption(id) {
  return STORE.payments.find((p) => p.id === id) || STORE.payments[0];
}

function addToCart(id, opts = {}) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
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
  if (existing) existing.qty = next;
  else {
    const line = { id, qty: 1 };
    if (arabization) line.arabization = true;
    cart.push(line);
  }
  setCart(cart);
  renderCart();
  showCartPrompt(product, arabization);
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
        <a class="btn btn-primary" href="cart.html">الذهاب إلى السلة</a>
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
  const product = PRODUCTS.find((p) => p.id === id);
  const cart = getCart()
    .map((i) => {
      if (i.id !== id || !!i.arabization !== arabization) return i;
      let qty = i.qty + delta;
      if (product && qty > product.stock) qty = product.stock;
      return { ...i, qty };
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
    product: PRODUCTS.find((p) => p.id === item.id),
  }));
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
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
  const shipping = items.length ? shipOption(shipId).fee : 0;
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
    { n: 1, id: "cart", label: "السلة", href: "cart.html" },
    { n: 2, id: "pay", label: "الدفع", href: "checkout.html" },
    { n: 3, id: "done", label: "التأكيد", href: "order.html" },
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

function productCard(p, opts = {}) {
  const off = discount(p);
  const oos = !inStock(p);
  const cls = opts.catalog ? "product-card catalog-card" : "product-card";
  const lazy = opts.catalog ? ' loading="lazy" decoding="async"' : "";
  return `
    <article class="${cls} ${oos ? "is-oos" : ""}" data-product-link="${p.id}">
      <a class="pc-media" href="product.html?id=${p.id}">
        <img src="${p.image}" alt="${p.name}"${lazy} />
        <span class="badge">${p.tag}</span>
        ${off && !oos ? `<span class="badge badge-sale">خصم ${off}%</span>` : ""}
        ${oos ? `<span class="oos-ribbon">غير متوفر</span>` : ""}
      </a>
      <div class="card-body">
        <p class="pc-meta">${p.brand}</p>
        <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <p class="muted">${p.specs}</p>
        ${
          oos
            ? ""
            : `<div class="price">
          <b>${money(p.price)}</b>
          ${p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : ""}
        </div>`
        }
        <div class="pc-actions">
          <a class="btn btn-ghost" href="product.html?id=${p.id}">التفاصيل</a>
          ${
            oos
              ? `<button class="btn btn-ghost" type="button" disabled>غير متوفر</button>`
              : `<button class="btn btn-primary" data-add="${p.id}">للسلة</button>`
          }
        </div>
      </div>
    </article>
  `;
}

function getSliderProducts(cfg = {}) {
  const ids = Array.isArray(cfg.productIds) ? cfg.productIds.filter(Boolean) : [];
  if (ids.length) {
    return ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);
  }
  const cat = cfg.category || "all";
  const limit = Number(cfg.limit) || 8;
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

function productSliderSectionHtml(cfg) {
  const eyebrow = cfg.eyebrow ? `<p class="eyebrow">${cfg.eyebrow}</p>` : "";
  return `
    <section class="section product-slider-section" data-product-slider="${cfg.id}">
      <div class="container">
        <div class="section-head">
          <div>${eyebrow}<h2>${cfg.title || ""}</h2></div>
          <a class="btn btn-ghost" href="${cfg.linkUrl || "products.html"}">كل المنتجات</a>
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
    const speed = Number(root._productSliderCfg?.speedMs) || 4500;
    if (root._productSliderCfg?.autoplay === false) return;
    root._productSliderTimer = setInterval(() => {
      const max = maxOffset();
      if (max <= 0) return;
      if (offsetPx >= max - 1) offsetPx = 0;
      else offsetPx = clampOffset(offsetPx + stepPx());
      applyTransform(false);
    }, speed);
  }

  let hovered = false;

  function pauseAuto() {
    clearInterval(root._productSliderTimer);
  }

  root._productSliderShift = shiftBy;
  root._productSliderPlay = play;
  root._productSliderPause = pauseAuto;
  root._productSliderCleanup = () => {
    clearInterval(root._productSliderTimer);
    if (root._productSliderResize) window.removeEventListener("resize", root._productSliderResize);
  };

  if (!root.dataset.productSliderBound) {
    root.dataset.productSliderBound = "1";
    root.tabIndex = 0;
    root.addEventListener("mouseenter", () => {
      hovered = true;
      pauseAuto();
    });
    root.addEventListener("mouseleave", () => {
      hovered = false;
      play();
    });
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
        if (!hovered) api._productSliderPlay();
      }
      if (e.target.closest("[data-ps-next]")) {
        api._productSliderShift(1);
        if (!hovered) api._productSliderPlay();
      }
    });

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest("button, a, [data-add]")) return;
      dragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartOffset = offsetPx;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add("is-dragging");
      pauseAuto();
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 4) dragMoved = true;
      offsetPx = clampOffset(dragStartOffset - dx);
      applyTransform(true);
    });

    const endDrag = (e) => {
      if (!dragging) return;
      dragging = false;
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      viewport.classList.remove("is-dragging");
      snapToNearest(false);
      if (!hovered) play();
    };
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);

    viewport.addEventListener(
      "click",
      (e) => {
        if (dragMoved) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
  }

  if (!root._productSliderResize) {
    root._productSliderResize = () => snapToNearest(true);
    window.addEventListener("resize", root._productSliderResize);
  }

  snapToNearest(true);
  if (!hovered) play();
}

function renderFeatured() {
  const mount = document.querySelector("[data-product-sliders]");
  if (!mount) return;

  let sliders = typeof PRODUCT_SLIDERS !== "undefined" && PRODUCT_SLIDERS.length ? PRODUCT_SLIDERS : [];
  if (!sliders.length && STORE.featured) {
    sliders = [{ id: "legacy", active: true, ...STORE.featured, linkUrl: "products.html" }];
  }
  sliders = sliders.filter((s) => s.active !== false);

  const fp = JSON.stringify(
    sliders.map((s) => [s.id, s.title, s.category, s.limit, ...(s.productIds || [])].join("|"))
  );

  if (mount._productSlidersFp !== fp) {
    mount.querySelectorAll("[data-product-slider]").forEach((node) => node._productSliderCleanup?.());
    mount._productSlidersFp = fp;

    if (!sliders.length) {
      mount.innerHTML = "";
      return;
    }

    mount.innerHTML = sliders.map(productSliderSectionHtml).join("");
    sliders.forEach((cfg) => {
      const root = mount.querySelector(`[data-product-slider="${cfg.id}"]`);
      if (!root) return;
      const products = getSliderProducts(cfg);
      const track = root.querySelector("[data-product-track]");
      if (!products.length) {
        root.hidden = true;
        return;
      }
      root.hidden = false;
      if (track) track.innerHTML = products.map(productCard).join("");
      initProductSlider(root, products, cfg);
    });
  }
}

function renderNewProductsSlider() {
  const mount = document.querySelector("[data-new-products]");
  if (!mount) return;
  const products = getSliderProducts({ category: "new", limit: 10 });
  const fp = products.map((p) => p.id).join("|");
  if (mount._newProductsFp === fp && mount.querySelector("[data-product-slider]")) return;
  mount._newProductsFp = fp;

  if (!products.length) {
    mount.innerHTML = "";
    return;
  }

  const cfg = {
    id: "new-arrivals",
    eyebrow: "وصل حديثاً",
    title: "أحدث المنتجات",
    autoplay: true,
    speedMs: 4200,
    linkUrl: "products.html",
  };

  mount.innerHTML = productSliderSectionHtml(cfg);
  const root = mount.querySelector(`[data-product-slider="${cfg.id}"]`);
  if (!root) return;
  const track = root.querySelector("[data-product-track]");
  if (track) track.innerHTML = products.map(productCard).join("");
  initProductSlider(root, products, cfg);
}

function getStoreBrands() {
  if (typeof BRANDS !== "undefined" && BRANDS.length) return BRANDS;
  return [...new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))].map((name) => ({ name }));
}

function renderHeaderBrands() {
  const el = document.querySelector("[data-header-brands]");
  if (!el) return;
  const brands = getStoreBrands();
  el.innerHTML = brands
    .map(
      (b) =>
        `<a href="products.html?brand=${encodeURIComponent(b.name)}" class="header-brand-link">${b.name}</a>`
    )
    .join("");
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
  const id = new URLSearchParams(location.search).get("id");
  const p = PRODUCTS.find((item) => item.id === id);
  if (!p) {
    el.innerHTML = `<p class="empty">الجهاز غير موجود. <a href="products.html">العودة للمتجر</a></p>`;
    return;
  }
  document.title = `${p.name} | ${STORE.nameAr || "بيست لابتوب"}`;
  const off = discount(p);
  const oos = !inStock(p);
  const images = (Array.isArray(p.images) && p.images.length ? p.images : [p.image]).filter(Boolean);
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
      <span aria-hidden="true">→</span> رجوع
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
          ? `<div class="pdp-thumbs">${images
              .map(
                (src, i) =>
                  `<button type="button" class="pdp-thumb ${i === 0 ? "on" : ""}" data-pdp-thumb="${src}" data-pdp-idx="${i}"><img src="${src}" alt="" /></button>`
              )
              .join("")}</div>`
          : ""
      }
      ${addonHtml}
    </div>
    <div class="pdp-info">
      <p class="eyebrow">${p.brand} · ${catLabel(p.category)}</p>
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
      <div class="hero-cta" style="margin-top: 18px">
        ${
          oos
            ? `<button class="btn btn-ghost" type="button" disabled>غير متوفر</button>`
            : `<button class="btn btn-primary" data-add="${p.id}">أضف إلى السلة</button>`
        }
        <a class="btn btn-ghost" href="products.html">كل المنتجات</a>
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
  setupPdpArabization(p);
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
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = cartCount();
  });
  const list = document.querySelector("[data-cart-items]");
  const total = document.querySelector("[data-cart-total]");
  if (!list) return;
  const { items, subtotal } = cartPricing();
  list.innerHTML = items.length
    ? items
        .map(
          (i) => `
        <div class="cart-item">
          <a href="product.html?id=${i.id}"><img src="${i.product.image}" alt="${i.product.name}" /></a>
          <div>
            <strong><a href="product.html?id=${i.id}">${i.product.name}</a></strong>
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
  document.querySelector("[data-overlay]")?.classList.add("open");
  document.querySelector("[data-drawer]")?.classList.add("open");
}

function closeCart() {
  document.querySelector("[data-overlay]")?.classList.remove("open");
  document.querySelector("[data-drawer]")?.classList.remove("open");
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
  if (!getCart().length) {
    showToast("أضف جهازاً أولاً");
    return;
  }
  location.href = "checkout.html";
}

function renderCartPage() {
  const el = document.querySelector("[data-cart-page]");
  if (!el) return;
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
        <a class="btn btn-primary" href="products.html">تصفح المنتجات</a>
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
            <a class="cart-line-media" href="product.html?id=${i.id}">
              <img src="${i.product.image}" alt="${i.product.name}" />
            </a>
            <div class="cart-line-info">
              <p class="eyebrow">${i.product.brand}</p>
              <h3><a href="product.html?id=${i.id}">${i.product.name}</a></h3>
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
        <a class="btn btn-primary btn-lg" href="checkout.html">المتابعة للدفع</a>
        <a class="btn btn-ghost" href="products.html">متابعة التسوق</a>
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
  if (location.pathname.endsWith("checkout.html") && new URLSearchParams(location.search).get("done") === "1") {
    location.replace("order.html");
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
          <a class="btn btn-primary" href="products.html">العودة للمتجر</a>
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
    location.href = "order.html";
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
        <a class="btn btn-primary" href="cart.html">افتح السلة</a>
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
        <a class="btn btn-whatsapp btn-lg" href="${orderWhatsAppUrl(order)}" target="_blank" rel="noopener">تأكيد الطلب عبر واتساب</a>
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
          <a class="btn btn-primary btn-lg" href="products.html">العودة للمتجر</a>
        </aside>
      </div>
    </div>
  `;
}

function renderSiteRail() {
  if (document.querySelector(".site-rail")) return;
  document.body.insertAdjacentHTML(
    "beforeend",
    `<aside class="site-rail" aria-label="تواصل سريع">
      <a href="https://wa.me/${storeWhatsAppNumber()}" target="_blank" rel="noopener">واتساب</a>
      <a href="tel:+${storeWhatsAppNumber()}">اتصال</a>
      <a href="cart.html">السلة</a>
      <a href="contact.html">المكتب</a>
    </aside>`
  );
}

function goSearch(value) {
  const q = (value || "").trim();
  const url = q ? `products.html?q=${encodeURIComponent(q)}` : "products.html";
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

function renderSlider() {
  const root = document.querySelector("[data-slider]");
  if (!root) return;
  const slides = (typeof SLIDES !== "undefined" && SLIDES.length ? SLIDES : PRODUCTS.filter((p) => p.slide)).map((s) =>
    s.title ? slidePayload(s) : s
  );
  if (!slides.length) {
    root.hidden = true;
    if (root._sliderCleanup) root._sliderCleanup();
    return;
  }
  root.hidden = false;

  const track = root.querySelector("[data-slide-track]");
  const fp = JSON.stringify(slides.map((s) => [s.id, s.image, s.videoUrl, s.title, s.productId].join("|")));
  const structureChanged = root._sliderFp !== fp;

  if (structureChanged) {
    root._sliderFp = fp;
    if (root._sliderCleanup) root._sliderCleanup();
    if (track) {
      track.innerHTML = [...slides]
        .reverse()
        .map((s) => {
          if (s.videoUrl) {
            return `<div class="slider-panel slider-panel-video"><video src="${resolveAsset(s.videoUrl)}" autoplay muted loop playsinline></video></div>`;
          }
          return `<div class="slider-panel" style="background-image:url('${resolveAsset(s.image)}')"></div>`;
        })
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
    if (link) link.href = s.productId ? `product.html?id=${s.productId}` : "products.html";
    const addBtn = root.querySelector("[data-slide-add]");
    if (addBtn) {
      if (s.productId) {
        addBtn.dataset.add = s.productId;
        addBtn.disabled = !inStock({ stock: s.stock });
        addBtn.textContent = inStock({ stock: s.stock }) ? "أضف إلى السلة" : "غير متوفر";
        addBtn.hidden = false;
      } else {
        addBtn.hidden = true;
      }
    }
    root.querySelectorAll("[data-dot]").forEach((dot, idx) => {
      dot.classList.toggle("on", idx === root._sliderIndex);
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
    root._sliderTimer = setInterval(() => go(root._sliderIndex + 1), 6500);
  }

  root._sliderGo = go;
  root._sliderPlay = play;
  root._sliderCleanup = () => clearInterval(root._sliderTimer);

  if (!root.dataset.sliderBound) {
    root.dataset.sliderBound = "1";
    root.addEventListener("click", (e) => {
      const api = e.currentTarget;
      if (e.target.closest("[data-prev]")) {
        api._sliderGo(api._sliderIndex - 1);
        api._sliderPlay();
      }
      if (e.target.closest("[data-next]")) {
        api._sliderGo(api._sliderIndex + 1);
        api._sliderPlay();
      }
      const dot = e.target.closest("[data-dot]");
      if (dot) {
        api._sliderGo(Number(dot.dataset.dot));
        api._sliderPlay();
      }
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
    else location.href = "products.html";
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
    const arabization = !!document.querySelector("[data-pdp-arabization]:checked");
    addToCart(add.dataset.add, { arabization });
  }

  const qty = e.target.closest("[data-qty]");
  if (qty) changeQty(qty.dataset.qty, Number(qty.dataset.delta));

  const remove = e.target.closest("[data-remove]");
  if (remove) removeFromCart(remove.dataset.remove);

  if (e.target.closest("[data-open-cart]")) openCart();
  if (e.target.closest("[data-close-cart]")) closeCart();
  if (e.target.closest("[data-checkout]")) checkout();
  if (e.target.closest("[data-menu]")) {
    document.body.classList.toggle("nav-open");
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
    if (card) location.href = `product.html?id=${card.dataset.productLink}`;
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

  function openSearch() {
    box.classList.add("open");
    requestAnimationFrame(() => input.focus());
  }

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    if (!box.classList.contains("open")) {
      openSearch();
      return;
    }
    if (input.value.trim()) goSearch(input.value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goSearch(input.value);
    }
    if (e.key === "Escape") {
      box.classList.remove("open");
      toggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-search-box]") && !input.value.trim()) {
      box.classList.remove("open");
    }
  });

  if (input.value.trim()) box.classList.add("open");
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

async function bootStorefront() {
  try {
    await StoreAPI.bootstrap();
  } catch {
    showToast("تعذر تحميل بيانات المتجر");
  }
  applyStoreBranding();
  renderHeaderBrands();
  renderCategoryFilter();
  applyUrlFilters();
  renderShopFilters();
  renderSlider();
  renderNewProductsSlider();
  renderFeatured();
  renderCatalog();
  renderProductPage();
  setupCheckoutForm();
  renderCart();
  renderCartPage();
  renderCheckout();
  renderOrderPage();
  renderSiteRail();
  applyStoreBranding();
  setupHeaderSearch();
}

window.addEventListener("store:updated", () => {
  applyStoreBranding();
  renderHeaderBrands();
  renderCategoryFilter();
  renderShopFilters();
  renderNewProductsSlider();
  renderFeatured();
  renderCatalog();
  renderProductPage();
  renderSlider();
  renderCartPage();
  renderCheckout();
  setupCheckoutForm();
});

bootStorefront();
