const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { getSeedData } = require("./seed-data");

let DatabaseSync;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch (err) {
  console.error("SQLite requires Node.js 22.5+. Set that version in Hostinger hPanel.");
  throw err;
}

let DB_PATH = process.env.STORE_DB_PATH || path.join(__dirname, "data", "store.db");
const AUTH_SECRET = process.env.STORE_SECRET || "bestlaptop-local-secret";

const ORDER_STATUSES = [
  { id: "new", label: "جديد" },
  { id: "confirming", label: "قيد التأكيد" },
  { id: "preparing", label: "قيد التجهيز" },
  { id: "ready", label: "جاهز للتسليم" },
  { id: "done", label: "مكتمل" },
  { id: "canceled", label: "ملغي" },
];

let db;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const value = String(stored || "");
    const pass = String(password || "");
    if (value.startsWith("pbkdf2:")) {
      const [, salt, hash] = value.split(":");
      if (!salt || !hash) return false;
      const next = crypto.pbkdf2Sync(pass, salt, 120000, 64, "sha256").toString("hex");
      const a = Buffer.from(hash, "hex");
      const b = Buffer.from(next, "hex");
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    }
    const [salt, hash] = value.split(":");
    if (!salt || !hash) return false;
    const next = crypto.scryptSync(pass, salt, 64).toString("hex");
    const a = Buffer.from(hash, "hex");
    const b = Buffer.from(next, "hex");
    if (!a.length || a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function openDatabase() {
  const candidates = [
    process.env.STORE_DB_PATH,
    path.join(__dirname, "data", "store.db"),
    path.join(process.cwd(), "server", "data", "store.db"),
    path.join(os.tmpdir(), "bestlaptop-store.db"),
  ].filter(Boolean);

  const unique = [...new Set(candidates)];
  let lastErr;
  for (const file of unique) {
    try {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const database = new DatabaseSync(file);
      database.exec("PRAGMA foreign_keys = ON;");
      DB_PATH = file;
      console.log(`SQLite connected: ${file}`);
      return database;
    } catch (err) {
      lastErr = err;
      console.error(`SQLite could not open ${file}: ${err.message}`);
    }
  }
  throw lastErr || new Error("Could not open SQLite database");
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function parseImages(row) {
  let images = [];
  try {
    images = row.images_json ? JSON.parse(row.images_json) : [];
  } catch {
    images = [];
  }
  if (!images.length && row.image) images = [row.image];
  return images;
}

function rowToProduct(row) {
  const images = parseImages(row);
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price,
    cpu: row.cpu,
    ram: row.ram,
    storage: row.storage,
    stock: row.stock,
    tag: row.tag,
    specs: row.specs,
    screen: row.screen,
    gpu: row.gpu,
    tgp: row.tgp,
    cooling: row.cooling,
    headline: row.headline,
    blurb: row.blurb,
    slide: !!row.slide,
    condition: normalizeProductCondition(row.product_condition ?? row.condition),
    images,
    image: images[0] || row.image || "",
    createdAt: row.created_at || "",
  };
}

function normalizeProductCondition(value) {
  const raw = String(value || "new").trim().toLowerCase();
  if (raw === "open box" || raw === "open_box") return "open-box";
  const allowed = ["new", "refurbished", "open-box"];
  return allowed.includes(raw) ? raw : "new";
}

function productToRow(p) {
  const images = Array.isArray(p.images) && p.images.length ? p.images : p.image ? [p.image] : [];
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: Number(p.price) || 0,
    old_price: p.oldPrice == null ? null : Number(p.oldPrice),
    cpu: p.cpu || "",
    ram: p.ram || "",
    storage: p.storage || "",
    stock: Number(p.stock) || 0,
    tag: p.tag || "",
    specs: p.specs || "",
    screen: p.screen || "",
    gpu: p.gpu || "",
    tgp: p.tgp || "",
    cooling: p.cooling || "",
    headline: p.headline || "",
    blurb: p.blurb || "",
    slide: p.slide ? 1 : 0,
    product_condition: normalizeProductCondition(p.condition ?? p.productCondition ?? "new"),
    images_json: JSON.stringify(images),
    image: images[0] || "",
  };
}

function rowToOrder(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    customer: JSON.parse(row.customer_json),
    address: JSON.parse(row.address_json),
    delivery: JSON.parse(row.delivery_json),
    payment: JSON.parse(row.payment_json),
    items: JSON.parse(row.items_json),
    subtotal: row.subtotal,
    discount: row.discount,
    shipping: row.shipping,
    total: row.total,
  };
}

function uniqueCustomers(orders) {
  const map = new Map();
  orders.forEach((o) => {
    const key = o.customer.phone;
    const prev = map.get(key) || { orders: 0, spent: 0 };
    map.set(key, {
      id: `cu-${key}`,
      name: o.customer.name,
      phone: o.customer.phone,
      email: o.customer.email || "",
      city: o.address?.city || "",
      orders: prev.orders + 1,
      spent: prev.spent + (o.total || 0),
    });
  });
  return [...map.values()];
}

