const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const crypto = require("crypto");
const db = require("./db");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 8765);
const HOST = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");
const UPLOADS = path.join(ROOT, "uploads");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

function send(res, status, body, type = "application/json") {
  const data = typeof body === "string" ? body : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": type.includes("json") ? "no-store" : "public, max-age=60",
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on("error", reject);
  });
}

function bearer(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

function requireAuth(req, res, roles) {
  const user = db.getSessionUser(bearer(req));
  if (!user) {
    send(res, 401, { error: "Unauthorized" });
    return null;
  }
  if (roles && !roles.includes(user.role) && user.role !== "admin") {
    send(res, 403, { error: "Forbidden" });
    return null;
  }
  return user;
}

function saveUpload(dataUrl, folder = "products") {
  const match = String(dataUrl || "").match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const buf = Buffer.from(match[2], "base64");
  if (buf.length > 8 * 1024 * 1024) throw new Error("Image too large (max 8MB)");
  const dir = path.join(UPLOADS, folder);
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  fs.writeFileSync(path.join(dir, name), buf);
  return `/uploads/${folder}/${name}`;
}

async function handleApi(req, res, pathname) {
  const method = req.method.toUpperCase();
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

  if (pathname === "/api/health" && method === "GET") {
    return send(res, 200, { ...db.getHealth(), version: db.getVersion() });
  }

  if (pathname === "/api/store" && method === "GET") {
    return send(res, 200, db.getPublicStore());
  }

  if (pathname === "/api/orders" && method === "POST") {
    const settings = db.getSettings();
    if (settings?.maintenanceMode) {
      return send(res, 503, { error: "الموقع تحت الصيانة حالياً" });
    }
    if (settings?.hideAllProducts) {
      return send(res, 503, { error: "المنتجات مخفية حالياً" });
    }
    const body = await readBody(req);
    if (!body?.items?.length) return send(res, 400, { error: "Empty order" });
    const id = body.id || `BL-${String(Date.now()).slice(-6)}`;
    const order = { ...body, id, createdAt: body.createdAt || new Date().toISOString(), status: "new" };
    for (const item of order.items) {
      const p = db.getProduct(item.id);
      if (!p || p.stock < item.qty) return send(res, 400, { error: `Product unavailable: ${item.id}` });
    }
    const saved = db.createOrder(order);
    return send(res, 201, saved);
  }

  const orderMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (orderMatch && method === "GET") {
    const order = db.getOrder(decodeURIComponent(orderMatch[1]));
    if (!order) return send(res, 404, { error: "Not found" });
    return send(res, 200, order);
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    const body = await readBody(req);
    const session = db.login(body?.username || "", body?.password || "");
    if (!session) {
      const health = db.getHealth();
      if (!health.db) return send(res, 503, { error: "Database unavailable" });
      if (!health.hasAdmin) return send(res, 503, { error: "Admin accounts missing" });
      return send(res, 401, { error: "Invalid credentials" });
    }
    return send(res, 200, session);
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    db.logout(bearer(req));
    return send(res, 200, { ok: true });
  }

  if (pathname === "/api/auth/me" && method === "GET") {
    const user = db.getSessionUser(bearer(req));
    if (!user) return send(res, 401, { error: "Unauthorized" });
    return send(res, 200, { user });
  }

  if (pathname === "/api/admin/state" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) return;
    return send(res, 200, { ...db.getAdminState(), orderStatuses: db.ORDER_STATUSES, user });
  }

  if (pathname === "/api/admin/products") {
    const user = requireAuth(req, res);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.listProducts());
    if (method === "POST") {
      const body = await readBody(req);
      body.id = body.id || db.uid("pr");
      return send(res, 201, db.upsertProduct(body));
    }
  }

  const productMatch = pathname.match(/^\/api\/admin\/products\/([^/]+)$/);
  if (productMatch) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(productMatch[1]);
    if (method === "PUT") {
      const body = await readBody(req);
      body.id = id;
      return send(res, 200, db.upsertProduct(body));
    }
    if (method === "DELETE") {
      db.deleteProduct(id);
      return send(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/admin/categories") {
    const user = requireAuth(req, res);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.listCategories());
    if (method === "POST") {
      const body = await readBody(req);
      db.upsertCategory(body);
      return send(res, 201, body);
    }
  }

  const catMatch = pathname.match(/^\/api\/admin\/categories\/([^/]+)$/);
  if (catMatch) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(catMatch[1]);
    if (method === "PUT") {
      const body = await readBody(req);
      body.id = id;
      db.upsertCategory(body);
      return send(res, 200, body);
    }
    if (method === "DELETE") {
      db.deleteCategory(id);
      return send(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/admin/brands") {
    const user = requireAuth(req, res);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.listBrands());
    if (method === "POST") {
      const body = await readBody(req);
      body.id = body.id || db.uid("br");
      db.upsertBrand(body);
      return send(res, 201, body);
    }
  }

  const brandMatch = pathname.match(/^\/api\/admin\/brands\/([^/]+)$/);
  if (brandMatch) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(brandMatch[1]);
    if (method === "PUT") {
      const body = await readBody(req);
      body.id = id;
      db.upsertBrand(body);
      return send(res, 200, body);
    }
    if (method === "DELETE") {
      db.deleteBrand(id);
      return send(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/admin/coupons") {
    const user = requireAuth(req, res);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.listCoupons());
    if (method === "POST") {
      const body = await readBody(req);
      body.id = body.id || db.uid("cp");
      db.upsertCoupon(body);
      return send(res, 201, body);
    }
  }

  const couponMatch = pathname.match(/^\/api\/admin\/coupons\/([^/]+)$/);
  if (couponMatch) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(couponMatch[1]);
    if (method === "PUT") {
      const body = await readBody(req);
      body.id = id;
      db.upsertCoupon(body);
      return send(res, 200, body);
    }
    if (method === "DELETE") {
      db.deleteCoupon(id);
      return send(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/admin/orders" && method === "GET") {
    const user = requireAuth(req, res);
    if (!user) return;
    return send(res, 200, db.listOrders());
  }

  const orderAdminMatch = pathname.match(/^\/api\/admin\/orders\/([^/]+)$/);
  if (orderAdminMatch && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(orderAdminMatch[1]);
    const body = await readBody(req);
    if (!body?.status) return send(res, 400, { error: "status required" });
    return send(res, 200, db.updateOrderStatus(id, body.status));
  }
  if (orderAdminMatch && method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(orderAdminMatch[1]);
    db.deleteOrder(id);
    return send(res, 200, { ok: true });
  }

  if (pathname === "/api/admin/upload" && method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;
    try {
      const body = await readBody(req);
      const folder = ["logo", "slides", "gallery"].includes(body?.folder) ? body.folder : "products";
      const urlPath = saveUpload(body?.data, folder);
      return send(res, 201, { url: urlPath });
    } catch (err) {
      return send(res, 400, { error: err.message || "Upload failed" });
    }
  }

  if (pathname === "/api/admin/slides/reorder" && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;
    const body = await readBody(req);
    if (!Array.isArray(body?.ids)) return send(res, 400, { error: "ids required" });
    db.reorderSlides(body.ids);
    return send(res, 200, { ok: true });
  }

  if (pathname === "/api/admin/slides") {
    const user = requireAuth(req, res);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.listSlides(false));
    if (method === "POST") {
      const body = await readBody(req);
      body.id = body.id || db.uid("sl");
      if (body.sortOrder == null) {
        const list = db.listSlides(false);
        body.sortOrder = list.length;
      }
      return send(res, 201, db.upsertSlide(body));
    }
  }

  const slideMatch = pathname.match(/^\/api\/admin\/slides\/([^/]+)$/);
  if (slideMatch) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(slideMatch[1]);
    if (method === "PUT") {
      const body = await readBody(req);
      body.id = id;
      return send(res, 200, db.upsertSlide(body));
    }
    if (method === "DELETE") {
      db.deleteSlide(id);
      return send(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/admin/product-sliders/reorder" && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;
    const body = await readBody(req);
    if (!Array.isArray(body?.ids)) return send(res, 400, { error: "ids required" });
    db.reorderProductSliders(body.ids);
    return send(res, 200, { ok: true });
  }

  if (pathname === "/api/admin/product-sliders") {
    const user = requireAuth(req, res);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.listProductSliders(false));
    if (method === "POST") {
      const body = await readBody(req);
      body.id = body.id || db.uid("ps");
      if (body.sortOrder == null) {
        body.sortOrder = db.listProductSliders(false).length;
      }
      return send(res, 201, db.upsertProductSlider(body));
    }
  }

  const psMatch = pathname.match(/^\/api\/admin\/product-sliders\/([^/]+)$/);
  if (psMatch) {
    const user = requireAuth(req, res);
    if (!user) return;
    const id = decodeURIComponent(psMatch[1]);
    if (method === "PUT") {
      const body = await readBody(req);
      body.id = id;
      return send(res, 200, db.upsertProductSlider(body));
    }
    if (method === "DELETE") {
      db.deleteProductSlider(id);
      return send(res, 200, { ok: true });
    }
  }

  if (pathname === "/api/admin/inventory" && method === "PATCH") {
    const user = requireAuth(req, res);
    if (!user) return;
    const body = await readBody(req);
    const p = db.getProduct(body.id);
    if (!p) return send(res, 404, { error: "Not found" });
    p.stock = Number(body.stock);
    return send(res, 200, db.upsertProduct(p));
  }

  if (pathname === "/api/admin/office-gallery") {
    const user = requireAuth(req, res);
    if (!user) return;
    if (method === "GET") {
      const settings = db.getSettings();
      return send(res, 200, settings.officeGallery || { active: true, title: "من داخل مكتب بيست لابتوب", images: {} });
    }
    if (method === "PATCH") {
      const body = await readBody(req);
      const current = db.getSettings();
      const merged = {
        ...current,
        officeGallery: {
          ...(current.officeGallery || {}),
          ...(body || {}),
          images: {
            ...((current.officeGallery && current.officeGallery.images) || {}),
            ...((body && body.images) || {}),
          },
        },
      };
      db.saveSettings(merged);
      return send(res, 200, merged.officeGallery);
    }
  }

  if (pathname === "/api/admin/settings") {
    const user = requireAuth(req, res, ["admin"]);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.getSettings());
    if (method === "PUT") {
      const body = await readBody(req);
      const current = db.getSettings();
      const merged = { ...current, ...(body || {}) };
      if (body?.officeGallery) {
        merged.officeGallery = {
          ...(current.officeGallery || {}),
          ...body.officeGallery,
          images: {
            ...((current.officeGallery && current.officeGallery.images) || {}),
            ...((body.officeGallery && body.officeGallery.images) || {}),
          },
        };
      }
      db.saveSettings(merged);
      return send(res, 200, merged);
    }
  }

  if (pathname === "/api/admin/users") {
    const user = requireAuth(req, res, ["admin"]);
    if (!user) return;
    if (method === "GET") return send(res, 200, db.listUsersAdmin());
    if (method === "POST") {
      const body = await readBody(req);
      body.id = body.id || db.uid("u");
      db.createUser(body);
      return send(res, 201, { id: body.id, name: body.name, username: body.username, role: body.role });
    }
  }

  const userMatch = pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
  if (userMatch) {
    const user = requireAuth(req, res, ["admin"]);
    if (!user) return;
    const id = decodeURIComponent(userMatch[1]);
    if (method === "PUT") {
      try {
        const body = await readBody(req);
        const updated = db.updateUser(id, body);
        return send(res, 200, updated);
      } catch (err) {
        return send(res, 400, { error: err.message || "تعذر التحديث" });
      }
    }
    if (method === "DELETE") {
      const users = db.listUsersAdmin();
      if (users.filter((u) => u.role === "admin").length < 2 && users.find((u) => u.id === id)?.role === "admin") {
        return send(res, 400, { error: "Cannot delete last admin" });
      }
      db.deleteUser(id);
      return send(res, 200, { ok: true });
    }
  }

  send(res, 404, { error: "API route not found" });
}

