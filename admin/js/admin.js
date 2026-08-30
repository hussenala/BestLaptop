const ICO = {
  dash: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h7v9H4zm9 0h7v5h-7zM4 15h7v5H4zm9-4h7v9h-7z"/></svg>',
  box: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 7 12 3l9 4v10l-9 4-9-4zm9 2 7-3-7-3-7 3z"/></svg>',
  cat: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 6h7v5H4zm9 0h7v5h-7zM4 13h7v5H4zm9 0h7v5h-7z"/></svg>',
  brand: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6z"/></svg>',
  orders: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 4h10l1 4H6zm-1 6h12v10H6zm3 2v6h2v-6zm4 0v6h2v-6z"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 8v-1a6 6 0 0 1 16 0v1z"/></svg>',
  tag: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 12 12 2h8v8L10 22zM17 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg>',
  stock: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 18V8l8-4 8 4v10l-8 4z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 9.5 9H3l5.2 3.8L6 19l6-4 6 4-2.2-6.2L21 9h-6.5z"/></svg>',
  featured: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M13 2 15 9h7l-5.5 4 2 7L13 17l-5.5 3 2-7L4 9h7z"/></svg>',
  layout: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 5h16v4H4zm0 6h10v4H4zm0 6h16v4H4zm12-6h4v10h-4z"/></svg>',
  gallery: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 5h16v14H4zm2 2v6l3.2-2.4L14 15l4-5v9H6zm9-1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 2h4l.6 3.2a7 7 0 0 1 2.2 1.3L20 5.6 22 9l-2.6 1.6a7 7 0 0 1 0 2.8L22 15l-2 3.4-3.2-.9a7 7 0 0 1-2.2 1.3L14 22h-4l-.6-3.2a7 7 0 0 1-2.2-1.3L4 18.4 2 15l2.6-1.6a7 7 0 0 1 0-2.8L2 9l2-3.4 3.2.9A7 7 0 0 1 9.4 5.2zM12 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3z"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z"/></svg>',
};

const NAV = [
  { id: "dashboard", label: "الإحصائيات", icon: ICO.dash },
  { id: "products", label: "المنتجات", icon: ICO.box },
  { id: "categories", label: "التصنيفات", icon: ICO.cat },
  { id: "brands", label: "العلامات التجارية", icon: ICO.brand },
  { id: "orders", label: "الطلبات", icon: ICO.orders },
  { id: "customers", label: "العملاء", icon: ICO.users },
  { id: "coupons", label: "الخصومات والكوبونات", icon: ICO.tag },
  { id: "inventory", label: "المخزون", icon: ICO.stock },
  { id: "slider", label: "بانر الموقع", icon: ICO.star },
  { id: "featured", label: "سلايدر منتجات", icon: ICO.featured },
  { id: "home-layout", label: "ترتيب الرئيسية", icon: ICO.layout },
  { id: "gallery", label: "معرض المكتب", icon: ICO.gallery },
  { id: "settings", label: "إعدادات المتجر", icon: ICO.gear },
  { id: "users", label: "المستخدمون والصلاحيات", icon: ICO.shield },
];

const TITLES = {
  dashboard: ["الإحصائيات", "نظرة عامة"],
  products: ["المنتجات", "إدارة الأجهزة"],
  categories: ["التصنيفات", "أقسام المتجر"],
  brands: ["العلامات", "إدارة البراندات"],
  orders: ["الطلبات", "متابعة وحالات الطلب"],
  customers: ["العملاء", "سجل المشترين"],
  coupons: ["الكوبونات", "خصومات العروض"],
  inventory: ["المخزون", "الكميات والتنبيهات"],
  slider: ["بانر الموقع", "شرائح العروض الرئيسية"],
  featured: ["سلايدر منتجات", "سلايدرات متعددة أفقية"],
  "home-layout": ["ترتيب الرئيسية", "سحب الأقسام وترتيبها"],
  gallery: ["معرض المكتب", "صور من داخل المكتب"],
  settings: ["الإعدادات", "هوية المتجر"],
  users: ["الصلاحيات", "مستخدمو اللوحة"],
};

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function money(n) {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(n) || 0)} IQD`;
}

function formatMoneyInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(digits));
}

function parseMoneyInput(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function bindMoneyInput(el) {
  if (!el || el.dataset.moneyBound === "1") return;
  el.dataset.moneyBound = "1";
  el.addEventListener("input", () => {
    const start = el.selectionStart ?? el.value.length;
    const digitsBefore = el.value.slice(0, start).replace(/\D/g, "").length;
    const digits = el.value.replace(/\D/g, "");
    el.value = digits ? formatMoneyInput(digits) : "";
    let pos = 0;
    let seen = 0;
    for (let i = 0; i < el.value.length; i += 1) {
      if (/\d/.test(el.value[i])) seen += 1;
      if (seen >= digitsBefore) {
        pos = i + 1;
        break;
      }
    }
    if (seen < digitsBefore) pos = el.value.length;
    el.setSelectionRange(pos, pos);
  });
}

function setupMoneyInputs(root = document) {
  root.querySelectorAll("[data-money-input]").forEach(bindMoneyInput);
}

function phoneDigits(phone) {
  return (phone || "").replace(/\D/g, "");
}

function storeWhatsAppDigits() {
  const s = db().settings || {};
  let digits = phoneDigits(s.whatsapp || s.phone);
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
  const num = storeWhatsAppDigits();
  if (!num) return "#";
  return `https://wa.me/${num}?text=${encodeURIComponent(buildOrderWhatsAppMessage(order))}`;
}

function orderItemsSummary(items) {
  if (!items?.length) return "—";
  return items.map((i) => `${i.name} ×${i.qty}`).join("، ");
}

function orderDetailModal(order) {
  const items = (order.items || [])
    .map(
      (i) => `
      <li class="order-detail-item">
        ${i.image ? `<img src="${esc(resolveAdminAsset(i.image))}" alt="" />` : ""}
        <div>
          <strong>${esc(i.name)}</strong>
          <span class="muted">${esc([i.cpu, i.gpu, i.ram, i.storage].filter(Boolean).join(" · "))}</span>
          ${i.arabization ? '<span class="pill">تعريب كيبورد</span>' : ""}
          <div class="order-detail-line-total">${i.qty} × ${money(i.price)} = ${money((i.qty || 1) * (i.price || 0))}</div>
        </div>
      </li>`
    )
    .join("");

  return `
    <h2>تفاصيل الطلب ${esc(order.id)}</h2>
    <p class="muted">${new Date(order.createdAt).toLocaleString("ar-IQ")} · ${esc(statusLabel(order.status))}</p>
    <div class="order-detail-grid">
      <section>
        <h3>العميل</h3>
        <p><strong>${esc(order.customer?.name || "—")}</strong></p>
        <p><a href="tel:${esc(order.customer?.phone || "")}">${esc(order.customer?.phone || "—")}</a></p>
      </section>
      <section>
        <h3>التوصيل</h3>
        <p>المدينة: ${esc(order.address?.city || "—")}</p>
        <p>المنطقة: ${esc(order.address?.area || "—")}</p>
        <p>أقرب نقطة: ${esc(order.address?.street || "—")}</p>
        ${order.address?.notes ? `<p class="muted">ملاحظات: ${esc(order.address.notes)}</p>` : ""}
        <p>${esc(order.delivery?.label || "—")}${order.shipping ? ` — ${money(order.shipping)}` : ""}</p>
        <p>الدفع: ${esc(order.payment?.label || "—")}</p>
      </section>
    </div>
    <h3>المنتجات</h3>
    <ul class="order-detail-list">${items || "<li class='muted'>—</li>"}</ul>
    <div class="order-detail-totals">
      <div><span>المجموع</span><strong>${money(order.subtotal)}</strong></div>
      ${order.discount ? `<div><span>الخصم</span><strong>- ${money(order.discount)}</strong></div>` : ""}
      <div><span>التوصيل</span><strong>${money(order.shipping || 0)}</strong></div>
      <div class="order-detail-grand"><span>الإجمالي</span><strong>${money(order.total)}</strong></div>
    </div>
    <div class="modal-actions">
      <a class="btn btn-whatsapp" href="${orderWhatsAppUrl(order)}" target="_blank" rel="noopener">إرسال للواتساب</a>
      <button class="btn btn-ghost" type="button" data-close-modal>إغلاق</button>
    </div>`;
}

function toast(msg) {
  const el = document.querySelector("[data-toast]");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2000);
}

function productDeleteConfirmModal(p) {
  if (!p) return "";
  const cat = db().categories.find((c) => c.id === p.category);
  return `<div class="confirm-delete">
    <h2>تأكيد حذف المنتج</h2>
    <p class="muted">هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع بعد الحذف.</p>
    <div class="confirm-delete-card">
      <img src="${esc(resolveAdminAsset(p.image))}" alt="" />
      <div class="confirm-delete-meta">
        <b>${esc(p.name)}</b>
        <ul class="confirm-delete-facts">
          <li><span>الماركة</span><strong>${esc(p.brand || "—")}</strong></li>
          <li><span>التصنيف</span><strong>${esc(cat?.title || p.category || "—")}</strong></li>
          <li><span>السعر</span><strong>${money(p.price)}</strong></li>
          <li><span>المخزون</span><strong>${esc(p.stock ?? "—")}</strong></li>
          <li><span>المعرّف</span><strong><code>${esc(p.id)}</code></strong></li>
        </ul>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>
      <button class="btn btn-danger" type="button" data-confirm-del-product="${esc(p.id)}">نعم، احذف المنتج</button>
    </div>
  </div>`;
}

function ordersForCustomerPhone(phone) {
  return db()
    .orders.filter((o) => (o.customer?.phone || "") === phone)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function customerHistoryModal(customer) {
  if (!customer) return "";
  const list = ordersForCustomerPhone(customer.phone);
  const rows = list.length
    ? list
        .map(
          (o) => `<article class="customer-order-row">
            <div>
              <b>${esc(o.id)}</b>
              <p class="muted">${new Date(o.createdAt).toLocaleString("ar-IQ")} · ${esc(statusLabel(o.status))}</p>
              <p class="muted">${esc(orderItemsSummary(o.items))}</p>
            </div>
            <div class="customer-order-side">
              <strong>${money(o.total)}</strong>
              <div class="row-actions">
                <button class="btn btn-ghost" type="button" data-order-detail="${esc(o.id)}">تفاصيل</button>
                <button class="btn btn-ghost danger-text" type="button" data-del-order="${esc(o.id)}" data-del-order-return-phone="${esc(customer.phone)}">حذف السجل</button>
              </div>
            </div>
          </article>`
        )
        .join("")
    : `<p class="muted">لا يوجد سجل مشتريات لهذا العميل.</p>`;
  return `<div class="customer-history">
    <h2>سجل مشتريات العميل</h2>
    <p class="muted">${esc(customer.name)} · <a href="tel:${esc(customer.phone)}">${esc(customer.phone)}</a>${customer.city ? ` · ${esc(customer.city)}` : ""}</p>
    <div class="customer-history-kpis">
      <div class="kpi"><span>الطلبات</span><b>${list.length}</b></div>
      <div class="kpi"><span>الإنفاق</span><b>${money(list.reduce((s, o) => s + (o.total || 0), 0))}</b></div>
    </div>
    <div class="customer-history-list">${rows}</div>
    <div class="modal-actions">
      <button class="btn btn-ghost" type="button" data-close-modal>إغلاق</button>
    </div>
  </div>`;
}

function orderDeleteConfirmModal(order, returnPhone = "") {
  if (!order) return "";
  return `<div class="confirm-delete">
    <h2>تأكيد حذف سجل الشراء</h2>
    <p class="muted">هل أنت متأكد من حذف هذا السجل من مشتريات العميل؟ لا يمكن التراجع بعد الحذف.</p>
    <div class="confirm-delete-card confirm-delete-card--order">
      <div class="confirm-delete-meta">
        <b>طلب ${esc(order.id)}</b>
        <ul class="confirm-delete-facts">
          <li><span>العميل</span><strong>${esc(order.customer?.name || "—")}</strong></li>
          <li><span>الهاتف</span><strong>${esc(order.customer?.phone || "—")}</strong></li>
          <li><span>التاريخ</span><strong>${new Date(order.createdAt).toLocaleString("ar-IQ")}</strong></li>
          <li><span>المنتجات</span><strong>${esc(orderItemsSummary(order.items))}</strong></li>
          <li><span>الإجمالي</span><strong>${money(order.total)}</strong></li>
          <li><span>الحالة</span><strong>${esc(statusLabel(order.status))}</strong></li>
        </ul>
      </div>
    </div>
    <div class="modal-actions">
      ${
        returnPhone
          ? `<button class="btn btn-ghost" type="button" data-customer-history="${esc(returnPhone)}">رجوع للسجل</button>`
          : `<button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>`
      }
      <button class="btn btn-danger" type="button" data-confirm-del-order="${esc(order.id)}" data-del-order-return-phone="${esc(returnPhone || "")}">نعم، احذف السجل</button>
    </div>
  </div>`;
}

function openCustomerHistoryByPhone(phone) {
  const customer = db().customers.find((c) => c.phone === phone);
  if (!customer) {
    const orders = ordersForCustomerPhone(phone);
    if (!orders.length) {
      toast("لا يوجد سجل لهذا العميل");
      return;
    }
    openModal(
      customerHistoryModal({
        name: orders[0].customer?.name || "عميل",
        phone,
        city: orders[0].address?.city || "",
      }),
      { wide: true }
    );
    return;
  }
  openModal(customerHistoryModal(customer), { wide: true });
}

function pageId() {
  const route = parseRoute();
  return route.page === "product-editor" ? "products" : route.page;
}

function parseRoute() {
  const pathMatch = location.pathname.match(/\/admin\/([a-z0-9-]+)\/?$/);
  if (pathMatch) {
    const slug = pathMatch[1];
    if (slug === "login") return { page: "dashboard", mode: null, id: null };
    if (slug === "index") return { page: "dashboard", mode: null, id: null };
    if (slug === "products" && location.hash.includes("/new")) {
      return { page: "product-editor", mode: "new", id: null };
    }
    if (NAV.some((n) => n.id === slug)) return { page: slug, mode: null, id: null };
  }

  const raw = (location.hash || "#/dashboard").replace("#/", "") || "dashboard";
  const parts = raw.split("/").filter(Boolean);
  if (parts[0] === "products" && parts[1] === "new") return { page: "product-editor", mode: "new", id: null };
  if (parts[0] === "products" && parts[1] === "edit" && parts[2]) {
    return { page: "product-editor", mode: "edit", id: decodeURIComponent(parts[2]) };
  }
  const page = NAV.some((n) => n.id === parts[0]) ? parts[0] : "dashboard";
  return { page, mode: null, id: null };
}

function db() {
  return StoreDB.load();
}

function session() {
  const s = StoreDB.session();
  if (!s) {
    location.replace("/admin/login");
    return null;
  }
  return s;
}

function statusLabel(id) {
  return StoreDB.ORDER_STATUSES.find((s) => s.id === id)?.label || id;
}

function closeModal(force = false) {
  const box = document.querySelector("[data-modal]");
  if (!box || box.hidden) return;
  if (!force && !confirmModalClose()) return;
  box.hidden = true;
  box.classList.remove("is-open");
  box.querySelector("[data-modal-card]")?.classList.remove("admin-modal-card--wide");
}

function confirmModalClose() {
  const slideForm = document.querySelector("[data-slide-form]");
  if (slideForm?.dataset.dirty === "1") {
    return window.confirm("لديك تعديلات غير محفوظة في الشريحة. هل تريد إغلاق النافذة؟");
  }
  return true;
}

function openModal(html, opts = {}) {
  const box = document.querySelector("[data-modal]");
  const card = box.querySelector("[data-modal-card]");
  box.hidden = false;
  box.classList.add("is-open");
  card.classList.toggle("admin-modal-card--wide", !!opts.wide);
  card.innerHTML = html;
  card.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  });
}