function ensureAdminUsers() {
  const n = db.prepare("SELECT COUNT(*) AS n FROM users").get()?.n || 0;
  if (n > 0) return;
  console.warn("Users table empty — restoring default admin accounts");
  const seed = getSeedData();
  const ins = db.prepare("INSERT OR IGNORE INTO users (id,name,username,password_hash,role) VALUES (?,?,?,?,?)");
  seed.users.forEach((u) => ins.run(u.id, u.name, u.username, hashPassword(u.password), u.role));
}

function applyEnvAdminCredentials() {
  const username = String(process.env.STORE_ADMIN_USER || "").trim();
  const password = String(process.env.STORE_ADMIN_PASSWORD || "");
  if (!username || !password) return;
  const existing = db.prepare("SELECT id FROM users WHERE username=?").get(username);
  if (existing) {
    db.prepare("UPDATE users SET password_hash=? WHERE username=?").run(hashPassword(password), username);
    console.log(`Admin password updated from environment for ${username}`);
    return;
  }
  db.prepare("INSERT INTO users (id,name,username,password_hash,role) VALUES (?,?,?,?,?)").run(
    "u-admin",
    username,
    username,
    hashPassword(password),
    "admin"
  );
  console.log(`Admin user created from environment: ${username}`);
}

function getHealth() {
  try {
    const users = db.prepare("SELECT COUNT(*) AS n FROM users").get()?.n || 0;
    const version = getVersion();
    const conditionReady = columnExists("products", "product_condition");
    const features = conditionReady ? ["productCondition"] : [];
    return {
      ok: true,
      db: true,
      engine: "sqlite",
      build: 102,
      users,
      hasAdmin: users > 0,
      version,
      storeVersion: version,
      productConditionReady: conditionReady,
      features,
    };
  } catch {
    return { ok: false, db: false, engine: "sqlite", users: 0, hasAdmin: false };
  }
}