const PAGE_ALIASES = {
  "/products": "/products.html",
  "/cart": "/cart.html",
  "/checkout": "/checkout.html",
  "/contact": "/contact.html",
  "/order": "/order.html",
  "/maintenance": "/maintenance.html",
  "/admin": "/admin/index.html",
  "/admin/": "/admin/index.html",
  "/admin/login": "/admin/login.html",
  "/admin/login/": "/admin/login.html",
};

function isStorefrontHtmlPath(pathname) {
  if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/api")) return false;
  if (pathname === "/maintenance" || pathname === "/maintenance.html") return false;
  if (/\.(js|css|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|map|json|txt)$/i.test(pathname)) return false;
  if (pathname.startsWith("/uploads/") || pathname.startsWith("/img/") || pathname.startsWith("/js/") || pathname.startsWith("/css/")) {
    return false;
  }
  if (pathname === "/" || pathname.endsWith(".html") || PAGE_ALIASES[pathname]) return true;
  return /^\/product\/[^/]+\/?$/.test(pathname);
}

function serveStatic(req, res, pathname) {
  if (pathname.length > 1 && pathname.endsWith("/") && !pathname.includes(".")) {
    pathname = pathname.replace(/\/+$/, "") || "/";
  }

  const productMatch = pathname.match(/^\/product\/([^/]+)\/?$/);
  if (productMatch) {
    pathname = "/product.html";
  }

  if (db.getSettings()?.maintenanceMode && isStorefrontHtmlPath(pathname)) {
    pathname = "/maintenance.html";
  }

  const adminPageMatch = pathname.match(/^\/admin\/([a-z0-9-]+)\/?$/);
  if (adminPageMatch) {
    const page = adminPageMatch[1];
    if (page !== "login" && page !== "index") {
      res.writeHead(302, { Location: `/admin/#/${page}` });
      res.end();
      return;
    }
  }

  let filePath = PAGE_ALIASES[pathname] || (pathname === "/" ? "/index.html" : pathname);
  filePath = filePath.split("?")[0];
  const abs = path.normalize(path.join(ROOT, filePath.replace(/^\//, "").replace(/\//g, path.sep)));
  if (!abs.startsWith(ROOT)) return send(res, 403, "Forbidden", "text/plain");
  if (abs.includes(`${path.sep}server${path.sep}data`)) return send(res, 403, "Forbidden", "text/plain");

  fs.readFile(abs, (err, data) => {
    if (err) return send(res, 404, "Not found", "text/plain");
    const ext = path.extname(abs).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

db.initDb();

function requestHandler(req, res) {
  const parsed = url.parse(req.url);
  const pathname = decodeURIComponent(parsed.pathname || "/");

  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": req.headers.origin || "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    });
    res.end();
    return;
  }

  if (pathname.startsWith("/api/")) {
    handleApi(req, res, pathname).catch((err) => {
      console.error(err);
      send(res, 500, { error: "Server error" });
    });
    return;
  }

  serveStatic(req, res, pathname);
}

function start(listenHost = HOST, listenPort = PORT) {
  const server = http.createServer(requestHandler);
  server.listen(listenPort, listenHost, () => {
    console.log(`BEST LAPTOP server http://${listenHost}:${listenPort}/`);
    console.log(`Admin panel http://${listenHost}:${listenPort}/admin/login`);
    const health = db.getHealth();
    console.log(`Database ${health.db ? "connected" : "FAILED"} · users=${health.users}`);
  });
  return server;
}

if (require.main === module) start();

module.exports = { requestHandler, start };