function renderNav(user) {
  document.querySelector("[data-admin-nav]").innerHTML = NAV.filter((n) => StoreDB.can(user.role, n.id))
    .map(
      (n) =>
        `<a href="#/${n.id}" class="${pageId() === n.id ? "active" : ""}">${n.icon}<span>${n.label}</span></a>`
    )
    .join("");
}

function kpi(label, value) {
  return `<article class="kpi"><span>${label}</span><b>${value}</b></article>`;
}

function donut(items, colors) {
  const total = items.reduce((s, i) => s + i.n, 0) || 1;
  let offset = 0;
  return items
    .map((item, i) => {
      const pct = (item.n / total) * 100;
      const circle = `<circle pathLength="100" cx="18" cy="18" r="14" fill="none" stroke="${colors[i]}" stroke-width="4" stroke-dasharray="${pct} ${100 - pct}" stroke-dashoffset="${-offset}" transform="rotate(-90 18 18)" />`;
      offset += pct;
      return circle;
    })
    .join("");
}

function ordersTable(list, editable = true) {
  return `
    <div class="table-wrap">
      <table class="data-table orders-table">
        <thead><tr><th>الطلب</th><th>العميل</th><th>المنتجات</th><th>الإجمالي</th><th>الحالة</th>${editable ? "<th></th>" : ""}</tr></thead>
        <tbody>
          ${list
            .map(
              (o) => `
            <tr>
              <td><b>${esc(o.id)}</b><div class="muted">${new Date(o.createdAt).toLocaleString("ar-IQ")}</div></td>
              <td>${esc(o.customer.name)}<div class="muted"><a href="tel:${esc(o.customer.phone)}">${esc(o.customer.phone)}</a></div></td>
              <td class="order-items-cell">${esc(orderItemsSummary(o.items))}</td>
              <td>${money(o.total)}</td>
              <td>
                ${
                  editable
                    ? `<select class="status-select" data-order-status="${esc(o.id)}">
                        ${StoreDB.ORDER_STATUSES.map((s) => `<option value="${s.id}" ${o.status === s.id ? "selected" : ""}>${s.label}</option>`).join("")}
                      </select>`
                    : `<span class="pill">${statusLabel(o.status)}</span>`
                }
              </td>
              ${
                editable
                  ? `<td class="row-actions">
                      <button class="btn btn-ghost" type="button" data-order-detail="${esc(o.id)}">تفاصيل</button>
                      <button class="btn btn-ghost danger-text" type="button" data-del-order="${esc(o.id)}">حذف</button>
                    </td>`
                  : ""
              }
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function resolveAdminAsset(src) {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("http") || src.startsWith("/")) return src;
  return `../${src}`;
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

function youtubeBackgroundEmbedUrl(id) {
  const q = new URLSearchParams({
    autoplay: "1",
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

function adminHeroMediaHtml(videoUrl, imageUrl) {
  const yt = youtubeIdFromUrl(videoUrl);
  if (yt) {
    const src = youtubeBackgroundEmbedUrl(yt);
    const poster = imageUrl ? resolveAdminAsset(imageUrl) : "";
    const posterStyle = poster ? ` style="--yt-poster:url('${poster}')"` : "";
    return `<div class="slider-panel slider-panel-video slider-panel-youtube is-yt-playing"${posterStyle}><iframe src="${src}" title="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="eager" tabindex="-1"></iframe><div class="yt-poster" aria-hidden="true"></div><div class="yt-chrome-mask" aria-hidden="true"></div></div>`;
  }
  if (videoUrl) {
    return `<div class="slider-panel slider-panel-video"><video src="${esc(resolveAdminAsset(videoUrl))}" autoplay muted loop playsinline></video></div>`;
  }
  if (imageUrl) {
    return `<div class="slider-panel" style="background-image:url('${esc(imageUrl)}')"></div>`;
  }
  return `<div class="slider-panel"><span class="slide-hero-preview-empty">أضف صورة أو رابط يوتيوب للشريحة</span></div>`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getProductImages() {
  const el = document.querySelector("[data-images-json]");
  if (!el) return [];
  try {
    return JSON.parse(el.value || "[]");
  } catch {
    return [];
  }
}

function setProductImages(list) {
  const el = document.querySelector("[data-images-json]");
  if (el) el.value = JSON.stringify(list);
  paintImagePreviews(list);
}

function paintImagePreviews(list) {
  const box = document.querySelector("[data-image-previews]");
  if (!box) return;
  const isEditor = box.classList.contains("pe-gallery");
  box.innerHTML = list.length
    ? list
        .map(
          (src, i) => `
    <figure class="img-preview">
      ${isEditor && i === 0 ? '<span class="img-primary-badge">الصورة الرئيسية</span>' : ""}
      <img src="${esc(resolveAdminAsset(src))}" alt="" />
      <button type="button" class="img-rm" data-rm-img="${i}" aria-label="حذف">×</button>
    </figure>`
        )
        .join("")
    : isEditor
      ? `<p class="pe-gallery-empty muted">لم تُرفع صور بعد — أضف صورة واحدة على الأقل.</p>`
      : "";
}

function renderDashboard() {
  const { products, orders, customers } = db();
  const sales = orders.filter((o) => o.status !== "canceled").reduce((s, o) => s + o.total, 0);
  const low = products.filter((p) => Number(p.stock) < 5).length;
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const sum = orders
      .filter((o) => o.createdAt.slice(0, 10) === key && o.status !== "canceled")
      .reduce((s, o) => s + o.total, 0);
    return { label: d.toLocaleDateString("ar-IQ", { weekday: "short" }), sum };
  });
  const max = Math.max(...days.map((d) => d.sum), 1);
  const counts = StoreDB.ORDER_STATUSES.map((s) => ({
    ...s,
    n: orders.filter((o) => o.status === s.id).length,
  }));
  const colors = ["#00d084", "#3dffb0", "#f5c16c", "#7aa2ff", "#94a0b5", "#ff5d8f"];
  return `
    <section class="kpi-grid">
      ${kpi("مبيعات الطلبات", money(sales))}
      ${kpi("عدد الطلبات", orders.length)}
      ${kpi("العملاء", customers.length)}
      ${kpi("تنبيه مخزون", low)}
    </section>
    <section class="charts">
      <article class="chart-card">
        <h2>المبيعات آخر 7 أيام</h2>
        ${days
          .map(
            (d) => `
          <div class="bar-row">
            <span>${d.label}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round((d.sum / max) * 100)}%"></div></div>
            <b>${money(d.sum)}</b>
          </div>`
          )
          .join("")}
      </article>
      <article class="chart-card">
        <h2>حالات الطلبات</h2>
        <div class="donut-wrap">
          <svg viewBox="0 0 36 36" width="120" height="120">${donut(counts, colors)}</svg>
          <div class="legend">
            ${counts.map((c, i) => `<div><i style="background:${colors[i]}"></i>${c.label} (${c.n})</div>`).join("")}
          </div>
        </div>
      </article>
    </section>
    <article class="panel">
      <h2>أحدث الطلبات</h2>
      ${ordersTable(orders.slice(0, 5), false)}
    </article>
  `;
}

function productEditorSpecsPreview(form) {
  const gpu = form.querySelector('[name="gpu"]')?.value || "";
  const ram = form.querySelector('[name="ram"]')?.value || "";
  const storage = form.querySelector('[name="storage"]')?.value || "";
  const parts = [gpu, ram, storage].filter(Boolean);
  return parts.join(" · ");
}

function setupProductEditor() {
  const form = document.querySelector("[data-product-form]");
  const preview = document.querySelector("[data-product-live-preview]");
  if (!form || !preview) return;

  function syncPreview() {
    const name = form.querySelector('[name="name"]')?.value || "اسم المنتج";
    const tag = form.querySelector('[name="tag"]')?.value || "جديد";
    const brand = form.querySelector('[name="brand"]')?.value || "—";
    const price = parseMoneyInput(form.querySelector('[name="price"]')?.value);
    const oldPrice = parseMoneyInput(form.querySelector('[name="oldPrice"]')?.value);
    const stock = Number(form.querySelector('[name="stock"]')?.value) || 0;
    const images = getProductImages();
    const img = images[0] ? resolveAdminAsset(images[0]) : "../img/logo.jpg";
    const specs = form.querySelector('[name="specs"]')?.value || productEditorSpecsPreview(form);
    const off = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

    preview.innerHTML = `
      <article class="product-card preview-card ${stock <= 0 ? "is-oos" : ""}">
        <div class="pc-media">
          <img src="${esc(img)}" alt="" />
          <span class="badge">${esc(tag)}</span>
          ${off ? `<span class="badge badge-sale">-${off}%</span>` : ""}
          ${stock <= 0 ? `<span class="oos-ribbon">غير متوفر</span>` : ""}
        </div>
        <div class="card-body">
          <p class="pc-meta">${esc(brand)}</p>
          <h3>${esc(name)}</h3>
          <p class="muted">${esc(specs)}</p>
          ${
            stock > 0
              ? `<div class="price"><b>${money(price)}</b>${oldPrice > price ? `<span class="old">${money(oldPrice)}</span>` : ""}</div>`
              : ""
          }
        </div>
      </article>`;
  }

  if (!form.dataset.previewBound) {
    form.dataset.previewBound = "1";
    form.addEventListener("input", syncPreview);
    form.addEventListener("change", syncPreview);
    const specsField = form.querySelector('[name="specs"]');
    ["gpu", "cpu", "ram", "storage"].forEach((name) => {
      form.querySelector(`[name="${name}"]`)?.addEventListener("input", () => {
        if (specsField && !specsField.value.trim()) specsField.placeholder = productEditorSpecsPreview(form);
      });
    });
  }
  setupMoneyInputs(form);
  syncPreview();
}

function peField(label, inputHtml, span = 1) {
  return `<label class="pe-field ${span === 2 ? "pe-field-wide" : ""}"><span class="pe-label">${label}</span>${inputHtml}</label>`;
}

function peSection(step, title, desc, bodyHtml) {
  return `
    <section class="pe-section">
      <header class="pe-section-head">
        <span class="pe-step" aria-hidden="true">${step}</span>
        <div>
          <h3>${title}</h3>
          ${desc ? `<p class="pe-section-desc">${desc}</p>` : ""}
        </div>
      </header>
      <div class="pe-fields">${bodyHtml}</div>
    </section>`;
}

function peAsideBlock(step, title, desc, bodyHtml) {
  return `
    <header class="pe-section-head">
      <span class="pe-step" aria-hidden="true">${step}</span>
      <div>
        <h3>${title}</h3>
        ${desc ? `<p class="pe-section-desc">${desc}</p>` : ""}
      </div>
    </header>
    ${bodyHtml}`;
}

function renderProductEditor(productId = null) {
  const existing = productId ? db().products.find((x) => x.id === productId) : null;
  if (productId && !existing) {
    return `<article class="panel"><p class="empty">المنتج غير موجود. <a href="#/products">العودة للمنتجات</a></p></article>`;
  }
  const p = existing || {};
  const isNew = !productId;
  const cats = db()
    .categories.map((c) => `<option value="${esc(c.id)}" ${p.category === c.id ? "selected" : ""}>${esc(c.title)}</option>`)
    .join("");
  const brands = db()
    .brands.map((b) => `<option ${p.brand === b.name ? "selected" : ""}>${esc(b.name)}</option>`)
    .join("");
  const images = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
  const autoSpecs = [p.gpu, p.cpu, p.ram, p.storage].filter(Boolean).join(" · ");

  const basics = `
    ${peField("اسم المنتج", `<input name="name" required value="${esc(p.name || "")}" placeholder="مثال: Apex 16 Pro" />`, 2)}
    ${peField("العلامة التجارية", `<select name="brand">${brands}</select>`)}
    ${peField("التصنيف", `<select name="category">${cats}</select>`)}
    ${peField("وسم البطاقة", `<input name="tag" value="${esc(p.tag || "")}" placeholder="الأكثر مبيعاً · جديد" />`)}
    ${peField("العنوان التسويقي", `<input name="headline" value="${esc(p.headline || "")}" placeholder="سطر جذاب في صفحة المنتج" />`, 2)}
    ${peField("الوصف المختصر", `<textarea name="blurb" rows="3" placeholder="وصف قصير يظهر للزبون">${esc(p.blurb || "")}</textarea>`, 2)}
  `;
  const pricing = `
    ${peField("السعر (IQD)", `<input name="price" type="text" inputmode="numeric" class="money-input" data-money-input required value="${esc(formatMoneyInput(p.price))}" autocomplete="off" placeholder="مثال: 2,500,000" />`)}
    ${peField("السعر قبل الخصم", `<input name="oldPrice" type="text" inputmode="numeric" class="money-input" data-money-input value="${esc(formatMoneyInput(p.oldPrice))}" autocomplete="off" placeholder="اختياري" />`)}
    ${peField("المخزون", `<input name="stock" type="number" min="0" required value="${esc(p.stock ?? (isNew ? 1 : 0))}" />`)}
  `;
  const specsFields = `
    ${peField("المعالج", `<input name="cpu" value="${esc(p.cpu || "")}" placeholder="Ryzen 9 / Core i7" />`)}
    ${peField("كرت الشاشة", `<input name="gpu" value="${esc(p.gpu || "")}" placeholder="RTX 4070" />`)}
    ${peField("قدرة الكرت (TGP)", `<input name="tgp" value="${esc(p.tgp || "")}" placeholder="140W" />`)}
    ${peField("التبريد", `<input name="cooling" value="${esc(p.cooling || "")}" placeholder="تبريد مزدوج" />`)}
    ${peField("الذاكرة (RAM)", `<input name="ram" value="${esc(p.ram || "")}" placeholder="32GB" />`)}
    ${peField("التخزين", `<input name="storage" value="${esc(p.storage || "")}" placeholder="1TB SSD" />`)}
    ${peField("الشاشة", `<input name="screen" value="${esc(p.screen || "")}" placeholder="16 بوصة 240Hz OLED" />`, 2)}
    ${peField("سطر المواصفات في البطاقة", `<input name="specs" value="${esc(p.specs || "")}" placeholder="${esc(autoSpecs || "RTX 4070 · 32GB · 1TB")}" />`, 2)}
  `;

  return `
    <article class="panel pe-editor">
      <header class="pe-toolbar">
        <nav class="pe-breadcrumb" aria-label="مسار التنقل">
          <a href="#/products">المنتجات</a>
          <span class="pe-breadcrumb-sep">/</span>
          <span>${isNew ? "إضافة منتج" : "تعديل"}</span>
        </nav>
        <div class="pe-toolbar-row">
          <div class="pe-toolbar-text">
            <p class="pe-kicker">${isNew ? "منتج جديد" : "تعديل منتج"}</p>
            <h2 class="pe-title">${isNew ? "إضافة لابتوب للمتجر" : esc(p.name)}</h2>
            <p class="pe-subtitle">${isNew ? "أكمل الأقسام أدناه ثم احفظ — يُعرض المنتج مباشرة في المتجر." : `المعرف: ${esc(p.id)}`}</p>
          </div>
          <a class="btn btn-ghost" href="#/products">← العودة للمنتجات</a>
        </div>
        <ol class="pe-steps" aria-label="خطوات الإدخال">
          <li class="pe-steps-item"><span>1</span> الأساسيات</li>
          <li class="pe-steps-item"><span>2</span> السعر</li>
          <li class="pe-steps-item"><span>3</span> المواصفات</li>
          <li class="pe-steps-item"><span>4</span> الصور</li>
        </ol>
      </header>

      <form id="product-editor-form" class="pe-form" data-product-form data-id="${esc(p.id || "")}">
        <div class="pe-layout">
          <div class="pe-main">
            ${peSection("1", "المعلومات الأساسية", "الاسم والتصنيف والوصف الذي يراه الزبون.", basics)}
            ${peSection("2", "السعر والمخزون", "الأسعار بالدينار العراقي وتوفر الجهاز.", pricing)}
            ${peSection("3", "المواصفات التقنية", "تظهر في بطاقة المتجر وصفحة التفاصيل.", specsFields)}
          </div>

          <aside class="pe-aside">
            <section class="pe-aside-block">
              ${peAsideBlock("4", "صور المنتج", "PNG أو JPG — الصورة الأولى هي الغلاف.", `
                <label class="pe-upload">
                  <input type="file" accept="image/*" multiple data-product-files hidden />
                  <span class="pe-upload-icon" aria-hidden="true">↑</span>
                  <strong>رفع صور المنتج</strong>
                  <small>انقر أو اسحب الملفات هنا</small>
                </label>
                <div class="pe-gallery" data-image-previews></div>
                <input type="hidden" name="imagesJson" data-images-json value='${esc(JSON.stringify(images))}' />
              `)}
            </section>

            <section class="pe-aside-block pe-aside-preview">
              <header class="pe-section-head pe-section-head-plain">
                <div>
                  <h3>معاينة البطاقة</h3>
                  <p class="pe-section-desc">تحديث فوري أثناء الكتابة</p>
                </div>
              </header>
              <div class="pe-preview-wrap" data-product-live-preview></div>
            </section>
          </aside>
        </div>

        <footer class="pe-footer">
          <p class="pe-footer-hint muted">تأكد من رفع صورة واحدة على الأقل قبل الحفظ.</p>
          <div class="pe-footer-actions">
            <a class="btn btn-ghost" href="#/products">إلغاء</a>
            <button class="btn btn-primary" type="submit">حفظ المنتج</button>
          </div>
        </footer>
      </form>
    </article>`;
}

function renderProducts() {
  const q = document.querySelector("[data-p-q]")?.value || "";
  const cat = document.querySelector("[data-p-cat]")?.value || "all";
  const stock = document.querySelector("[data-p-stock]")?.value || "all";
  const list = db()
    .products.filter((p) => {
      const hay = `${p.name} ${p.brand} ${p.gpu}`.includes(q);
      return (cat === "all" || p.category === cat) && (stock === "all" || (stock === "in" ? p.stock > 0 : p.stock <= 0)) && hay;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return `
    <div class="toolbar-admin">
      <input data-p-q placeholder="بحث بالاسم أو الكرت..." value="${esc(q)}" />
      <select data-p-cat>
        <option value="all">كل التصنيفات</option>
        ${db().categories.map((c) => `<option value="${c.id}" ${cat === c.id ? "selected" : ""}>${esc(c.title)}</option>`).join("")}
      </select>
      <select data-p-stock>
        <option value="all">كل المخزون</option>
        <option value="in" ${stock === "in" ? "selected" : ""}>متوفر</option>
        <option value="out" ${stock === "out" ? "selected" : ""}>غير متوفر</option>
      </select>
      <a class="btn btn-primary" href="#/products/new">+ إضافة منتج</a>
    </div>
    <div class="panel table-wrap">
      <table class="data-table">
        <thead><tr><th></th><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>المخزون</th><th></th></tr></thead>
        <tbody>
          ${list
            .map(
              (p) => `
            <tr>
              <td><img src="${esc(p.image)}" alt="" /></td>
              <td><b>${esc(p.name)}</b><div class="muted">${esc(p.cpu)} · ${esc(p.gpu)}</div></td>
              <td>${esc(p.category)}</td>
              <td>${money(p.price)}</td>
              <td><span class="pill ${p.stock ? "" : "danger"}">${p.stock}</span></td>
              <td class="row-actions">
                <a class="btn btn-ghost" href="#/products/edit/${encodeURIComponent(p.id)}">تعديل</a>
                <button class="btn btn-ghost danger-text" data-del-product="${esc(p.id)}">حذف</button>
              </td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderCategories() {
  return `
    <div class="toolbar-admin"><button class="btn btn-primary" type="button" data-add-cat>إضافة تصنيف</button></div>
    <div class="panel table-wrap">
      <table class="data-table">
        <thead><tr><th>المعرف</th><th>الاسم</th><th>الوصف</th><th></th></tr></thead>
        <tbody>
          ${db()
            .categories.map(
              (c) => `<tr><td>${esc(c.id)}</td><td>${esc(c.title)}</td><td>${esc(c.text)}</td>
              <td class="row-actions"><button class="btn btn-ghost" data-edit-cat="${esc(c.id)}">تعديل</button>
              <button class="btn btn-ghost" data-del-cat="${esc(c.id)}">حذف</button></td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function renderBrands() {
  return `
    <div class="toolbar-admin"><button class="btn btn-primary" type="button" data-add-brand>إضافة علامة</button></div>
    <div class="panel table-wrap">
      <table class="data-table">
        <thead><tr><th>الاسم</th><th>البلد</th><th></th></tr></thead>
        <tbody>
          ${db()
            .brands.map(
              (b) => `<tr><td>${esc(b.name)}</td><td>${esc(b.country)}</td>
              <td class="row-actions"><button class="btn btn-ghost" data-edit-brand="${esc(b.id)}">تعديل</button>
              <button class="btn btn-ghost" data-del-brand="${esc(b.id)}">حذف</button></td></tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function renderOrders() {
  const st = document.querySelector("[data-o-st]")?.value || "all";
  const q = document.querySelector("[data-o-q]")?.value || "";
  const list = db().orders.filter(
    (o) =>
      (st === "all" || o.status === st) &&
      `${o.id} ${o.customer.name} ${o.customer.phone} ${(o.items || []).map((i) => i.name).join(" ")}`.includes(q)
  );
  return `
    <div class="toolbar-admin">
      <input data-o-q placeholder="بحث برقم الطلب أو الهاتف أو اسم المنتج" value="${esc(q)}" />
      <select data-o-st>
        <option value="all">كل الحالات</option>
        ${StoreDB.ORDER_STATUSES.map((s) => `<option value="${s.id}" ${st === s.id ? "selected" : ""}>${s.label}</option>`).join("")}
      </select>
    </div>
    <div class="panel">${ordersTable(list)}</div>`;
}

function renderCustomers() {
  const list = db().customers || [];
  if (!list.length) {
    return `<div class="panel slide-empty">
      <h2>لا يوجد عملاء بعد</h2>
      <p class="muted">يظهر العملاء هنا تلقائياً بعد إتمام الطلبات من المتجر.</p>
    </div>`;
  }
  return `<div class="panel table-wrap"><table class="data-table">
    <thead><tr><th>الاسم</th><th>الهاتف</th><th>المدينة</th><th>الطلبات</th><th>الإنفاق</th><th></th></tr></thead>
    <tbody>${list
      .map(
        (c) => `<tr>
          <td><b>${esc(c.name)}</b></td>
          <td><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></td>
          <td>${esc(c.city || "—")}</td>
          <td>${c.orders}</td>
          <td>${money(c.spent)}</td>
          <td class="row-actions">
            <button class="btn btn-ghost" type="button" data-customer-history="${esc(c.phone)}">سجل المشتريات</button>
          </td>
        </tr>`
      )
      .join("")}</tbody>
  </table></div>`;
}

function renderCoupons() {
  return `
    <div class="toolbar-admin"><button class="btn btn-primary" type="button" data-add-coupon>إضافة كوبون</button></div>
    <div class="panel table-wrap"><table class="data-table">
      <thead><tr><th>الكود</th><th>النوع</th><th>القيمة</th><th>الحد الأدنى</th><th>الحالة</th><th></th></tr></thead>
      <tbody>
        ${db()
          .coupons.map(
            (c) => `<tr><td><b>${esc(c.code)}</b></td><td>${c.type === "percent" ? "نسبة" : "مبلغ ثابت"}</td>
            <td>${c.type === "percent" ? c.value + "%" : money(c.value)}</td><td>${money(c.min)}</td>
            <td><span class="pill ${c.active ? "" : "warn"}">${c.active ? "نشط" : "متوقف"}</span></td>
            <td class="row-actions"><button class="btn btn-ghost" data-edit-coupon="${esc(c.id)}">تعديل</button>
            <button class="btn btn-ghost" data-del-coupon="${esc(c.id)}">حذف</button></td></tr>`
          )
          .join("")}
      </tbody>
    </table></div>`;
}

function couponForm(c = {}) {
  return `<h2>${c.id ? "تعديل كوبون" : "كوبون جديد"}</h2>
    <form class="admin-form" data-coupon-form data-id="${esc(c.id || "")}">
      <label>الكود<input name="code" required value="${esc(c.code || "")}" /></label>
      <label>النوع<select name="type"><option value="percent" ${c.type === "percent" ? "selected" : ""}>نسبة %</option>
      <option value="fixed" ${c.type === "fixed" ? "selected" : ""}>مبلغ ثابت</option></select></label>
      <label>القيمة<input name="value" type="number" required value="${esc(c.value || 0)}" /></label>
      <label>الحد الأدنى<input name="min" type="number" value="${esc(c.min || 0)}" /></label>
      <label>الحالة<select name="active"><option value="1" ${c.active !== false ? "selected" : ""}>نشط</option>
      <option value="0" ${c.active === false ? "selected" : ""}>متوقف</option></select></label>
      <div class="modal-actions span-2"><button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>
      <button class="btn btn-primary" type="submit">حفظ</button></div>
    </form>`;
}

function renderInventory() {
  return `<div class="panel table-wrap"><table class="data-table">
    <thead><tr><th>المنتج</th><th>الحالة</th><th>الكمية</th></tr></thead>
    <tbody>${db()
      .products.map((p) => {
        const warn = Number(p.stock) === 0 ? "danger" : Number(p.stock) < 5 ? "warn" : "";
        return `<tr><td>${esc(p.name)}</td><td><span class="pill ${warn}">${p.stock === 0 ? "نافد" : p.stock < 5 ? "منخفض" : "جيد"}</span></td>
        <td><input data-stock-id="${esc(p.id)}" type="number" min="0" value="${esc(p.stock)}" style="width:90px" /></td></tr>`;
      })
      .join("")}</tbody></table></div>`;
}

function slideTextPositionLabel(value) {
  if (value === "center") return "نص وسط";
  if (value === "right") return "نص يمين";
  return "";
}

function slideTextPositionOptions(current) {
  const pos = current || "default";
  return [
    ["default", "تلقائي — نص ومواصفات"],
    ["center", "في الوسط"],
    ["right", "على يمين الشاشة"],
  ]
    .map(([value, label]) => `<option value="${value}" ${pos === value ? "selected" : ""}>${label}</option>`)
    .join("");
}

function slideForm(s = {}) {
  const cats = db().categories.map((c) => `<option value="${esc(c.id)}" ${s.category === c.id ? "selected" : ""}>${esc(c.title)}</option>`).join("");
  const products = db().products.map((p) => `<option value="${esc(p.id)}" ${s.productId === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("");
  const image = s.image || "";
  return `<h2>${s.id ? "تعديل شريحة" : "شريحة عرض جديدة"}</h2>
    <p class="muted span-2">السلايدر يتحرك أفقياً (يسار ↔ يمين) على الصفحة الرئيسية. رتّب الشرائح من لوحة القائمة.</p>
    <form class="admin-form slide-form" data-slide-form data-id="${esc(s.id || "")}">
      <div class="span-2 slide-live-preview-panel">
        <div class="slide-live-preview-head">
          <div>
            <h3>معاينة كما ستظهر في الصفحة الرئيسية</h3>
            <p class="muted">تتحدّث فوراً مع تعديلاتك — قبل الحفظ والنشر.</p>
          </div>
        </div>
        <div class="slide-hero-preview" data-slide-hero-preview></div>
      </div>
      <div class="form-section span-2"><h3>المعلومات الأساسية</h3></div>
      <label>عنوان الشريحة<input name="title" required value="${esc(s.title || "")}" placeholder="مثال: Apex 16 Pro" /></label>
      <label>الحالة<select name="active"><option value="1" ${s.active !== false ? "selected" : ""}>نشطة — تظهر في الموقع</option><option value="0" ${s.active === false ? "selected" : ""}>متوقفة — مخفية</option></select></label>
      <label>ربط بمنتج<select name="productId" data-slide-product><option value="">— بدون ربط —</option>${products}</select></label>
      <label>قسم التصفية<select name="category"><option value="">— الكل —</option>${cats}</select></label>
      <label class="span-2">العنوان الفرعي<input name="headline" value="${esc(s.headline || "")}" placeholder="سطر جذاب تحت العنوان" /></label>
      <label class="span-2">الوصف<input name="blurb" value="${esc(s.blurb || "")}" placeholder="وصف قصير للعرض" /></label>
      <label class="span-2 check-row">
        <input type="checkbox" name="imageOnly" value="1" ${s.imageOnly ? "checked" : ""} />
        عرض الصورة فقط — إخفاء النص والمواصفات على الموقع
      </label>
      <label class="span-2 check-row">
        <input type="checkbox" name="hideSpecs" value="1" ${s.hideSpecs ? "checked" : ""} ${s.imageOnly ? "disabled" : ""} />
        إخفاء بطاقة المواصفات فقط — الإبقاء على العنوان والأزرار
      </label>
      <label class="span-2 check-row">
        <input type="checkbox" name="showAddToCart" value="1" ${s.showAddToCart !== false ? "checked" : ""} ${s.imageOnly ? "disabled" : ""} />
        إظهار زر «أضف إلى السلة» في البنر — يظهر فقط عند ربط الشريحة بمنتج وتفعيل السلة
      </label>
      <label class="span-2">موضع النص<select name="textPosition" data-slide-text-position ${s.imageOnly ? "disabled" : ""}>${slideTextPositionOptions(s.textPosition)}</select><small class="field-hint">«في الوسط» يوسّط العنوان والأزرار على الشاشة. «على اليمين» يلصق النص بيمين السلايدر.</small></label>
      <div class="form-section span-2"><h3>الشارات والمواصفات</h3></div>
      <label>الوسم<input name="tag" value="${esc(s.tag || "")}" /></label>
      <label>الشارة 1<input name="chip1" value="${esc(s.chip1 || "")}" placeholder="ضمان سنتين" /></label>
      <label>الشارة 2<input name="chip2" value="${esc(s.chip2 || "")}" placeholder="أداء كامل" /></label>
      <label>كرت الشاشة<input name="gpu" value="${esc(s.gpu || "")}" /></label>
      <label>قدرة الكرت<input name="tgp" value="${esc(s.tgp || "")}" /></label>
      <label>التبريد<input name="cooling" value="${esc(s.cooling || "")}" /></label>
      <label>الشاشة<input name="screen" value="${esc(s.screen || "")}" /></label>
      <div class="form-section span-2"><h3>الوسائط — صورة أو فيديو</h3></div>
      <label class="span-2">رابط يوتيوب أو فيديو (اختياري — يُعرض بدل الصورة)<input name="videoUrl" type="url" value="${esc(s.videoUrl || "")}" placeholder="https://youtu.be/... أو رابط ملف mp4" /><small class="field-hint">يعمل صامتاً وبدون أزرار يوتيوب قدر الإمكان. بعض مقاطع يوتيوب قد تمنع التضمين — جرّب المقطع في المعاينة أعلاه.</small></label>
      <label class="span-2">رفع صورة<input type="file" accept="image/*" data-slide-file /></label>
      <input type="hidden" name="image" data-slide-image value="${esc(image)}" />
      <div class="modal-actions span-2"><button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>
      <button class="btn btn-primary" type="submit">حفظ الشريحة</button></div>
    </form>`;
}

function setupSlideEditor() {
  const form = document.querySelector("[data-slide-form]");
  const preview = document.querySelector("[data-slide-hero-preview]");
  if (!form || !preview) return;

  function val(name) {
    return form.querySelector(`[name="${name}"]`)?.value?.trim() || "";
  }

  function syncSlidePreview() {
    const productId = val("productId");
    const product = productId ? db().products.find((p) => p.id === productId) : null;
    const title = val("title") || product?.name || "عنوان الشريحة";
    const headline = val("headline") || product?.headline || "العنوان الفرعي يظهر هنا";
    const blurb = val("blurb") || product?.blurb || "وصف قصير للعرض على الهيرو";
    const chip1 = val("chip1") || "ضمان سنتين حقيقي";
    const chip2 = val("chip2") || "أداء كامل للكرت";
    const gpu = val("gpu") || product?.gpu || "—";
    const tgp = val("tgp") || product?.tgp || "—";
    const cooling = val("cooling") || product?.cooling || "—";
    const screen = val("screen") || product?.screen || "—";
    const videoUrl = val("videoUrl");
    const imageRaw = val("image") || product?.image || "";
    const image = imageRaw ? resolveAdminAsset(imageRaw) : "";
    const active = form.querySelector('[name="active"]')?.value !== "0";
    const imageOnly = form.querySelector('[name="imageOnly"]')?.checked;
    const hideSpecs = !imageOnly && form.querySelector('[name="hideSpecs"]')?.checked;
    const showAddToCart = !imageOnly && form.querySelector('[name="showAddToCart"]')?.checked !== false;
    const textPosition = imageOnly ? "default" : form.querySelector('[name="textPosition"]')?.value || "default";
    const textCenter = textPosition === "center";
    const textRight = textPosition === "right";
    const stock = product ? Number(product.stock) || 0 : 0;
    const showPrice = !!(product && stock > 0);
    const showAdd = !!product && showAddToCart;
    const addLabel = product ? (stock > 0 ? "أضف إلى السلة" : "غير متوفر") : "";

    const mediaHtml = adminHeroMediaHtml(videoUrl, image);

    preview.innerHTML = `
      <div class="slide-hero-mock${active ? "" : " is-inactive"}${imageOnly ? " is-image-only" : ""}${hideSpecs ? " is-no-specs" : ""}${textCenter ? " is-hero-text-center" : ""}${textRight ? " is-hero-text-right" : ""}">
        ${active ? "" : `<span class="slide-hero-inactive-badge">متوقفة — لن تظهر في الموقع حتى تُفعَّل</span>`}
        ${imageOnly ? `<span class="slide-hero-image-only-badge">صورة فقط — بدون نص</span>` : ""}
        ${hideSpecs ? `<span class="slide-hero-image-only-badge">بدون مواصفات</span>` : ""}
        ${product && !showAddToCart ? `<span class="slide-hero-image-only-badge">بدون زر السلة</span>` : ""}
        ${textCenter ? `<span class="slide-hero-image-only-badge">نص في الوسط</span>` : ""}
        ${textRight ? `<span class="slide-hero-image-only-badge">نص على اليمين</span>` : ""}
        <section class="hero-slider${imageOnly ? " is-image-only" : ""}${hideSpecs ? " is-no-specs" : ""}${textCenter ? " is-hero-text-center" : ""}${textRight ? " is-hero-text-right" : ""}" aria-hidden="true">
          <div class="slider-viewport">
            <div class="slider-track">${mediaHtml}</div>
            <div class="slider-shade"></div>
          </div>
          <div class="hero-inner"${imageOnly ? " hidden" : ""}${textCenter ? ' data-text-position="center"' : ""}${textRight ? ' data-text-position="right"' : ""}>
            <div>
              <div class="chips">
                ${chip1 ? `<span class="chip">${esc(chip1)}</span>` : ""}
                ${chip2 ? `<span class="chip">${esc(chip2)}</span>` : ""}
              </div>
              <h1>${esc(title)}</h1>
              <p class="lead">${esc(headline)}</p>
              <p class="muted">${esc(blurb)}</p>
              ${showPrice ? `<div class="slide-price">${money(product.price)}</div>` : ""}
              <div class="hero-cta">
                <span class="btn btn-primary">تصفح المواصفات واطلبه الآن</span>
                ${showAdd ? `<span class="btn btn-ghost">${esc(addLabel)}</span>` : ""}
              </div>
            </div>
            <aside class="spec-card"${hideSpecs ? " hidden" : ""}>
              <div><span>كرت الشاشة</span><b>${esc(gpu)}</b></div>
              <div><span>قدرة الكرت</span><b>${esc(tgp)}</b></div>
              <div><span>التبريد</span><b>${esc(cooling)}</b></div>
              <div><span>الشاشة</span><b>${esc(screen)}</b></div>
            </aside>
          </div>
          <div class="slider-nav">
            <span class="icon-btn" aria-hidden="true">‹</span>
            <div class="dots"><button type="button" class="on" tabindex="-1"></button><button type="button" tabindex="-1"></button></div>
            <span class="icon-btn" aria-hidden="true">›</span>
          </div>
        </section>
      </div>`;

    const hideSpecsInput = form.querySelector('[name="hideSpecs"]');
    if (hideSpecsInput) {
      hideSpecsInput.disabled = !!imageOnly;
      if (imageOnly) hideSpecsInput.checked = false;
    }
    const showAddInput = form.querySelector('[name="showAddToCart"]');
    if (showAddInput) {
      showAddInput.disabled = !!imageOnly;
      if (imageOnly) showAddInput.checked = false;
    }
    const textPositionInput = form.querySelector('[name="textPosition"]');
    if (textPositionInput) {
      textPositionInput.disabled = !!imageOnly;
      if (imageOnly) textPositionInput.value = "default";
    }
  }

  if (!form.dataset.previewBound) {
    form.dataset.previewBound = "1";
    const markDirty = () => {
      form.dataset.dirty = "1";
    };
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    form.addEventListener("input", syncSlidePreview);
    form.addEventListener("change", syncSlidePreview);
  }
  delete form.dataset.dirty;
  syncSlidePreview();
}

function psProductsListHtml(ids = [], formAttr = "data-ps-products-list") {
  if (!ids.length) {
    return `<p class="muted fp-empty">لا منتجات محددة بعد — أضف منتجات من القائمة أدناه.</p>`;
  }
  return ids
    .map((id, idx) => {
      const p = db().products.find((x) => x.id === id);
      if (!p) return "";
      return `<article class="fp-row" data-fp-row="${esc(id)}">
        <span class="fp-num">${idx + 1}</span>
        <img src="${esc(resolveAdminAsset(p.image))}" alt="" />
        <div><b>${esc(p.name)}</b><p class="muted">${esc(p.brand || "")} · ${esc(p.specs || "")}</p></div>
        <div class="fp-actions">
          <button class="btn btn-ghost" type="button" data-fp-up="${esc(id)}" ${idx === 0 ? "disabled" : ""}>↑</button>
          <button class="btn btn-ghost" type="button" data-fp-down="${esc(id)}" ${idx === ids.length - 1 ? "disabled" : ""}>↓</button>
          <button class="btn btn-ghost danger-text" type="button" data-fp-remove="${esc(id)}">إزالة</button>
        </div>
      </article>`;
    })
    .join("");
}

function adminBrandNames() {
  const fromTable = (db().brands || []).map((b) => b.name).filter(Boolean);
  const fromProducts = [...new Set(db().products.map((p) => p.brand).filter(Boolean))];
  return [...new Set([...fromTable, ...fromProducts])].sort((a, b) => a.localeCompare(b, "en"));
}

function psSourceMode(s = {}) {
  if (Array.isArray(s.productIds) && s.productIds.length) return "manual";
  if (s.brand) return "brand";
  return "category";
}

function psSourceLabel(s) {
  if (Array.isArray(s.productIds) && s.productIds.length) return `${s.productIds.length} منتج محدد`;
  if (s.brand) return `ماركة: ${s.brand}`;
  if (s.category && s.category !== "all") {
    const c = db().categories.find((x) => x.id === s.category);
    return `قسم: ${c?.title || s.category}`;
  }
  return "كل الأقسام";
}

function syncPsFormPanels(form) {
  if (!form) return;
  const source = form.querySelector("[data-ps-source]")?.value || "category";
  form.querySelectorAll("[data-ps-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.psPanel !== source;
  });
  const brand = form.querySelector("[name='brand']")?.value || "";
  const hint = form.querySelector("[data-ps-brand-count]");
  if (hint) {
    const n = brand ? db().products.filter((p) => p.brand === brand).length : 0;
    hint.textContent = brand ? `${n} منتج متاح لهذه الماركة` : "اختر ماركة لعرض عدد منتجاتها";
  }
  const link = form.querySelector("[name='linkUrl']");
  if (link && source === "brand" && brand && (!link.dataset.touched || link.value.includes("brand="))) {
    link.value = `/products?brand=${encodeURIComponent(brand)}`;
  }
}

function productSliderForm(s = {}) {
  const source = psSourceMode(s);
  const cat = s.category || "all";
  const brand = s.brand || "";
  const ids = source === "manual" && Array.isArray(s.productIds) ? s.productIds : [];
  const brands = adminBrandNames();
  const brandCount = brand ? db().products.filter((p) => p.brand === brand).length : 0;
  const addOptions = db()
    .products.filter((p) => !ids.includes(p.id))
    .map((p) => `<option value="${esc(p.id)}">${esc(p.brand ? `${p.brand} — ${p.name}` : p.name)}</option>`)
    .join("");
  return `<h2>${s.id ? "تعديل سلايدر منتجات" : "سلايدر منتجات جديد"}</h2>
    <p class="muted span-2">عرّف مصدراً واحداً للعرض: قسم، ماركة كاملة، أو منتجات تختارها يدوياً.</p>
    <form class="admin-form ps-form" data-ps-form data-id="${esc(s.id || "")}">
      <label>العنوان الصغير<input name="eyebrow" value="${esc(s.eyebrow || "")}" placeholder="مثال: أجهزة ASUS" /></label>
      <label>الحالة<select name="active"><option value="1" ${s.active !== false ? "selected" : ""}>نشط</option><option value="0" ${s.active === false ? "selected" : ""}>متوقف</option></select></label>
      <label class="span-2">العنوان<input name="title" required value="${esc(s.title || "")}" placeholder="مثال: تشكيلة ASUS المميزة" /></label>

      <label class="span-2">مصدر العرض
        <select name="source" data-ps-source>
          <option value="category" ${source === "category" ? "selected" : ""}>حسب القسم</option>
          <option value="brand" ${source === "brand" ? "selected" : ""}>حسب الماركة</option>
          <option value="manual" ${source === "manual" ? "selected" : ""}>منتجات محددة يدوياً</option>
        </select>
      </label>

      <div class="span-2 ps-panel" data-ps-panel="category" ${source === "category" ? "" : "hidden"}>
        <div class="ps-panel-grid">
          <label>القسم<select name="category"><option value="all" ${cat === "all" ? "selected" : ""}>كل الأقسام</option>${db().categories.map((c) => `<option value="${c.id}" ${cat === c.id ? "selected" : ""}>${esc(c.title)}</option>`).join("")}</select></label>
          <label>عدد المنتجات<input name="limit" type="number" min="1" max="24" value="${esc(s.limit || 8)}" /></label>
        </div>
      </div>

      <div class="span-2 ps-panel" data-ps-panel="brand" ${source === "brand" ? "" : "hidden"}>
        <div class="ps-panel-grid">
          <label>الماركة<select name="brand" data-ps-brand>
            <option value="">— اختر ماركة —</option>
            ${brands.map((b) => `<option value="${esc(b)}" ${brand === b ? "selected" : ""}>${esc(b)}</option>`).join("")}
          </select></label>
          <label>عدد المنتجات<input name="limitBrand" type="number" min="1" max="24" value="${esc(s.limit || 8)}" /></label>
        </div>
        <p class="muted ps-brand-hint" data-ps-brand-count>${brand ? `${brandCount} منتج متاح لهذه الماركة` : "اختر ماركة لعرض عدد منتجاتها"}</p>
      </div>

      <div class="span-2 ps-panel" data-ps-panel="manual" ${source === "manual" ? "" : "hidden"}>
        <div class="fp-panel">
          <div class="fp-list" data-ps-products-list>${psProductsListHtml(ids)}</div>
          <div class="fp-add"><select data-ps-pick ${addOptions ? "" : "disabled"}><option value="">+ إضافة منتج</option>${addOptions}</select></div>
          <input type="hidden" name="productIds" data-ps-ids value="${esc(JSON.stringify(ids))}" />
        </div>
      </div>

      <label class="span-2">رابط «كل المنتجات»<input name="linkUrl" data-ps-link value="${esc(s.linkUrl || "/products")}" /></label>
      <div class="modal-actions span-2"><button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>
      <button class="btn btn-primary" type="submit">حفظ السلايدر</button></div>
    </form>`;
}

function homeLayoutList() {
  const sliders = db().productSliders || [];
  if (typeof HomeLayout === "undefined") return [];
  return HomeLayout.normalize(db().settings?.homeLayout, sliders);
}

function renderHomeLayoutAdmin() {
  const list = homeLayoutList();
  return `
    <div class="slider-admin-head">
      <div class="toolbar-admin slider-toolbar">
        <a class="btn btn-ghost" href="/" target="_blank" rel="noopener">معاينة المتجر ↗</a>
        <button class="btn btn-primary" type="button" data-save-home-layout>حفظ الترتيب</button>
      </div>
    </div>
    <p class="muted home-layout-hint">اسحب الأقسام لإعادة ترتيب الصفحة الرئيسية. أوقف «ظاهر» لإخفاء قسم دون حذفه.</p>
  ${
    list.length
      ? `<div class="panel home-layout-list" data-home-layout-list>
          ${list
            .map(
              (item, idx) => `
            <article class="slide-admin-card home-layout-card ${item.active === false ? "is-off" : ""}" data-home-layout-row="${esc(item.id)}" draggable="true">
              <div class="slide-drag" title="اسحب لإعادة الترتيب">⠿</div>
              <div class="slide-order">${idx + 1}</div>
              <div class="slide-meta">
                <b>${esc(item.label)}</b>
                <div class="slide-tags"><span class="pill">${esc(HomeLayout.blockTypeLabel(item.type))}</span></div>
              </div>
              <label class="check-row home-layout-toggle">
                <input type="checkbox" data-home-layout-active ${item.active !== false ? "checked" : ""} />
                ظاهر
              </label>
            </article>`
            )
            .join("")}
        </div>`
      : `<div class="panel slide-empty"><p class="muted">لا توجد أقسام.</p></div>`
  }`;
}

function collectHomeLayoutFromDom() {
  const list = document.querySelector("[data-home-layout-list]");
  const base = homeLayoutList();
  if (!list) return base;
  const byId = new Map(base.map((b) => [b.id, { ...b }]));
  return [...list.querySelectorAll("[data-home-layout-row]")]
    .map((row) => {
      const item = byId.get(row.dataset.homeLayoutRow);
      if (!item) return null;
      const cb = row.querySelector("[data-home-layout-active]");
      item.active = cb?.checked !== false;
      return item;
    })
    .filter(Boolean);
}

function setupHomeLayoutDragDrop() {
  const list = document.querySelector("[data-home-layout-list]");
  if (!list || list.dataset.bound === "1") return;
  list.dataset.bound = "1";
  let dragId = null;
  list.querySelectorAll("[data-home-layout-row]").forEach((row) => {
    row.addEventListener("dragstart", () => {
      dragId = row.dataset.homeLayoutRow;
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      list.querySelectorAll("[data-home-layout-row]").forEach((r) => r.classList.remove("drag-over"));
    });
    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      row.classList.add("drag-over");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      const targetId = row.dataset.homeLayoutRow;
      if (!dragId || dragId === targetId) return;
      const fromEl = list.querySelector(`[data-home-layout-row="${dragId}"]`);
      const toEl = row;
      if (!fromEl || !toEl) return;
      const items = [...list.querySelectorAll("[data-home-layout-row]")];
      const fromIdx = items.indexOf(fromEl);
      const toIdx = items.indexOf(toEl);
      if (fromIdx < toIdx) toEl.after(fromEl);
      else toEl.before(fromEl);
      list.querySelectorAll("[data-home-layout-row]").forEach((r, i) => {
        const order = r.querySelector(".slide-order");
        if (order) order.textContent = String(i + 1);
      });
    });
  });
}

function renderFeaturedAdmin() {
  const list = [...(db().productSliders || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const active = list.filter((s) => s.active !== false).length;
  const brandCount = list.filter((s) => s.brand && !(s.productIds || []).length).length;
  return `
    <div class="slider-admin-head">
      <div class="kpi-grid slider-kpis">
        <div class="kpi"><span>سلايدرات المنتجات</span><b>${list.length}</b></div>
        <div class="kpi"><span>نشطة</span><b>${active}</b></div>
        <div class="kpi"><span>حسب ماركة</span><b>${brandCount}</b></div>
        <div class="kpi"><span>العرض</span><b>أفقي</b></div>
      </div>
      <div class="toolbar-admin slider-toolbar">
        <button class="btn btn-primary" type="button" data-add-ps>+ سلايدر منتجات جديد</button>
        <a class="btn btn-ghost" href="/" target="_blank" rel="noopener">معاينة المتجر ↗</a>
      </div>
    </div>
    ${
      list.length
        ? `<div class="slide-admin-list ps-admin-list" data-ps-list>
            ${list
              .map(
                (s, idx) => `
              <article class="slide-admin-card ps-admin-card ${s.active === false ? "is-off" : ""}" data-ps-row="${esc(s.id)}">
                <div class="slide-drag" title="اسحب لإعادة الترتيب">⠿</div>
                <div class="slide-order">${idx + 1}</div>
                <div class="ps-card-icon" aria-hidden="true">${s.brand ? "◆" : Array.isArray(s.productIds) && s.productIds.length ? "▣" : "▤"}</div>
                <div class="slide-meta">
                  <b>${esc(s.title)}</b>
                  <p class="muted">${esc(s.eyebrow || "بدون عنوان صغير")}</p>
                  <div class="slide-tags">
                    <span class="pill">${esc(psSourceLabel(s))}</span>
                    <span class="pill ${s.active === false ? "warn" : ""}">${s.active === false ? "متوقف" : "نشط"}</span>
                    ${!(s.productIds || []).length ? `<span class="pill">حد ${Number(s.limit) || 8}</span>` : ""}
                  </div>
                </div>
                <div class="slide-actions">
                  <button class="btn btn-ghost" type="button" data-ps-up="${esc(s.id)}" ${idx === 0 ? "disabled" : ""}>↑</button>
                  <button class="btn btn-ghost" type="button" data-ps-down="${esc(s.id)}" ${idx === list.length - 1 ? "disabled" : ""}>↓</button>
                  <button class="btn btn-ghost" type="button" data-ps-toggle="${esc(s.id)}">${s.active === false ? "تفعيل" : "إيقاف"}</button>
                  <button class="btn btn-ghost" type="button" data-edit-ps="${esc(s.id)}">تعديل</button>
                  <button class="btn btn-ghost danger-text" type="button" data-del-ps="${esc(s.id)}">حذف</button>
                </div>
              </article>`
              )
              .join("")}
          </div>`
        : `<div class="panel slide-empty">
            <h2>لا توجد سلايدرات منتجات</h2>
            <p class="muted">أنشئ سلايدراً حسب القسم أو الماركة أو باختيار منتجات يدوياً.</p>
            <button class="btn btn-primary" type="button" data-add-ps>+ سلايدر منتجات جديد</button>
          </div>`
    }`;
}

function readPsIds(form) {
  const raw = form?.querySelector("[data-ps-ids]")?.value;
  try {
    const ids = JSON.parse(raw || "[]");
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

function updatePsIdsForm(form, ids) {
  const hidden = form?.querySelector("[data-ps-ids]");
  const list = form?.querySelector("[data-ps-products-list]");
  const pick = form?.querySelector("[data-ps-pick]");
  if (hidden) hidden.value = JSON.stringify(ids);
  if (list) list.innerHTML = psProductsListHtml(ids);
  if (pick) {
    pick.disabled = false;
    pick.innerHTML = `<option value="">+ إضافة منتج</option>${db()
      .products.filter((p) => !ids.includes(p.id))
      .map((p) => `<option value="${esc(p.id)}">${esc(p.brand ? `${p.brand} — ${p.name}` : p.name)}</option>`)
      .join("")}`;
    if (!pick.querySelector("option[value]:not([value=''])")) pick.disabled = true;
  }
}

function setupPsDragDrop() {
  const list = document.querySelector("[data-ps-list]");
  if (!list) return;
  let dragId = null;
  list.querySelectorAll("[data-ps-row]").forEach((row) => {
    row.draggable = true;
    row.addEventListener("dragstart", (e) => {
      dragId = row.dataset.psRow;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      list.querySelectorAll("[data-ps-row]").forEach((r) => r.classList.remove("drag-over"));
    });
    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      row.classList.add("drag-over");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      const targetId = row.dataset.psRow;
      if (!dragId || dragId === targetId) return;
      void (async () => {
        const sliders = [...db().productSliders].sort((a, b) => a.sortOrder - b.sortOrder);
        const from = sliders.findIndex((s) => s.id === dragId);
        const to = sliders.findIndex((s) => s.id === targetId);
        if (from < 0 || to < 0) return;
        const [item] = sliders.splice(from, 1);
        sliders.splice(to, 0, item);
        try {
          await StoreDB.reorderProductSliders(sliders.map((s) => s.id));
          toast("تم تحديث الترتيب");
          render();
        } catch (err) {
          toast(err.message || "تعذر الترتيب");
        }
      })();
    });
  });
}

function renderSliderAdmin() {
  const list = [...(db().slides || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  const active = list.filter((s) => s.active !== false).length;
  const inactive = list.length - active;
  return `
    <div class="slider-admin-head">
      <div class="kpi-grid slider-kpis">
        <div class="kpi"><span>إجمالي الشرائح</span><b>${list.length}</b></div>
        <div class="kpi"><span>نشطة على الموقع</span><b>${active}</b></div>
        <div class="kpi"><span>متوقفة</span><b>${inactive}</b></div>
        <div class="kpi"><span>الحركة</span><b>↔ أفقي</b></div>
      </div>
      <div class="toolbar-admin slider-toolbar">
        <button class="btn btn-primary" type="button" data-add-slide>+ إضافة شريحة</button>
        <a class="btn btn-ghost" href="/" target="_blank" rel="noopener">معاينة المتجر ↗</a>
      </div>
    </div>
    ${
      list.length
        ? `<div class="panel slide-preview-strip">
            <h2>ترتيب العرض على الموقع</h2>
            <p class="muted">من اليسار إلى اليمين — اسحب البطاقات أو استخدم ↑ ↓</p>
            <div class="slide-strip-track">
              ${list
                .map(
                  (s, idx) => `
                <figure class="slide-strip-item ${s.active === false ? "off" : ""}">
                  <span class="slide-strip-num">${idx + 1}</span>
                  ${s.image ? `<img src="${esc(resolveAdminAsset(s.image))}" alt="" />` : `<span class="slide-strip-empty">بدون صورة</span>`}
                  <figcaption>${esc(s.title)}</figcaption>
                </figure>`
                )
                .join("")}
            </div>
          </div>
          <div class="slide-admin-list" data-slide-list>
            ${list
              .map(
                (s, idx) => `
              <article class="slide-admin-card ${s.active === false ? "is-off" : ""}" data-slide-row="${esc(s.id)}" draggable="true">
                <div class="slide-drag" title="اسحب لإعادة الترتيب">⠿</div>
                <div class="slide-order">${idx + 1}</div>
                <div class="slide-thumb">
                  ${s.image ? `<img src="${esc(resolveAdminAsset(s.image))}" alt="" />` : `<span>—</span>`}
                </div>
                <div class="slide-meta">
                  <b>${esc(s.title)}</b>
                  <p class="muted">${esc(s.headline || "بدون عنوان فرعي")}</p>
                  <div class="slide-tags">
                    ${s.category ? `<span class="pill">${esc(s.category)}</span>` : ""}
                    ${s.productId ? `<span class="pill">منتج</span>` : ""}
                    ${s.imageOnly ? `<span class="pill">صورة فقط</span>` : ""}
                    ${s.hideSpecs && !s.imageOnly ? `<span class="pill">بدون مواصفات</span>` : ""}
                    ${s.productId && s.showAddToCart === false ? `<span class="pill">بدون زر السلة</span>` : ""}
                    ${slideTextPositionLabel(s.textPosition) ? `<span class="pill">${esc(slideTextPositionLabel(s.textPosition))}</span>` : ""}
                    <span class="pill ${s.active === false ? "warn" : ""}">${s.active === false ? "متوقفة" : "نشطة"}</span>
                  </div>
                </div>
                <div class="slide-actions">
                  <button class="btn btn-ghost" type="button" data-slide-up="${esc(s.id)}" ${idx === 0 ? "disabled" : ""} title="تصعيد">↑</button>
                  <button class="btn btn-ghost" type="button" data-slide-down="${esc(s.id)}" ${idx === list.length - 1 ? "disabled" : ""} title="تنزيل">↓</button>
                  <button class="btn btn-ghost" type="button" data-slide-toggle="${esc(s.id)}" title="تفعيل/إيقاف">${s.active === false ? "تفعيل" : "إيقاف"}</button>
                  <button class="btn btn-ghost" type="button" data-edit-slide="${esc(s.id)}">تعديل</button>
                  <button class="btn btn-ghost danger-text" type="button" data-del-slide="${esc(s.id)}">حذف</button>
                </div>
              </article>`
              )
              .join("")}
          </div>`
        : `<div class="panel slide-empty">
            <h2>لا توجد شرائح بعد</h2>
            <p class="muted">أضف أول شريحة عرض لتظهر في السلايدر المتحرك على الصفحة الرئيسية.</p>
            <button class="btn btn-primary" type="button" data-add-slide>+ إضافة أول شريحة</button>
          </div>`
    }`;
}

function setupSlideDragDrop() {
  const list = document.querySelector("[data-slide-list]");
  if (!list) return;
  let dragId = null;
  list.querySelectorAll("[data-slide-row]").forEach((row) => {
    row.addEventListener("dragstart", (e) => {
      dragId = row.dataset.slideRow;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
      list.querySelectorAll("[data-slide-row]").forEach((r) => r.classList.remove("drag-over"));
    });
    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      row.classList.add("drag-over");
    });
    row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      const targetId = row.dataset.slideRow;
      if (!dragId || dragId === targetId) return;
      void (async () => {
        const slides = [...db().slides].sort((a, b) => a.sortOrder - b.sortOrder);
        const from = slides.findIndex((s) => s.id === dragId);
        const to = slides.findIndex((s) => s.id === targetId);
        if (from < 0 || to < 0) return;
        const [item] = slides.splice(from, 1);
        slides.splice(to, 0, item);
        try {
          await StoreDB.reorderSlides(slides.map((s) => s.id));
          toast("تم تحديث الترتيب");
          render();
        } catch (err) {
          toast(err.message || "تعذر الترتيب");
        }
      })();
    });
  });
}

function renderSettings() {
  const s = db().settings;
  const maintenanceOn = !!s.maintenanceMode;
  return `<form class="panel admin-form" data-settings-form>
    <section class="panel maintenance-admin-panel span-2 ${maintenanceOn ? "is-on" : ""}">
      <h3>وضع الصيانة</h3>
      <label class="check-row">
        <input type="checkbox" name="maintenanceMode" value="1" ${maintenanceOn ? "checked" : ""} />
        إيقاف واجهة المتجر وعرض صفحة «تحت الصيانة» للزوار
      </label>
      <p class="muted">لوحة التحكم تبقى متاحة لك وللفريق الإداري فقط.</p>
      <label class="span-2">رسالة الصيانة للزوار
        <textarea name="maintenanceMessage" rows="3" placeholder="نعمل على تحسين تجربتكم. سنعود قريباً.">${esc(s.maintenanceMessage || "")}</textarea>
      </label>
    </section>
    <section class="panel storefront-cart-panel span-2">
      <h3>السلة والشراء</h3>
      <label class="check-row">
        <input type="checkbox" name="cartEnabled" value="1" ${s.cartEnabled !== false ? "checked" : ""} />
        تفعيل السلة — إظهار «أضف إلى السلة» وصفحة السلة للزوار
      </label>
      <p class="muted">عند الإيقاف يظهر زر استفسار واتساب بدل السلة في بطاقات المنتجات وصفحة الجهاز.</p>
    </section>
    <h3 class="span-2 settings-section-title">هوية المتجر</h3>
    <label>اسم المتجر EN<input name="name" value="${esc(s.name)}" /></label>
    <label>اسم المتجر AR<input name="nameAr" value="${esc(s.nameAr)}" /></label>
    <label>المدينة<input name="city" value="${esc(s.city)}" /></label>
    <label>الهاتف<input name="phone" value="${esc(s.phone)}" /></label>
    <label>رقم واتساب المدير<input name="whatsapp" value="${esc(s.whatsapp || s.phone)}" placeholder="0772 222 4489" /></label>
    <p class="muted span-2">رقم واتساب المدير يستقبل رسالة تأكيد الطلب التلقائية من الزبون بعد إتمام الشراء.</p>
    <label class="span-2">العنوان<input name="address" value="${esc(s.address)}" /></label>
    <label class="span-2">العنوان الكامل<input name="fullAddress" value="${esc(s.fullAddress)}" /></label>
    <label>البريد<input name="email" value="${esc(s.email)}" /></label>
    <label>ساعات العمل<input name="hours" value="${esc(s.hours)}" /></label>
    <label class="span-2">الضمان<input name="warranty" value="${esc(s.warranty)}" /></label>
    <label class="span-2">الإشعار (الشريط العلوي)<input name="notice" value="${esc(s.notice || "")}" /></label>
    <label class="span-2">رفع شعار جديد<input name="logoFile" type="file" accept="image/*" /></label>
    <p class="muted span-2">الشعار الحالي: ${s.logo ? `<img src="${esc(resolveAdminAsset(s.logo))}" alt="" class="logo-preview" />` : "—"}</p>
    <div class="span-2"><button class="btn btn-primary" type="submit">حفظ الإعدادات</button></div>
  </form>`;
}

function galleryImageSrc(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.src || value.url || "";
  return "";
}

function gallerySlotPreview(src, label) {
  const url = typeof src === "object" && src ? src.src || src.url || "" : src;
  if (!url) return `<div class="gallery-slot-empty">${esc(label)}</div>`;
  return `<img src="${esc(resolveAdminAsset(url))}" alt="" class="gallery-slot-preview" />`;
}

function renderGalleryAdmin() {
  const g = db().settings?.officeGallery || {
    active: true,
    title: "من داخل مكتب بيست لابتوب",
    images: {},
  };
  const images = g.images || {};
  const slots = [
    { key: "wide", label: "علوية عريضة", hint: "الصورة الأفقية في الأعلى" },
    { key: "tall", label: "يمين طويلة", hint: "الصورة العمودية على اليمين" },
    { key: "bottomStart", label: "سفلى يمين", hint: "تحت العريضة باتجاه اليمين" },
    { key: "bottomEnd", label: "سفلى يسار", hint: "تحت العريضة باتجاه اليسار" },
  ];
  const uploadHint = window.__galleryUploadHint
    ? `<p class="muted span-2" style="margin-bottom:12px;padding:12px;border-radius:10px;border:1px solid rgba(234,179,8,.45);background:rgba(234,179,8,.08)">${esc(window.__galleryUploadHint)}</p>`
    : "";
  return `<form class="panel admin-form gallery-admin-form" data-gallery-form>
    ${uploadHint}
    <label class="span-2 check-row"><input type="checkbox" name="active" value="1" ${g.active !== false ? "checked" : ""} /> تفعيل قسم المعرض على الرئيسية</label>
    <label class="span-2">عنوان القسم<input name="title" value="${esc(g.title || "من داخل مكتب بيست لابتوب")}" /></label>
    <div class="span-2 gallery-slots">
      ${slots
        .map(
          (s) => `<div class="gallery-slot" data-gallery-slot="${esc(s.key)}">
          <div class="gallery-slot-thumb">${gallerySlotPreview(images[s.key], s.label)}</div>
          <div class="gallery-slot-meta">
            <strong>${esc(s.label)}</strong>
            <p class="muted">${esc(s.hint)}</p>
            <input type="hidden" name="keep_${s.key}" value="${esc(galleryImageSrc(images[s.key]))}" />
            <label class="file-label">رفع / استبدال<input name="file_${s.key}" type="file" accept="image/*" /></label>
            <button class="btn btn-ghost" type="button" data-clear-gallery="${esc(s.key)}" ${images[s.key] ? "" : "disabled"}>إزالة الصورة</button>
          </div>
        </div>`
        )
        .join("")}
    </div>
    <div class="span-2"><button class="btn btn-primary" type="submit">حفظ المعرض</button></div>
  </form>`;
}

function renderUsers() {
  return `<div class="toolbar-admin"><button class="btn btn-primary" type="button" data-add-user>إضافة مستخدم</button></div>
    <div class="panel table-wrap"><table class="data-table">
      <thead><tr><th>الاسم</th><th>اسم المستخدم</th><th>الدور</th><th></th></tr></thead>
      <tbody>${db()
        .users.map(
          (u) => `<tr><td>${esc(u.name)}</td><td><code>${esc(u.username)}</code></td>
          <td><span class="pill">${u.role === "admin" ? "أدمن" : "مدير"}</span></td>
          <td class="row-actions">
            <button class="btn btn-ghost" type="button" data-edit-user="${esc(u.id)}">تعديل</button>
            <button class="btn btn-ghost" type="button" data-del-user="${esc(u.id)}">حذف</button>
          </td></tr>`
        )
        .join("")}</tbody></table></div>
    <p class="muted" style="margin-top:12px">يمكنك تغيير اسم المستخدم وكلمة المرور من «تعديل». اترك كلمة المرور فارغة للإبقاء على الحالية.</p>`;
}

function userForm(u = {}) {
  const isEdit = !!u.id;
  return `<h2>${isEdit ? "تعديل مستخدم" : "مستخدم جديد"}</h2>
    <form class="admin-form" data-user-form data-id="${esc(u.id || "")}">
    <label>الاسم<input name="name" required value="${esc(u.name || "")}" /></label>
    <label>اسم المستخدم<input name="username" required autocomplete="username" value="${esc(u.username || "")}" /></label>
    <label class="span-2">كلمة المرور${isEdit ? " <small class=\"muted\">(اتركها فارغة للإبقاء على الحالية)</small>" : ""}
      <input name="password" type="password" autocomplete="new-password" ${isEdit ? "" : "required"} /></label>
    <label>الدور<select name="role">
      <option value="manager" ${u.role === "manager" ? "selected" : ""}>مدير</option>
      <option value="admin" ${u.role === "admin" ? "selected" : ""}>أدمن</option>
    </select></label>
    <div class="modal-actions span-2"><button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>
    <button class="btn btn-primary" type="submit">${isEdit ? "حفظ التعديلات" : "إضافة"}</button></div></form>`;
}

function catForm(c = {}) {
  return `<h2>${c.id ? "تعديل تصنيف" : "تصنيف جديد"}</h2>
    <form class="admin-form" data-cat-form data-id="${esc(c.id || "")}">
      <label>المعرف<input name="id" required ${c.id ? "readonly" : ""} value="${esc(c.id || "")}" /></label>
      <label>الاسم<input name="title" required value="${esc(c.title || "")}" /></label>
      <label class="span-2">الوصف<input name="text" value="${esc(c.text || "")}" /></label>
      <div class="modal-actions span-2"><button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>
      <button class="btn btn-primary" type="submit">حفظ</button></div></form>`;
}

function brandForm(b = {}) {
  return `<h2>${b.id ? "تعديل علامة" : "علامة جديدة"}</h2>
    <form class="admin-form" data-brand-form data-id="${esc(b.id || "")}">
      <label>الاسم<input name="name" required value="${esc(b.name || "")}" /></label>
      <label>البلد<input name="country" value="${esc(b.country || "")}" /></label>
      <div class="modal-actions span-2"><button class="btn btn-ghost" type="button" data-close-modal>إلغاء</button>
      <button class="btn btn-primary" type="submit">حفظ</button></div></form>`;
}

const PAGES = {
  dashboard: renderDashboard,
  products: renderProducts,
  categories: renderCategories,
  brands: renderBrands,
  orders: renderOrders,
  customers: renderCustomers,
  coupons: renderCoupons,
  inventory: renderInventory,
  slider: renderSliderAdmin,
  featured: renderFeaturedAdmin,
  "home-layout": renderHomeLayoutAdmin,
  gallery: renderGalleryAdmin,
  settings: renderSettings,
  users: renderUsers,
};

function render(opts = {}) {
  const user = session();
  if (!user) return;
  const route = parseRoute();
  if (route.page === "product-editor" && !StoreDB.can(user.role, "products")) {
    location.hash = "#/dashboard";
    return;
  }
  let id = route.page === "product-editor" ? "products" : route.page;
  if (!StoreDB.can(user.role, id)) {
    location.hash = "#/dashboard";
    id = "dashboard";
  }
  document.querySelector("[data-user-name]").textContent = user.name;
  document.querySelector("[data-user-role]").textContent = user.role === "admin" ? "أدمن" : "مدير";
  const s = db().settings;
  const logo = document.querySelector("[data-admin-logo]");
  if (logo && s.logo) logo.src = resolveAdminAsset(s.logo);
  renderNav(user);

  if (route.page === "product-editor") {
    document.body.classList.add("admin-product-editor");
    document.querySelector("[data-page-kicker]").textContent = "المنتجات";
    document.querySelector("[data-page-title]").textContent = route.mode === "new" ? "إضافة منتج" : "تعديل منتج";
    document.querySelector("[data-admin-view]").innerHTML = renderProductEditor(route.mode === "edit" ? route.id : null);
    paintImagePreviews(getProductImages());
    setupProductEditor();
    return;
  }
  document.body.classList.remove("admin-product-editor");

  document.querySelector("[data-page-kicker]").textContent = TITLES[id][0];
  document.querySelector("[data-page-title]").textContent = TITLES[id][1];
  document.querySelector("[data-admin-view]").innerHTML = PAGES[id]();
  if (id === "slider") setupSlideDragDrop();
  if (id === "featured") setupPsDragDrop();
  if (id === "home-layout") setupHomeLayoutDragDrop();
  if (opts.focus) {
    const field = document.querySelector(opts.focus);
    if (field) {
      field.focus();
      const pos = Number(opts.pos || field.value.length);
      if (field.setSelectionRange) field.setSelectionRange(pos, pos);
    }
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-logout]")) {
    StoreDB.logout();
    location.replace("login.html");
  }
  if (e.target.closest("[data-sidebar-toggle]")) document.querySelector(".admin-app").classList.toggle("nav-open");
  const delP = e.target.closest("[data-del-product]");
  if (delP) {
    const product = db().products.find((x) => x.id === delP.dataset.delProduct);
    if (product) openModal(productDeleteConfirmModal(product));
    else toast("المنتج غير موجود");
  }
  const confirmDelP = e.target.closest("[data-confirm-del-product]");
  if (confirmDelP) {
    void (async () => {
      try {
        await StoreDB.deleteProduct(confirmDelP.dataset.confirmDelProduct);
        closeModal(true);
        toast("تم حذف المنتج");
        render();
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
  }
  if (e.target.closest("[data-add-cat]")) openModal(catForm());
  const editC = e.target.closest("[data-edit-cat]");
  if (editC) openModal(catForm(db().categories.find((x) => x.id === editC.dataset.editCat)));
  const delC = e.target.closest("[data-del-cat]");
  if (delC) {
    void (async () => {
      try {
        await StoreDB.deleteCategory(delC.dataset.delCat);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
  }
  if (e.target.closest("[data-add-brand]")) openModal(brandForm());
  const editB = e.target.closest("[data-edit-brand]");
  if (editB) openModal(brandForm(db().brands.find((x) => x.id === editB.dataset.editBrand)));
  const delB = e.target.closest("[data-del-brand]");
  if (delB) {
    void (async () => {
      try {
        await StoreDB.deleteBrand(delB.dataset.delBrand);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
  }
  if (e.target.closest("[data-add-coupon]")) openModal(couponForm());
  const editCp = e.target.closest("[data-edit-coupon]");
  if (editCp) openModal(couponForm(db().coupons.find((x) => x.id === editCp.dataset.editCoupon)));
  const delCp = e.target.closest("[data-del-coupon]");
  if (delCp) {
    void (async () => {
      try {
        await StoreDB.deleteCoupon(delCp.dataset.delCoupon);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
  }
  if (e.target.closest("[data-add-slide]")) {
    openModal(slideForm(), { wide: true });
    setupSlideEditor();
  }
  if (e.target.closest("[data-save-home-layout]")) {
    void (async () => {
      try {
        const next = { ...db().settings, homeLayout: collectHomeLayoutFromDom() };
        await StoreDB.saveSettings(next);
        toast("تم حفظ ترتيب الصفحة الرئيسية");
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const editSlide = e.target.closest("[data-edit-slide]");
  if (editSlide) {
    openModal(slideForm(db().slides.find((x) => x.id === editSlide.dataset.editSlide)), { wide: true });
    setupSlideEditor();
  }
  const delSlide = e.target.closest("[data-del-slide]");
  if (delSlide && confirm("حذف هذه الشريحة؟")) {
    void (async () => {
      try {
        await StoreDB.deleteSlide(delSlide.dataset.delSlide);
        toast("تم الحذف");
        render();
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
  }
  const slideUp = e.target.closest("[data-slide-up]");
  if (slideUp) {
    void (async () => {
      const list = [...db().slides].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = list.findIndex((s) => s.id === slideUp.dataset.slideUp);
      if (idx > 0) {
        [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
        await StoreDB.reorderSlides(list.map((s) => s.id));
        toast("تم التصعيد");
        render();
      }
    })();
  }
  const slideDown = e.target.closest("[data-slide-down]");
  if (slideDown) {
    void (async () => {
      const list = [...db().slides].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = list.findIndex((s) => s.id === slideDown.dataset.slideDown);
      if (idx >= 0 && idx < list.length - 1) {
        [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
        await StoreDB.reorderSlides(list.map((s) => s.id));
        toast("تم التنزيل");
        render();
      }
    })();
  }
  const slideToggle = e.target.closest("[data-slide-toggle]");
  if (slideToggle) {
    void (async () => {
      const s = db().slides.find((x) => x.id === slideToggle.dataset.slideToggle);
      if (!s) return;
      try {
        await StoreDB.saveSlide({ ...s, active: s.active === false });
        toast(s.active === false ? "تم التفعيل" : "تم الإيقاف");
        render();
      } catch (err) {
        toast(err.message || "تعذر التحديث");
      }
    })();
  }
  const fpRemove = e.target.closest("[data-fp-remove]");
  if (fpRemove) {
    const form = fpRemove.closest("[data-ps-form]");
    if (!form) return;
    const ids = readPsIds(form).filter((id) => id !== fpRemove.dataset.fpRemove);
    updatePsIdsForm(form, ids);
  }
  const fpUp = e.target.closest("[data-fp-up]");
  if (fpUp) {
    const form = fpUp.closest("[data-ps-form]");
    if (!form) return;
    const ids = readPsIds(form);
    const idx = ids.indexOf(fpUp.dataset.fpUp);
    if (idx > 0) {
      [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
      updatePsIdsForm(form, ids);
    }
  }
  const fpDown = e.target.closest("[data-fp-down]");
  if (fpDown) {
    const form = fpDown.closest("[data-ps-form]");
    if (!form) return;
    const ids = readPsIds(form);
    const idx = ids.indexOf(fpDown.dataset.fpDown);
    if (idx >= 0 && idx < ids.length - 1) {
      [ids[idx + 1], ids[idx]] = [ids[idx], ids[idx + 1]];
      updatePsIdsForm(form, ids);
    }
  }
  if (e.target.closest("[data-add-ps]")) {
    openModal(productSliderForm(), { wide: true });
    syncPsFormPanels(document.querySelector("[data-ps-form]"));
  }
  const clearGallery = e.target.closest("[data-clear-gallery]");
  if (clearGallery) {
    const slot = clearGallery.closest("[data-gallery-slot]");
    if (slot) {
      const key = clearGallery.dataset.clearGallery;
      const keep = slot.querySelector(`input[name="keep_${key}"]`);
      if (keep) keep.value = "";
      const thumb = slot.querySelector(".gallery-slot-thumb");
      if (thumb) thumb.innerHTML = `<div class="gallery-slot-empty">${esc(slot.querySelector("strong")?.textContent || "صورة")}</div>`;
      const file = slot.querySelector(`input[name="file_${key}"]`);
      if (file) file.value = "";
      clearGallery.disabled = true;
    }
  }
  const editPs = e.target.closest("[data-edit-ps]");
  if (editPs) {
    openModal(productSliderForm(db().productSliders.find((x) => x.id === editPs.dataset.editPs)), { wide: true });
    syncPsFormPanels(document.querySelector("[data-ps-form]"));
  }
  const delPs = e.target.closest("[data-del-ps]");
  if (delPs && confirm("حذف هذا السلايدر؟")) {
    void (async () => {
      try {
        await StoreDB.deleteProductSlider(delPs.dataset.delPs);
        toast("تم الحذف");
        render();
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
  }
  const psUp = e.target.closest("[data-ps-up]");
  if (psUp) {
    void (async () => {
      const list = [...db().productSliders].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = list.findIndex((s) => s.id === psUp.dataset.psUp);
      if (idx > 0) {
        [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
        await StoreDB.reorderProductSliders(list.map((s) => s.id));
        toast("تم التصعيد");
        render();
      }
    })();
  }
  const psDown = e.target.closest("[data-ps-down]");
  if (psDown) {
    void (async () => {
      const list = [...db().productSliders].sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = list.findIndex((s) => s.id === psDown.dataset.psDown);
      if (idx >= 0 && idx < list.length - 1) {
        [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
        await StoreDB.reorderProductSliders(list.map((s) => s.id));
        toast("تم التنزيل");
        render();
      }
    })();
  }
  const psToggle = e.target.closest("[data-ps-toggle]");
  if (psToggle) {
    void (async () => {
      const s = db().productSliders.find((x) => x.id === psToggle.dataset.psToggle);
      if (!s) return;
      try {
        await StoreDB.saveProductSlider({ ...s, active: s.active === false });
        toast(s.active === false ? "تم التفعيل" : "تم الإيقاف");
        render();
      } catch (err) {
        toast(err.message || "تعذر التحديث");
      }
    })();
  }
  if (e.target.closest("[data-add-user]")) openModal(userForm());
  const editU = e.target.closest("[data-edit-user]");
  if (editU) {
    const u = db().users.find((x) => x.id === editU.dataset.editUser);
    if (u) openModal(userForm(u));
  }
  const delU = e.target.closest("[data-del-user]");
  if (delU) {
    void (async () => {
      const users = db().users;
      if (users.filter((u) => u.role === "admin").length < 2 && users.find((u) => u.id === delU.dataset.delUser)?.role === "admin") {
        toast("لا يمكن حذف آخر أدمن");
        return;
      }
      try {
        await StoreDB.deleteUser(delU.dataset.delUser);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
  }
  const customerHistory = e.target.closest("[data-customer-history]");
  if (customerHistory) {
    openCustomerHistoryByPhone(customerHistory.dataset.customerHistory);
    return;
  }
  const orderDetail = e.target.closest("[data-order-detail]");
  if (orderDetail) {
    const o = db().orders.find((x) => x.id === orderDetail.dataset.orderDetail);
    if (o) openModal(orderDetailModal(o));
    return;
  }
  const delOrder = e.target.closest("[data-del-order]");
  if (delOrder) {
    const order = db().orders.find((x) => x.id === delOrder.dataset.delOrder);
    if (!order) {
      toast("الطلب غير موجود");
      return;
    }
    openModal(orderDeleteConfirmModal(order, delOrder.dataset.delOrderReturnPhone || ""));
    return;
  }
  const confirmDelOrder = e.target.closest("[data-confirm-del-order]");
  if (confirmDelOrder) {
    const returnPhone = confirmDelOrder.dataset.delOrderReturnPhone || "";
    void (async () => {
      try {
        await StoreDB.deleteOrder(confirmDelOrder.dataset.confirmDelOrder);
        toast("تم حذف سجل الشراء");
        render();
        if (returnPhone) openCustomerHistoryByPhone(returnPhone);
        else closeModal(true);
      } catch (err) {
        toast(err.message || "تعذر الحذف");
      }
    })();
    return;
  }
  const rmImg = e.target.closest("[data-rm-img]");
  if (rmImg) {
    const list = getProductImages();
    list.splice(Number(rmImg.dataset.rmImg), 1);
    setProductImages(list);
    setupProductEditor();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.matches("[data-p-cat], [data-p-stock], [data-o-st]")) render();
  if (e.target.matches("[data-order-status]")) {
    void (async () => {
      try {
        await StoreDB.updateOrderStatus(e.target.dataset.orderStatus, e.target.value);
        toast("تم تحديث حالة الطلب");
        render();
      } catch (err) {
        toast(err.message || "تعذر التحديث");
      }
    })();
  }
  if (e.target.matches("[data-stock-id]")) {
    void (async () => {
      try {
        await StoreDB.updateStock(e.target.dataset.stockId, Number(e.target.value));
        toast("تم تحديث المخزون");
      } catch (err) {
        toast(err.message || "تعذر التحديث");
      }
    })();
  }
  if (e.target.matches("[data-product-files]")) {
    void (async () => {
      const files = [...e.target.files];
      if (!files.length) return;
      const list = getProductImages();
      try {
        for (const file of files) {
          const dataUrl = await readFileAsDataUrl(file);
          const url = await StoreDB.uploadImage(dataUrl, "products");
          list.push(url);
        }
        setProductImages(list);
        e.target.value = "";
        setupProductEditor();
        toast("تم رفع الصور");
      } catch (err) {
        toast(err.message || "تعذر رفع الصورة");
      }
    })();
  }
  if (e.target.matches("[data-ps-pick]") && e.target.value) {
    const form = e.target.closest("[data-ps-form]");
    if (!form) return;
    const ids = readPsIds(form);
    if (!ids.includes(e.target.value)) ids.push(e.target.value);
    updatePsIdsForm(form, ids);
    e.target.value = "";
  }
  if (e.target.matches("[data-ps-source], [data-ps-brand]")) {
    const form = e.target.closest("[data-ps-form]");
    syncPsFormPanels(form);
  }
  if (e.target.matches("[data-ps-link]")) {
    e.target.dataset.touched = "1";
  }
  if (e.target.matches("[data-slide-file]")) {
    void (async () => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const url = await StoreDB.uploadImage(dataUrl, "slides");
        const form = e.target.closest("form");
        const hidden = form?.querySelector("[data-slide-image]");
        if (hidden) hidden.value = url;
        setupSlideEditor();
        toast("تم رفع الصورة");
      } catch (err) {
        toast(err.message || "تعذر رفع الصورة");
      }
    })();
  }
  if (e.target.matches("[data-slide-product]")) {
    const form = e.target.closest("form");
    if (!form) return;
    const p = db().products.find((x) => x.id === e.target.value);
    if (!p) {
      setupSlideEditor();
      return;
    }
    const set = (name, val) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el && !el.value) el.value = val || "";
    };
    set("title", p.name);
    set("headline", p.headline);
    set("blurb", p.blurb);
    set("category", p.category);
    set("tag", p.tag);
    set("gpu", p.gpu);
    set("tgp", p.tgp);
    set("cooling", p.cooling);
    set("screen", p.screen);
    const hidden = form.querySelector("[data-slide-image]");
    if (hidden && !hidden.value && p.image) {
      hidden.value = p.image;
    }
    setupSlideEditor();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.matches("[data-p-q], [data-o-q]")) {
    render({ focus: e.target.matches("[data-p-q]") ? "[data-p-q]" : "[data-o-q]", pos: e.target.selectionStart });
  }
});

document.addEventListener("submit", (e) => {
  const productFormEl = e.target.closest("[data-product-form]");
  if (productFormEl) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(productFormEl);
      const id = productFormEl.dataset.id || StoreDB.uid("pr");
      let images = [];
      try {
        images = JSON.parse(f.get("imagesJson") || "[]");
      } catch {
        images = [];
      }
      if (!images.length) {
        toast("أضف صورة واحدة على الأقل");
        return;
      }
      const isNew = !productFormEl.dataset.id;
      const item = {
        id,
        name: f.get("name"),
        brand: f.get("brand"),
        category: f.get("category"),
        price: parseMoneyInput(f.get("price")),
        oldPrice: f.get("oldPrice") ? parseMoneyInput(f.get("oldPrice")) : null,
        stock: Number(f.get("stock")),
        cpu: f.get("cpu"),
        gpu: f.get("gpu"),
        ram: f.get("ram"),
        storage: f.get("storage"),
        tag: f.get("tag"),
        screen: f.get("screen"),
        images,
        image: images[0],
        specs: f.get("specs") || `${f.get("gpu")} · ${f.get("ram")} · ${f.get("storage")}`,
        headline: f.get("headline") || "",
        blurb: f.get("blurb") || "",
        tgp: f.get("tgp") || "",
        cooling: f.get("cooling") || "",
        ...(isNew ? { createdAt: new Date().toISOString() } : {}),
      };
      try {
        await StoreDB.saveProduct(item);
        closeModal(true);
        toast("تم حفظ المنتج");
        location.hash = "#/products";
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const catFormEl = e.target.closest("[data-cat-form]");
  if (catFormEl) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(catFormEl);
      const item = { id: f.get("id"), title: f.get("title"), text: f.get("text") };
      try {
        await StoreDB.saveCategory(item);
        closeModal(true);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const brandFormEl = e.target.closest("[data-brand-form]");
  if (brandFormEl) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(brandFormEl);
      const id = brandFormEl.dataset.id || StoreDB.uid("br");
      const item = { id, name: f.get("name"), country: f.get("country") };
      try {
        await StoreDB.saveBrand(item);
        closeModal(true);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const couponFormEl = e.target.closest("[data-coupon-form]");
  if (couponFormEl) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(couponFormEl);
      const id = couponFormEl.dataset.id || StoreDB.uid("cp");
      const item = {
        id,
        code: String(f.get("code")).toUpperCase(),
        type: f.get("type"),
        value: Number(f.get("value")),
        min: Number(f.get("min") || 0),
        active: f.get("active") === "1",
        uses: db().coupons.find((c) => c.id === id)?.uses || 0,
      };
      try {
        await StoreDB.saveCoupon(item);
        closeModal(true);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const slideFormEl = e.target.closest("[data-slide-form]");
  if (slideFormEl) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(slideFormEl);
      const id = slideFormEl.dataset.id || StoreDB.uid("sl");
      const productId = f.get("productId");
      const linked = productId ? db().products.find((p) => p.id === productId) : null;
      let image = f.get("image") || slideFormEl.querySelector("[data-slide-image]")?.value || "";
      if (!image && linked) image = linked.image;
      const item = {
        id,
        sortOrder: db().slides.find((s) => s.id === id)?.sortOrder ?? db().slides.length,
        active: f.get("active") === "1",
        title: f.get("title"),
        headline: f.get("headline") || linked?.headline || "",
        blurb: f.get("blurb") || linked?.blurb || "",
        image,
        videoUrl: (f.get("videoUrl") || "").trim(),
        productId: productId || "",
        category: f.get("category") || linked?.category || "",
        tag: f.get("tag") || linked?.tag || "",
        gpu: f.get("gpu") || linked?.gpu || "",
        tgp: f.get("tgp") || linked?.tgp || "",
        cooling: f.get("cooling") || linked?.cooling || "",
        screen: f.get("screen") || linked?.screen || "",
        chip1: f.get("chip1") || "",
        chip2: f.get("chip2") || "",
        imageOnly: f.get("imageOnly") === "1",
        hideSpecs: f.get("imageOnly") !== "1" && f.get("hideSpecs") === "1",
        showAddToCart: f.get("imageOnly") !== "1" && f.get("showAddToCart") === "1",
        textPosition: f.get("imageOnly") === "1" ? "default" : f.get("textPosition") || "default",
      };
      try {
        await StoreDB.saveSlide(item);
        closeModal(true);
        toast("تم حفظ الشريحة");
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const psFormEl = e.target.closest("[data-ps-form]");
  if (psFormEl) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(psFormEl);
      const id = psFormEl.dataset.id || StoreDB.uid("ps");
      const source = f.get("source") || "category";
      let productIds = [];
      let brand = "";
      let category = "all";
      let limit = Number(f.get("limit") || 8);
      if (source === "manual") {
        try {
          productIds = JSON.parse(f.get("productIds") || "[]");
        } catch {
          productIds = [];
        }
        if (!Array.isArray(productIds) || !productIds.length) {
          toast("أضف منتجاً واحداً على الأقل للوضع اليدوي");
          return;
        }
      } else if (source === "brand") {
        brand = String(f.get("brand") || "").trim();
        limit = Number(f.get("limitBrand") || f.get("limit") || 8);
        if (!brand) {
          toast("اختر الماركة");
          return;
        }
      } else {
        category = f.get("category") || "all";
        limit = Number(f.get("limit") || 8);
      }
      const item = {
        id,
        sortOrder: db().productSliders.find((s) => s.id === id)?.sortOrder ?? db().productSliders.length,
        active: f.get("active") === "1",
        eyebrow: f.get("eyebrow") || "",
        title: f.get("title"),
        category,
        brand,
        limit,
        productIds: Array.isArray(productIds) ? productIds : [],
        autoplay: false,
        speedMs: 4500,
        linkUrl: f.get("linkUrl") || (brand ? `/products?brand=${encodeURIComponent(brand)}` : "/products"),
      };
      try {
        await StoreDB.saveProductSlider(item);
        closeModal(true);
        toast("تم حفظ السلايدر");
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const settingsForm = e.target.closest("[data-settings-form]");
  if (settingsForm) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(settingsForm);
      const file = settingsForm.logoFile?.files?.[0];
      const next = {
        ...db().settings,
        name: f.get("name"),
        nameAr: f.get("nameAr"),
        city: f.get("city"),
        phone: f.get("phone"),
        whatsapp: f.get("whatsapp") || f.get("phone"),
        address: f.get("address"),
        fullAddress: f.get("fullAddress"),
        email: f.get("email"),
        hours: f.get("hours"),
        warranty: f.get("warranty"),
        notice: f.get("notice"),
        maintenanceMode: f.get("maintenanceMode") === "1",
        maintenanceMessage: String(f.get("maintenanceMessage") || "").trim(),
        cartEnabled: f.get("cartEnabled") === "1",
      };
      const finish = async () => {
        try {
          await StoreDB.saveSettings(next);
          toast("تم حفظ إعدادات المتجر");
          render();
        } catch (err) {
          toast(err.message || "تعذر الحفظ");
        }
      };
      if (file) {
        try {
          const dataUrl = await readFileAsDataUrl(file);
          next.logo = await StoreDB.uploadImage(dataUrl, "logo");
          await finish();
        } catch (err) {
          toast(err.message || "تعذر رفع الشعار");
        }
      } else finish();
    })();
  }
  const galleryForm = e.target.closest("[data-gallery-form]");
  if (galleryForm) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(galleryForm);
      const keys = ["wide", "tall", "bottomStart", "bottomEnd"];
      const images = {};
      try {
        for (const key of keys) {
          const file = galleryForm.querySelector(`input[name="file_${key}"]`)?.files?.[0];
          if (file) {
            const dataUrl = await readFileAsDataUrl(file);
            images[key] = await StoreDB.uploadImage(dataUrl, "gallery");
          } else {
            images[key] = String(f.get(`keep_${key}`) || "");
          }
        }
        await StoreDB.saveOfficeGallery({
          active: f.get("active") === "1",
          title: String(f.get("title") || "من داخل مكتب بيست لابتوب").trim(),
          images,
        });
        toast("تم حفظ معرض المكتب");
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
  const userFormEl = e.target.closest("[data-user-form]");
  if (userFormEl) {
    e.preventDefault();
    void (async () => {
      const f = new FormData(userFormEl);
      const payload = {
        name: f.get("name"),
        username: f.get("username"),
        password: f.get("password"),
        role: f.get("role"),
      };
      const id = userFormEl.dataset.id;
      try {
        if (id) {
          await StoreDB.updateUser(id, payload);
          toast("تم تحديث المستخدم");
        } else {
          await StoreDB.createUser(payload);
          toast("تم إضافة المستخدم");
        }
        closeModal(true);
        render();
      } catch (err) {
        toast(err.message || "تعذر الحفظ");
      }
    })();
  }
});

async function bootAdmin() {
  try {
    const user = await StoreDB.verifySession();
    if (!user) {
      location.replace("/admin/login");
      return;
    }
    await StoreDB.refresh();
    try {
      const { res, body } = await StoreAPI.fetchApi("/api/health", { cache: "no-store" });
      if (res.ok && body.galleryUploadWritable === false) {
        window.__galleryUploadHint =
          body.galleryUploadHint || "مجلد رفع صور المعرض غير قابل للكتابة — اضبط صلاحيات uploads/gallery على 775 من الاستضافة.";
      }
    } catch {
      /* ignore health probe */
    }
  } catch (err) {
    alert(err.message || "تعذر تحميل لوحة التحكم. تحقق من api/index.php على الاستضافة.");
    location.replace("/admin/login");
    return;
  }
  render();
}

window.addEventListener("hashchange", () => render());
bootAdmin();