function initDb() {
  db = openDatabase();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT
    );
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      category TEXT,
      price INTEGER NOT NULL DEFAULT 0,
      old_price INTEGER,
      cpu TEXT, ram TEXT, storage TEXT,
      rating REAL DEFAULT 4.5,
      stock INTEGER DEFAULT 0,
      tag TEXT, specs TEXT, screen TEXT,
      gpu TEXT, tgp TEXT, cooling TEXT,
      headline TEXT, blurb TEXT,
      slide INTEGER DEFAULT 0,
      image TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL,
      customer_json TEXT NOT NULL,
      address_json TEXT NOT NULL,
      delivery_json TEXT NOT NULL,
      payment_json TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      shipping INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      min_amount INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      uses INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      text TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL,
      headline TEXT,
      blurb TEXT,
      image TEXT,
      product_id TEXT,
      category TEXT,
      tag TEXT,
      gpu TEXT,
      tgp TEXT,
      cooling TEXT,
      screen TEXT,
      chip1 TEXT,
      chip2 TEXT
    );
  `);

  migrateSchema();

  const seeded = db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
  if (!seeded) seedDatabase();
  ensureAdminUsers();
  applyEnvAdminCredentials();
  migrateCheckoutOptions();
  bumpVersion();
}

function migrateCheckoutOptions() {
  const done = db.prepare("SELECT value FROM meta WHERE key = 'checkout_opts_v2'").get();
  if (done) return;
  const settings = getSettings();
  if (settings && typeof settings === "object") {
    settings.shipping = [
      { id: "baghdad", label: "توصيل بغداد", fee: 10000, hint: "توصيل داخل بغداد خلال يوم عمل" },
      { id: "governorate", label: "توصيل المحافظات", fee: 10000, hint: "توصيل خارج بغداد خلال 2–4 أيام" },
    ];
    settings.payments = [
      { id: "cod", label: "الدفع عند الاستلام", hint: "ادفع نقداً عند استلام الطلب" },
      { id: "office", label: "الدفع في المعرض", hint: "ادفع في المعرض عند زيارتك" },
    ];
    db.prepare("INSERT INTO settings (key,value) VALUES ('main',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(
      JSON.stringify(settings)
    );
  }
  db.prepare("INSERT INTO meta (key,value) VALUES ('checkout_opts_v2','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value").run();
  bumpVersion();
}

function columnExists(table, col) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((c) => c.name === col);
}

function migrateSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS product_sliders (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      eyebrow TEXT,
      title TEXT NOT NULL,
      category TEXT DEFAULT 'all',
      brand TEXT DEFAULT '',
      limit_count INTEGER DEFAULT 8,
      product_ids_json TEXT DEFAULT '[]',
      autoplay INTEGER DEFAULT 1,
      speed_ms INTEGER DEFAULT 4500,
      link_url TEXT DEFAULT '/products'
    );
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY,
      sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL,
      headline TEXT,
      blurb TEXT,
      image TEXT,
      product_id TEXT,
      category TEXT,
      tag TEXT,
      gpu TEXT,
      tgp TEXT,
      cooling TEXT,
      screen TEXT,
      chip1 TEXT,
      chip2 TEXT
    );
  `);
  if (!columnExists("products", "images_json")) {
    db.exec("ALTER TABLE products ADD COLUMN images_json TEXT");
    db.prepare("UPDATE products SET images_json = json_array(image) WHERE image IS NOT NULL AND image != ''").run();
  }
  if (!columnExists("products", "created_at")) {
    db.exec("ALTER TABLE products ADD COLUMN created_at TEXT");
    const rows = db.prepare("SELECT id FROM products ORDER BY name").all();
    rows.forEach((r, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i * 2 - 1);
      db.prepare("UPDATE products SET created_at = ? WHERE id = ?").run(d.toISOString(), r.id);
    });
  }
  if (!columnExists("products", "product_condition")) {
    db.exec("ALTER TABLE products ADD COLUMN product_condition TEXT NOT NULL DEFAULT 'new'");
  }
  if (columnExists("products", "condition")) {
    db.prepare(
      "UPDATE products SET product_condition = COALESCE(NULLIF(condition, ''), 'new') WHERE product_condition IS NULL OR product_condition = '' OR product_condition = 'new'"
    ).run();
  }
  db.prepare("UPDATE products SET product_condition = 'new' WHERE product_condition IS NULL OR product_condition = ''").run();
  if (!columnExists("hero_slides", "video_url")) {
    db.exec("ALTER TABLE hero_slides ADD COLUMN video_url TEXT");
  }
  if (!columnExists("hero_slides", "image_only")) {
    db.exec("ALTER TABLE hero_slides ADD COLUMN image_only INTEGER NOT NULL DEFAULT 0");
  }
  if (!columnExists("hero_slides", "hide_specs")) {
    db.exec("ALTER TABLE hero_slides ADD COLUMN hide_specs INTEGER NOT NULL DEFAULT 0");
  }
  if (!columnExists("hero_slides", "text_position")) {
    db.exec("ALTER TABLE hero_slides ADD COLUMN text_position TEXT NOT NULL DEFAULT 'default'");
  }
  if (!columnExists("hero_slides", "show_add_to_cart")) {
    db.exec("ALTER TABLE hero_slides ADD COLUMN show_add_to_cart INTEGER NOT NULL DEFAULT 1");
  }
  if (!columnExists("product_sliders", "brand")) {
    db.exec("ALTER TABLE product_sliders ADD COLUMN brand TEXT DEFAULT ''");
  }

  const isSeeded = !!db.prepare("SELECT value FROM meta WHERE key = 'seeded'").get();
  if (!isSeeded) return;

  const slideCount = db.prepare("SELECT COUNT(*) as n FROM hero_slides").get()?.n || 0;
  if (!slideCount) {
    const products = db.prepare("SELECT * FROM products WHERE slide = 1 ORDER BY name").all();
    const ins = db.prepare(`
      INSERT INTO hero_slides (id,sort_order,active,title,headline,blurb,image,product_id,category,tag,gpu,tgp,cooling,screen,chip1,chip2)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    products.forEach((row, i) => {
      const p = rowToProduct(row);
      ins.run(
        `sl-${p.id}`,
        i,
        1,
        p.name,
        p.headline || "",
        p.blurb || "",
        p.image,
        p.id,
        p.category,
        p.tag || "",
        p.gpu || "",
        p.tgp || "",
        p.cooling || "",
        p.screen || "",
        "ضمان سنتين حقيقي",
        "أداء كامل للكرت"
      );
    });
  }
  const psCount = db.prepare("SELECT COUNT(*) as n FROM product_sliders").get()?.n || 0;
  if (!psCount) {
    const settings = getSettings();
    const f = settings.featured || {};
    db.prepare(`
      INSERT INTO product_sliders (id,sort_order,active,eyebrow,title,category,limit_count,product_ids_json,autoplay,speed_ms,link_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      "ps-default",
      0,
      1,
      f.eyebrow || "الأكثر مبيعاً",
      f.title || "منتجات مميزة للقيمنق والمونتاج",
      f.category || "all",
      Number(f.limit) || 8,
      JSON.stringify(Array.isArray(f.productIds) ? f.productIds : []),
      0,
      Number(f.speedMs) || 4500,
      "products.html"
    );
  }
  {
    const row = db.prepare("SELECT value FROM settings WHERE key='main'").get();
    const raw = row ? JSON.parse(row.value) : {};
    let dirty = false;
    if (!raw.featured) {
      raw.featured = {
        eyebrow: "الأكثر مبيعاً",
        title: "منتجات مميزة للقيمنق والمونتاج",
        category: "all",
        limit: 8,
        productIds: [],
        autoplay: true,
        speedMs: 4500,
      };
      dirty = true;
    }
    if (!raw.officeGallery) {
      raw.officeGallery = {
        active: true,
        title: "من داخل مكتب بيست لابتوب",
        images: {
          wide: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80",
          tall: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80",
          bottomStart: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
          bottomEnd: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
        },
      };
      dirty = true;
    }
    if (dirty) {
      db.prepare("INSERT INTO settings (key,value) VALUES ('main',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(
        JSON.stringify(raw)
      );
    }
  }
  const globalBrands = [
    ["br-asus", "ASUS"],
    ["br-msi", "MSI"],
    ["br-lenovo", "Lenovo"],
    ["br-hp", "HP"],
    ["br-dell", "Dell"],
    ["br-apple", "Apple"],
    ["br-acer", "Acer"],
    ["br-razer", "Razer"],
    ["br-gigabyte", "Gigabyte"],
    ["br-microsoft", "Microsoft"],
    ["br-samsung", "Samsung"],
  ];
  const insBrand = db.prepare("INSERT OR IGNORE INTO brands (id,name,country) VALUES (?,?,?)");
  globalBrands.forEach(([id, name]) => insBrand.run(id, name, "عالمي"));
}

function seedDatabase() {
  const seed = getSeedData();
  const tx = db.prepare("BEGIN");
  tx.run();
  try {
    const insUser = db.prepare("INSERT INTO users (id,name,username,password_hash,role) VALUES (?,?,?,?,?)");
    seed.users.forEach((u) => insUser.run(u.id, u.name, u.username, hashPassword(u.password), u.role));

    const insCat = db.prepare("INSERT INTO categories (id,title,text) VALUES (?,?,?)");
    seed.categories.forEach((c) => insCat.run(c.id, c.title, c.text));

    const insBrand = db.prepare(
      "INSERT INTO brands (id,name,country) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, country=excluded.country"
    );
    seed.brands.forEach((b) => insBrand.run(b.id, b.name, b.country));

    const insProd = db.prepare(`
      INSERT INTO products (id,name,brand,category,price,old_price,cpu,ram,storage,stock,tag,specs,screen,gpu,tgp,cooling,headline,blurb,slide,image,images_json)
      VALUES (@id,@name,@brand,@category,@price,@old_price,@cpu,@ram,@storage,@stock,@tag,@specs,@screen,@gpu,@tgp,@cooling,@headline,@blurb,@slide,@image,@images_json)
    `);
    seed.products.forEach((p) => insProd.run(productToRow(p)));

    const insOrder = db.prepare(`
      INSERT INTO orders (id,created_at,status,customer_json,address_json,delivery_json,payment_json,items_json,subtotal,discount,shipping,total)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    seed.orders.forEach((o) =>
      insOrder.run(
        o.id,
        o.createdAt,
        o.status,
        JSON.stringify(o.customer),
        JSON.stringify(o.address),
        JSON.stringify(o.delivery),
        JSON.stringify(o.payment),
        JSON.stringify(o.items),
        o.subtotal,
        o.discount,
        o.shipping,
        o.total
      )
    );

    const insCoupon = db.prepare("INSERT INTO coupons (id,code,type,value,min_amount,active,uses) VALUES (?,?,?,?,?,?,?)");
    seed.coupons.forEach((c) => insCoupon.run(c.id, c.code, c.type, c.value, c.min, c.active ? 1 : 0, c.uses));

    const insSlide = db.prepare(`
      INSERT INTO hero_slides (id,sort_order,active,title,headline,blurb,image,product_id,category,tag,gpu,tgp,cooling,screen,chip1,chip2)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    (seed.slides || []).forEach((s, i) =>
      insSlide.run(
        s.id,
        s.sortOrder ?? i,
        s.active !== false ? 1 : 0,
        s.title,
        s.headline || "",
        s.blurb || "",
        s.image || "",
        s.productId || null,
        s.category || "",
        s.tag || "",
        s.gpu || "",
        s.tgp || "",
        s.cooling || "",
        s.screen || "",
        s.chip1 || "",
        s.chip2 || ""
      )
    );

    const insPs = db.prepare(`
      INSERT INTO product_sliders (id,sort_order,active,eyebrow,title,category,brand,limit_count,product_ids_json,autoplay,speed_ms,link_url)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `);
    (seed.productSliders || []).forEach((s, i) =>
      insPs.run(
        s.id,
        s.sortOrder ?? i,
        s.active !== false ? 1 : 0,
        s.eyebrow || "",
        s.title,
        s.category || "all",
        s.brand || "",
        Number(s.limit) || 8,
        JSON.stringify(Array.isArray(s.productIds) ? s.productIds : []),
        s.autoplay !== false ? 1 : 0,
        Number(s.speedMs) || 4500,
        s.linkUrl || "/products"
      )
    );

    db.prepare("INSERT INTO settings (key,value) VALUES ('main',?)").run(JSON.stringify(seed.settings));
    db.prepare("INSERT INTO meta (key,value) VALUES ('seeded','1')").run();
    db.prepare("COMMIT").run();
  } catch (err) {
    db.prepare("ROLLBACK").run();
    throw err;
  }
}

function bumpVersion() {
  db.prepare("INSERT INTO meta (key,value) VALUES ('version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(
    String(Date.now())
  );
}

function getVersion() {
  return db.prepare("SELECT value FROM meta WHERE key='version'").get()?.value || "0";
}

function defaultOfficeGallery() {
  return {
    active: true,
    title: "من داخل مكتب بيست لابتوب",
    images: {
      wide: "",
      tall: "",
      bottomStart: "",
      bottomEnd: "",
    },
  };
}

function normalizeGalleryImage(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.src || value.url || "";
  return "";
}

function getSettings() {
  const row = db.prepare("SELECT value FROM settings WHERE key='main'").get();
  const s = row ? JSON.parse(row.value) : {};
  if (!s.notice && s.city) s.notice = `${s.city} · ${s.address} · ${s.warranty}`;
  s.maintenanceMode = !!s.maintenanceMode;
  if (!s.maintenanceMessage) s.maintenanceMessage = "";
  s.cartEnabled = s.cartEnabled !== false;
  if (!Array.isArray(s.homeLayout)) s.homeLayout = null;
  if (!s.officeGallery || typeof s.officeGallery !== "object") {
    s.officeGallery = defaultOfficeGallery();
  } else {
    const d = defaultOfficeGallery();
    s.officeGallery = {
      active: s.officeGallery.active !== false,
      title: s.officeGallery.title || d.title,
      images: {
        wide: normalizeGalleryImage(s.officeGallery.images?.wide),
        tall: normalizeGalleryImage(s.officeGallery.images?.tall),
        bottomStart: normalizeGalleryImage(s.officeGallery.images?.bottomStart),
        bottomEnd: normalizeGalleryImage(s.officeGallery.images?.bottomEnd),
      },
    };
  }
  return s;
}

function saveSettings(settings) {
  const normalized = {
    ...settings,
    cartEnabled: Object.prototype.hasOwnProperty.call(settings, "cartEnabled") ? settings.cartEnabled !== false : true,
  };
  db.prepare("INSERT INTO settings (key,value) VALUES ('main',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(
    JSON.stringify(normalized)
  );
  bumpVersion();
}

function listProducts() {
  return db
    .prepare(
      "SELECT * FROM products ORDER BY COALESCE(NULLIF(created_at, ''), '1970-01-01') DESC, name ASC"
    )
    .all()
    .map(rowToProduct);
}

function getProduct(id) {
  const row = db.prepare("SELECT * FROM products WHERE id=?").get(id);
  return row ? rowToProduct(row) : null;
}

function upsertProduct(p) {
  const existing = getProduct(p.id);
  const row = productToRow({
    ...existing,
    ...p,
    condition: normalizeProductCondition(p.condition ?? p.productCondition ?? existing?.condition ?? "new"),
  });
  row.created_at = existing?.createdAt || p.createdAt || new Date().toISOString();
  db.prepare(`
    INSERT INTO products (id,name,brand,category,price,old_price,cpu,ram,storage,stock,tag,specs,screen,gpu,tgp,cooling,headline,blurb,slide,image,images_json,product_condition,created_at)
    VALUES (@id,@name,@brand,@category,@price,@old_price,@cpu,@ram,@storage,@stock,@tag,@specs,@screen,@gpu,@tgp,@cooling,@headline,@blurb,@slide,@image,@images_json,@product_condition,@created_at)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, brand=excluded.brand, category=excluded.category, price=excluded.price,
      old_price=excluded.old_price, cpu=excluded.cpu, ram=excluded.ram, storage=excluded.storage,
      stock=excluded.stock, tag=excluded.tag, specs=excluded.specs,
      screen=excluded.screen, gpu=excluded.gpu, tgp=excluded.tgp, cooling=excluded.cooling,
      headline=excluded.headline, blurb=excluded.blurb, slide=excluded.slide, image=excluded.image,
      images_json=excluded.images_json, product_condition=excluded.product_condition
  `).run(row);
  bumpVersion();
  return getProduct(p.id);
}

function deleteProduct(id) {
  db.prepare("DELETE FROM products WHERE id=?").run(id);
  bumpVersion();
}

function listCategories() {
  return db.prepare("SELECT id, title, text FROM categories ORDER BY title").all();
}

function upsertCategory(c) {
  db.prepare("INSERT INTO categories (id,title,text) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, text=excluded.text").run(
    c.id,
    c.title,
    c.text
  );
  bumpVersion();
}

function deleteCategory(id) {
  db.prepare("DELETE FROM categories WHERE id=?").run(id);
  bumpVersion();
}

function listBrands() {
  return db.prepare("SELECT id, name, country FROM brands ORDER BY name").all();
}

function upsertBrand(b) {
  db.prepare("INSERT INTO brands (id,name,country) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, country=excluded.country").run(
    b.id,
    b.name,
    b.country
  );
  bumpVersion();
}

function deleteBrand(id) {
  db.prepare("DELETE FROM brands WHERE id=?").run(id);
  bumpVersion();
}

function listCoupons() {
  return db
    .prepare("SELECT id,code,type,value,min_amount as min,active,uses FROM coupons ORDER BY code")
    .all()
    .map((c) => ({ ...c, active: !!c.active }));
}

function upsertCoupon(c) {
  db.prepare(`
    INSERT INTO coupons (id,code,type,value,min_amount,active,uses) VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET code=excluded.code,type=excluded.type,value=excluded.value,min_amount=excluded.min_amount,active=excluded.active,uses=excluded.uses
  `).run(c.id, c.code, c.type, c.value, c.min, c.active ? 1 : 0, c.uses || 0);
  bumpVersion();
}

function deleteCoupon(id) {
  db.prepare("DELETE FROM coupons WHERE id=?").run(id);
  bumpVersion();
}

function deleteCoupon(id) {
  db.prepare("DELETE FROM coupons WHERE id=?").run(id);
  bumpVersion();
}

function rowToSlide(row) {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    active: !!row.active,
    title: row.title,
    headline: row.headline || "",
    blurb: row.blurb || "",
    image: row.image || "",
    videoUrl: row.video_url || "",
    productId: row.product_id || "",
    category: row.category || "",
    tag: row.tag || "",
    gpu: row.gpu || "",
    tgp: row.tgp || "",
    cooling: row.cooling || "",
    screen: row.screen || "",
    chip1: row.chip1 || "",
    chip2: row.chip2 || "",
    imageOnly: !!row.image_only,
    hideSpecs: !!row.hide_specs,
    textPosition: normalizeTextPosition(row.text_position),
    showAddToCart: row.show_add_to_cart !== 0,
  };
}

function normalizeTextPosition(value) {
  const v = String(value || "default").trim();
  return v === "center" || v === "right" ? v : "default";
}

function slideToRow(s) {
  return {
    id: s.id,
    sort_order: Number(s.sortOrder) || 0,
    active: s.active !== false ? 1 : 0,
    title: s.title,
    headline: s.headline || "",
    blurb: s.blurb || "",
    image: s.image || "",
    video_url: s.videoUrl || "",
    product_id: s.productId || null,
    category: s.category || "",
    tag: s.tag || "",
    gpu: s.gpu || "",
    tgp: s.tgp || "",
    cooling: s.cooling || "",
    screen: s.screen || "",
    chip1: s.chip1 || "",
    chip2: s.chip2 || "",
    image_only: s.imageOnly ? 1 : 0,
    hide_specs: s.hideSpecs ? 1 : 0,
    text_position: normalizeTextPosition(s.textPosition),
    show_add_to_cart: s.showAddToCart !== false ? 1 : 0,
  };
}

function listSlides(activeOnly = false) {
  const rows = db
    .prepare(`SELECT * FROM hero_slides ${activeOnly ? "WHERE active = 1" : ""} ORDER BY sort_order ASC, title ASC`)
    .all();
  return rows.map(rowToSlide);
}

function getSlide(id) {
  const row = db.prepare("SELECT * FROM hero_slides WHERE id=?").get(id);
  return row ? rowToSlide(row) : null;
}

function upsertSlide(s) {
  db.prepare(`
    INSERT INTO hero_slides (id,sort_order,active,title,headline,blurb,image,video_url,product_id,category,tag,gpu,tgp,cooling,screen,chip1,chip2,image_only,hide_specs,text_position,show_add_to_cart)
    VALUES (@id,@sort_order,@active,@title,@headline,@blurb,@image,@video_url,@product_id,@category,@tag,@gpu,@tgp,@cooling,@screen,@chip1,@chip2,@image_only,@hide_specs,@text_position,@show_add_to_cart)
    ON CONFLICT(id) DO UPDATE SET
      sort_order=excluded.sort_order, active=excluded.active, title=excluded.title, headline=excluded.headline,
      blurb=excluded.blurb, image=excluded.image, video_url=excluded.video_url, product_id=excluded.product_id, category=excluded.category,
      tag=excluded.tag, gpu=excluded.gpu, tgp=excluded.tgp, cooling=excluded.cooling, screen=excluded.screen,
      chip1=excluded.chip1, chip2=excluded.chip2, image_only=excluded.image_only, hide_specs=excluded.hide_specs,
      text_position=excluded.text_position, show_add_to_cart=excluded.show_add_to_cart
  `).run(slideToRow(s));
  bumpVersion();
  return getSlide(s.id);
}

function deleteSlide(id) {
  db.prepare("DELETE FROM hero_slides WHERE id=?").run(id);
  bumpVersion();
}

function reorderSlides(ids) {
  const tx = db.prepare("BEGIN");
  tx.run();
  try {
    ids.forEach((id, i) => {
      db.prepare("UPDATE hero_slides SET sort_order=? WHERE id=?").run(i, id);
    });
    db.prepare("COMMIT").run();
    bumpVersion();
  } catch (err) {
    db.prepare("ROLLBACK").run();
    throw err;
  }
}

function rowToProductSlider(row) {
  let productIds = [];
  try {
    productIds = JSON.parse(row.product_ids_json || "[]");
  } catch {
    productIds = [];
  }
  return {
    id: row.id,
    sortOrder: row.sort_order,
    active: !!row.active,
    eyebrow: row.eyebrow || "",
    title: row.title,
    category: row.category || "all",
    brand: row.brand || "",
    limit: row.limit_count ?? 8,
    productIds,
    autoplay: row.autoplay !== 0,
    speedMs: row.speed_ms ?? 4500,
    linkUrl: row.link_url || "products.html",
  };
}

function productSliderToRow(s) {
  return {
    id: s.id,
    sort_order: s.sortOrder ?? 0,
    active: s.active !== false ? 1 : 0,
    eyebrow: s.eyebrow || "",
    title: s.title,
    category: s.category || "all",
    brand: s.brand || "",
    limit_count: Number(s.limit) || 8,
    product_ids_json: JSON.stringify(Array.isArray(s.productIds) ? s.productIds : []),
    autoplay: s.autoplay !== false ? 1 : 0,
    speed_ms: Number(s.speedMs) || 4500,
    link_url: s.linkUrl || "/products",
  };
}

function listProductSliders(activeOnly = false) {
  const rows = db
    .prepare(`SELECT * FROM product_sliders ${activeOnly ? "WHERE active = 1" : ""} ORDER BY sort_order ASC, title ASC`)
    .all();
  return rows.map(rowToProductSlider);
}

function getProductSlider(id) {
  const row = db.prepare("SELECT * FROM product_sliders WHERE id=?").get(id);
  return row ? rowToProductSlider(row) : null;
}

function upsertProductSlider(s) {
  db.prepare(`
    INSERT INTO product_sliders (id,sort_order,active,eyebrow,title,category,brand,limit_count,product_ids_json,autoplay,speed_ms,link_url)
    VALUES (@id,@sort_order,@active,@eyebrow,@title,@category,@brand,@limit_count,@product_ids_json,@autoplay,@speed_ms,@link_url)
    ON CONFLICT(id) DO UPDATE SET
      sort_order=excluded.sort_order, active=excluded.active, eyebrow=excluded.eyebrow, title=excluded.title,
      category=excluded.category, brand=excluded.brand, limit_count=excluded.limit_count, product_ids_json=excluded.product_ids_json,
      autoplay=excluded.autoplay, speed_ms=excluded.speed_ms, link_url=excluded.link_url
  `).run(productSliderToRow(s));
  bumpVersion();
  return getProductSlider(s.id);
}

function deleteProductSlider(id) {
  db.prepare("DELETE FROM product_sliders WHERE id=?").run(id);
  bumpVersion();
}

function reorderProductSliders(ids) {
  const tx = db.prepare("BEGIN");
  tx.run();
  try {
    ids.forEach((id, i) => {
      db.prepare("UPDATE product_sliders SET sort_order=? WHERE id=?").run(i, id);
    });
    db.prepare("COMMIT").run();
    bumpVersion();
  } catch (err) {
    db.prepare("ROLLBACK").run();
    throw err;
  }
}

function listOrders() {
  return db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all().map(rowToOrder);
}

function getOrder(id) {
  const row = db.prepare("SELECT * FROM orders WHERE id=?").get(id);
  return row ? rowToOrder(row) : null;
}

function updateOrderStatus(id, status) {
  db.prepare("UPDATE orders SET status=? WHERE id=?").run(status, id);
  bumpVersion();
  return getOrder(id);
}

function deleteOrder(id) {
  db.prepare("DELETE FROM orders WHERE id=?").run(id);
  bumpVersion();
}

function createOrder(order) {
  db.prepare(`
    INSERT INTO orders (id,created_at,status,customer_json,address_json,delivery_json,payment_json,items_json,subtotal,discount,shipping,total)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    order.id,
    order.createdAt,
    order.status || "new",
    JSON.stringify(order.customer),
    JSON.stringify(order.address),
    JSON.stringify(order.delivery),
    JSON.stringify(order.payment),
    JSON.stringify(order.items),
    order.subtotal,
    order.discount || 0,
    order.shipping || 0,
    order.total
  );
  order.items.forEach((item) => {
    db.prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id=?").run(item.qty, item.id);
  });
  bumpVersion();
  return getOrder(order.id);
}

function listUsersPublic() {
  return db.prepare("SELECT id,name,username,role FROM users ORDER BY name").all();
}

function listUsersAdmin() {
  return listUsersPublic();
}

function createUser(u) {
  db.prepare("INSERT INTO users (id,name,username,password_hash,role) VALUES (?,?,?,?,?)").run(
    u.id,
    u.name,
    u.username,
    hashPassword(u.password),
    u.role
  );
}

function updateUser(id, patch) {
  const existing = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  if (!existing) throw new Error("المستخدم غير موجود");

  const name = String(patch.name ?? existing.name).trim();
  const username = String(patch.username ?? existing.username).trim();
  const role = patch.role || existing.role;
  const password = patch.password != null ? String(patch.password) : "";

  if (!name || !username) throw new Error("الاسم واسم المستخدم مطلوبان");

  const clash = db.prepare("SELECT id FROM users WHERE username=? AND id!=?").get(username, id);
  if (clash) throw new Error("اسم المستخدم مستخدم مسبقاً");

  if (existing.role === "admin" && role !== "admin") {
    const adminCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='admin'").get().n;
    if (adminCount < 2) throw new Error("لا يمكن تغيير دور آخر أدمن");
  }

  if (password.trim()) {
    db.prepare("UPDATE users SET name=?, username=?, password_hash=?, role=? WHERE id=?").run(
      name,
      username,
      hashPassword(password),
      role,
      id
    );
  } else {
    db.prepare("UPDATE users SET name=?, username=?, role=? WHERE id=?").run(name, username, role, id);
  }

  return { id, name, username, role };
}

function deleteUser(id) {
  db.prepare("DELETE FROM users WHERE id=?").run(id);
}

function login(username, password) {
  const name = String(username || "").trim();
  const pass = String(password || "");
  if (!name || !pass) return null;
  let user = db.prepare("SELECT * FROM users WHERE username=?").get(name);
  if (!user) {
    user = db.prepare("SELECT * FROM users WHERE lower(username) = lower(?)").get(name);
  }
  if (!user || !verifyPassword(pass, user.password_hash)) return null;
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30;
  db.prepare("INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)").run(token, user.id, expires);
  return { token, user: { id: user.id, name: user.name, username: user.username, role: user.role }, expires };
}

function logout(token) {
  if (token) db.prepare("DELETE FROM sessions WHERE token=?").run(token);
}

function getSessionUser(token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.id,u.name,u.username,u.role,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?`
    )
    .get(token);
  if (!row || row.expires_at < Date.now()) {
    if (row) db.prepare("DELETE FROM sessions WHERE token=?").run(token);
    return null;
  }
  db.prepare("UPDATE sessions SET expires_at=? WHERE token=?").run(Date.now() + 1000 * 60 * 60 * 24 * 30, token);
  return { id: row.id, name: row.name, username: row.username, role: row.role };
}

function getPublicStore() {
  const settings = getSettings();
  return {
    version: getVersion(),
    products: listProducts(),
    categories: listCategories(),
    brands: listBrands(),
    settings,
    slides: listSlides(true),
    productSliders: listProductSliders(true),
    store: {
      name: settings.name || "BEST LAPTOP",
      nameAr: settings.nameAr || "بيست لابتوب",
      logo: settings.logo || "img/logo.jpg",
      notice: settings.notice || "",
      city: settings.city,
      address: settings.address,
      fullAddress: settings.fullAddress,
      phone: settings.phone,
      whatsapp: settings.whatsapp || settings.phone,
      email: settings.email,
      hours: settings.hours,
      warranty: settings.warranty,
      currency: settings.currency || "IQD",
      cities: settings.cities || [],
      shipping: settings.shipping || [],
      payments: settings.payments || [],
      featured: settings.featured || { eyebrow: "الأكثر مبيعاً", title: "منتجات مميزة للقيمنق والمونتاج", category: "all", limit: 8, productIds: [], autoplay: true, speedMs: 4500 },
      officeGallery: settings.officeGallery || defaultOfficeGallery(),
      maintenanceMode: !!settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage || "",
      cartEnabled: settings.cartEnabled !== false,
    },
  };
}

function getAdminState() {
  const orders = listOrders();
  return {
    version: getVersion(),
    products: listProducts(),
    categories: listCategories(),
    brands: listBrands(),
    orders,
    customers: uniqueCustomers(orders),
    coupons: listCoupons(),
    slides: listSlides(false),
    productSliders: listProductSliders(false),
    settings: getSettings(),
    users: listUsersAdmin(),
  };
}

module.exports = {
  initDb,
  AUTH_SECRET,
  ORDER_STATUSES,
  getHealth,
  uid,
  bumpVersion,
  getVersion,
  getPublicStore,
  getAdminState,
  getSettings,
  saveSettings,
  listProducts,
  getProduct,
  upsertProduct,
  deleteProduct,
  listCategories,
  upsertCategory,
  deleteCategory,
  listBrands,
  upsertBrand,
  deleteBrand,
  listCoupons,
  upsertCoupon,
  deleteCoupon,
  listSlides,
  getSlide,
  upsertSlide,
  deleteSlide,
  reorderSlides,
  listProductSliders,
  getProductSlider,
  upsertProductSlider,
  deleteProductSlider,
  reorderProductSliders,
  listOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  createOrder,
  createUser,
  updateUser,
  deleteUser,
  login,
  logout,
  getSessionUser,
  listUsersPublic,
};
