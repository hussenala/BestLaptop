const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dbApi = require("./db");

const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(__dirname, "data");
const KEY_FILE = path.join(DATA_DIR, "gini.key");
const SECRET_FILE = path.join(DATA_DIR, "gini.secrets.json");
const GINI_ORIGIN = "https://merchant.gini.iq";
const USER_AGENT = "BestLaptop-Gini/1.0";
const MAX_ATTEMPTS = 5;

const PATHS = {
  ping: "/api/v2.0/third-party/ping",
  categories: "/api/v2.0/third-party/categories",
  products: "/api/v2.0/third-party/products",
};

let chain = Promise.resolve();
let workerTimer = null;

function database() {
  const db = dbApi.getDb();
  if (!db) throw new Error("Database is not ready");
  return db;
}

function nowIso() {
  return new Date().toISOString();
}

function schedule(task) {
  const run = chain.then(task, task);
  chain = run.then(
    () => {},
    () => {}
  );
  return run;
}

function ensureSchema() {
  const db = database();
  db.exec(`
    CREATE TABLE IF NOT EXISTS gini_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gini_category_map (
      local_category_id TEXT PRIMARY KEY,
      gini_category_id INTEGER NOT NULL,
      gini_subcategory_id INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gini_links (
      local_id TEXT PRIMARY KEY,
      gini_id TEXT,
      gini_sku TEXT,
      idempotency_key TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      last_error TEXT,
      image_hash TEXT,
      updated_at TEXT,
      published_at TEXT
    );
    CREATE TABLE IF NOT EXISTS gini_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      local_id TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS gini_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      local_id TEXT,
      action TEXT,
      ok INTEGER NOT NULL,
      message TEXT
    );
  `);
  const stale = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  db.prepare("UPDATE gini_jobs SET status='queued', updated_at=? WHERE status='running' AND updated_at < ?").run(nowIso(), stale);
  db.prepare("UPDATE gini_links SET status='pending', updated_at=? WHERE status='publishing' AND updated_at < ?").run(nowIso(), stale);
}

function configGet(key, fallback = "") {
  const row = database().prepare("SELECT value FROM gini_config WHERE key=?").get(key);
  return row ? row.value : fallback;
}

function configSet(key, value) {
  database()
    .prepare("INSERT INTO gini_config (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    .run(key, String(value));
}

function keyBytes() {
  if (process.env.GINI_SECRETS_KEY && String(process.env.GINI_SECRETS_KEY).length >= 16) {
    return crypto.createHash("sha256").update(String(process.env.GINI_SECRETS_KEY)).digest();
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(KEY_FILE)) {
    fs.writeFileSync(KEY_FILE, crypto.randomBytes(32));
    try {
      fs.chmodSync(KEY_FILE, 0o600);
    } catch {
      /* windows */
    }
  }
  const raw = fs.readFileSync(KEY_FILE);
  if (raw.length === 32) return raw;
  return crypto.createHash("sha256").update(raw).digest();
}

function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(String(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

function decrypt(stored) {
  const raw = Buffer.from(String(stored || ""), "base64");
  if (raw.length < 28) throw new Error("تعذر قراءة مفاتيح جني المحفوظة");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

function readSecretFile() {
  if (!fs.existsSync(SECRET_FILE)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(SECRET_FILE, "utf8"));
    const clientId = decrypt(parsed.clientId);
    const clientSecret = decrypt(parsed.clientSecret);
    if (!clientId || !clientSecret) return null;
    return { clientId, clientSecret };
  } catch {
    return null;
  }
}

function writeSecretFile(clientId, clientSecret) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const payload = JSON.stringify({
    v: 1,
    clientId: encrypt(clientId),
    clientSecret: encrypt(clientSecret),
  });
  fs.writeFileSync(SECRET_FILE, payload, { mode: 0o600 });
  try {
    fs.chmodSync(SECRET_FILE, 0o600);
  } catch {
    /* windows */
  }
  const readBack = readSecretFile();
  if (!readBack || readBack.clientId !== clientId || readBack.clientSecret !== clientSecret) {
    throw new Error("تعذر قراءة مفاتيح الربط بعد حفظها");
  }
}

function getCredentials() {
  const envId = String(process.env.GINI_CLIENT_ID || "").trim();
  const envSecret = String(process.env.GINI_CLIENT_SECRET || "").trim();
  if (envId && envSecret) return { clientId: envId, clientSecret: envSecret, source: "env" };
  const file = readSecretFile();
  if (file) return { ...file, source: "file" };
  return null;
}

function maskId(value) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 4) return "••••";
  return `${text.slice(0, 2)}••••${text.slice(-2)}`;
}

function scrub(message) {
  let text = String(message || "").replace(/\s+/g, " ").trim();
  const creds = getCredentials();
  if (creds) {
    if (creds.clientSecret) text = text.split(creds.clientSecret).join("•••");
    if (creds.clientId) text = text.split(creds.clientId).join(maskId(creds.clientId));
  }
  return text.slice(0, 400);
}

function sign(method, requestPath, body, timestamp, secret) {
  return crypto.createHmac("sha256", secret).update(`${method}${requestPath}${body}${timestamp}`).digest("hex");
}

function explain(status, text, headers) {
  const trimmed = String(text || "").trim();
  if (!trimmed || trimmed.startsWith("<") || /cloudfront/i.test(trimmed) || /request blocked/i.test(trimmed)) {
    const id = headers?.get?.("x-amz-cf-id") || "";
    return scrub(
      "جدار GINI حجب الطلب قبل وصوله إلى واجهة API. أرسل لدعم جني عنوان IP هذا السيرفر" +
        (id ? ` ومعرّف الطلب ${id.slice(0, 80)}` : "")
    );
  }
  let data = null;
  try {
    data = JSON.parse(trimmed);
  } catch {
    data = null;
  }
  const base = data?.error || data?.message || `استجابة غير متوقعة من جني (${status})`;
  const hint = Array.isArray(data?.diagnostics?.hints) ? data.diagnostics.hints[0] : "";
  return scrub(hint ? `${base}: ${hint}` : base);
}

function retryable(status, message) {
  if (status === 409 || status === 429 || status === 502 || status === 503 || status === 504) return true;
  if (status === 401 && /expired|انتهت|clock/i.test(message)) return true;
  if (status === 0) return true;
  return false;
}

async function giniFetch({ method, requestPath, json, form, idempotencyKey, creds }) {
  const credentials = creds || getCredentials();
  if (!credentials) {
    const error = new Error("مفاتيح أسواق جني غير مضبوطة على السيرفر");
    error.status = 0;
    error.permanent = true;
    throw error;
  }
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawBody = json == null ? "" : JSON.stringify(json);
  const signature = sign(method, requestPath, form ? "" : rawBody, timestamp, credentials.clientSecret);
  const headers = {
    "X-API-KEY": credentials.clientId,
    "X-TIMESTAMP": timestamp,
    "X-SIGNATURE": signature,
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  if (!form && json != null) headers["Content-Type"] = "application/json";
  let response;
  try {
    response = await fetch(GINI_ORIGIN + requestPath, {
      method,
      headers,
      body: method === "GET" || method === "DELETE" ? undefined : form || rawBody,
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    const error = new Error(scrub(err.name === "TimeoutError" ? "انتهت مهلة الاتصال بجني" : "تعذر الاتصال بخادم جني"));
    error.status = 0;
    throw error;
  }
  const text = await response.text();
  if (response.status >= 300 && response.status < 400) {
    const error = new Error("جني أعاد تحويلاً غير متوقع");
    error.status = response.status;
    throw error;
  }
  if (response.status < 200 || response.status >= 300) {
    const message = explain(response.status, text, response.headers);
    const error = new Error(message);
    error.status = response.status;
    error.permanent = !retryable(response.status, message);
    const retryAfter = Number(response.headers.get("retry-after") || 0);
    if (retryAfter > 0) error.retryAfter = retryAfter;
    throw error;
  }
  if (!text) return { status: response.status, data: null };
  try {
    return { status: response.status, data: JSON.parse(text) };
  } catch {
    const error = new Error("جني أعاد استجابة ليست JSON");
    error.status = response.status;
    error.permanent = true;
    throw error;
  }
}

async function testConnection() {
  ensureSchema();
  const creds = getCredentials();
  if (!creds) {
    const message = "لم يُحفظ Client ID وClient Secret بعد";
    configSet("last_ping_ok", "0");
    configSet("last_ping_at", nowIso());
    configSet("last_ping_message", message);
    return { ok: false, configured: false, message };
  }
  try {
    const result = await giniFetch({ method: "GET", requestPath: PATHS.ping, creds });
    const merchant = result.data?.data?.merchant?.business_name || "";
    const message = merchant ? `تم الاتصال بحساب ${merchant}` : "تم الاتصال بنجاح";
    configSet("last_ping_ok", "1");
    configSet("last_ping_at", nowIso());
    configSet("last_ping_message", scrub(message));
    log(null, "ping", true, message);
    return { ok: true, configured: true, merchant: scrub(merchant), message: scrub(message) };
  } catch (err) {
    const message = scrub(err.message || "فشل الاتصال");
    configSet("last_ping_ok", "0");
    configSet("last_ping_at", nowIso());
    configSet("last_ping_message", message);
    log(null, "ping", false, message);
    return { ok: false, configured: true, message };
  }
}

async function fetchCategories() {
  ensureSchema();
  const result = await giniFetch({ method: "GET", requestPath: PATHS.categories });
  const rows = Array.isArray(result.data?.data) ? result.data.data : [];
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name || ""),
    slug: String(row.slug || ""),
    subcategories: Array.isArray(row.subcategories)
      ? row.subcategories.map((sub) => ({
          id: Number(sub.id),
          name: String(sub.name || ""),
          slug: String(sub.slug || ""),
        }))
      : [],
  }));
}

function isAuto() {
  return configGet("auto_sync", "0") === "1";
}

function securityStock() {
  const value = Number(configGet("security_stock", "1"));
  if (!Number.isFinite(value) || value < 0) return 1;
  return Math.round(value);
}

function flag(key) {
  return configGet(key, "0") === "1";
}

function linkOf(localId) {
  return database().prepare("SELECT * FROM gini_links WHERE local_id=?").get(localId) || null;
}

function isLinked(link) {
  return !!(link && (link.gini_id || link.status === "published"));
}

function skuFor(localId) {
  const clean = String(localId || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9-]/g, "");
  const sku = /^bl-/i.test(clean) ? clean : `BL-${clean || "item"}`;
  return sku.slice(0, 64);
}

function words(text, max) {
  const parts = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts.slice(0, max).join(" ");
}

function descriptionOf(product) {
  const lines = [
    product.headline,
    product.blurb,
    product.specs,
    product.cpu ? `المعالج: ${product.cpu}` : "",
    product.gpu ? `كرت الشاشة: ${product.gpu}` : "",
    product.ram ? `الذاكرة: ${product.ram}` : "",
    product.storage ? `التخزين: ${product.storage}` : "",
    product.screen ? `الشاشة: ${product.screen}` : "",
  ].filter(Boolean);
  const text = words(lines.join("\n") || product.name || "لابتوب", 1000);
  return text.slice(0, 8000);
}

function conditionLabel(value) {
  const key = String(value || "new");
  if (key === "refurbished") return "مجدد";
  if (key === "open-box") return "مفتوح";
  if (key === "used") return "مستعمل";
  return "جديد";
}

function optionsOf(product) {
  return [
    ["المعالج", product.cpu],
    ["كرت الشاشة", product.gpu],
    ["قدرة الكرت", product.tgp],
    ["التبريد", product.cooling],
    ["الذاكرة", product.ram],
    ["التخزين", product.storage],
    ["الشاشة", product.screen],
    ["الحالة", conditionLabel(product.condition)],
  ]
    .filter((pair) => String(pair[1] || "").trim())
    .slice(0, 20)
    .map(([key, value]) => ({ key: String(key).slice(0, 255), value: String(value).trim().slice(0, 255) }));
}

function tagsOf(product) {
  return [product.brand, product.category, product.tag, conditionLabel(product.condition)]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(",")
    .slice(0, 500);
}

function mimeOf(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

function resolveImage(src) {
  const raw = String(src || "").trim();
  if (!raw || raw.startsWith("data:")) return null;
  if (/^https?:\/\//i.test(raw)) return { remote: raw, label: raw };
  const rel = decodeURIComponent(raw).replace(/^\/+/, "").replace(/\//g, path.sep);
  const abs = path.normalize(path.join(ROOT, rel));
  if (!abs.startsWith(ROOT)) {
    const error = new Error("مسار صورة خارج مجلد الموقع");
    error.permanent = true;
    throw error;
  }
  if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
    const error = new Error("ملف الصورة غير موجود على السيرفر");
    error.permanent = true;
    throw error;
  }
  return { file: abs, label: abs };
}

async function loadImages(product) {
  const list = Array.isArray(product.images) && product.images.length ? product.images : product.image ? [product.image] : [];
  const resolved = [];
  for (const src of list) {
    const item = resolveImage(src);
    if (item) resolved.push(item);
    if (resolved.length === 10) break;
  }
  const files = [];
  for (const item of resolved) {
    let buffer;
    let filename;
    let type;
    if (item.file) {
      buffer = fs.readFileSync(item.file);
      filename = path.basename(item.file);
      type = mimeOf(item.file);
    } else {
      const response = await fetch(item.remote, { redirect: "follow", signal: AbortSignal.timeout(15000) });
      if (!response.ok) {
        const error = new Error("تعذر تنزيل صورة المنتج لرفعها إلى جني");
        error.permanent = true;
        throw error;
      }
      buffer = Buffer.from(await response.arrayBuffer());
      filename = "image.jpg";
      type = String(response.headers.get("content-type") || "image/jpeg").split(";")[0];
    }
    if (buffer.length > 5 * 1024 * 1024) {
      const error = new Error("إحدى الصور أكبر من 5MB والحد في جني هو 5MB");
      error.permanent = true;
      throw error;
    }
    if (!buffer.length) continue;
    files.push({ buffer, filename, type, signature: item.file ? `${item.file}:${fs.statSync(item.file).size}:${fs.statSync(item.file).mtimeMs}` : item.remote });
  }
  return files;
}

function imageHash(files) {
  return crypto.createHash("sha256").update(files.map((file) => file.signature).join("|")).digest("hex");
}

function categoryMap(localCategoryId) {
  return database().prepare("SELECT * FROM gini_category_map WHERE local_category_id=?").get(localCategoryId) || null;
}

function salePriceOf(product) {
  const raw = product?.giniPrice;
  if (raw == null || raw === "") return null;
  const price = Math.round(Number(raw));
  if (!Number.isFinite(price) || price < 0) return null;
  return price;
}

function payloadOf(product, map, filesReady) {
  const installments = flag("is_installments");
  const months = Number(configGet("months", "0"));
  const body = {
    name: String(product.name || "منتج").slice(0, 255),
    description: descriptionOf(product),
    price: salePriceOf(product),
    quantity: Math.max(0, Math.round(Number(product.stock) || 0)),
    security_stock: securityStock(),
    category_id: Number(map.gini_category_id),
    subcategory_id: Number(map.gini_subcategory_id),
    is_visible: Number(product.stock) > 0 ? 1 : 0,
    is_installments: installments ? 1 : 0,
    is_gini_partner: flag("is_gini_partner"),
    sku: skuFor(product.id),
    tags: tagsOf(product),
    options: optionsOf(product),
    is_used: product.condition === "used",
  };
  if (installments && months >= 1 && months <= 10) body.months = Math.round(months);
  if (!filesReady) return body;
  return body;
}

function appendForm(form, body, files, deleteImages) {
  const scalar = { ...body };
  const options = scalar.options || [];
  delete scalar.options;
  delete scalar.sku;
  Object.entries(scalar).forEach(([key, value]) => {
    if (value == null) return;
    if (typeof value === "boolean") form.append(key, value ? "1" : "0");
    else form.append(key, String(value));
  });
  form.append("sku", body.sku);
  options.forEach((option, index) => {
    form.append(`options[${index}][key]`, option.key);
    form.append(`options[${index}][value]`, option.value);
  });
  files.forEach((file) => {
    form.append("images[]", new Blob([file.buffer], { type: file.type }), file.filename);
  });
  (deleteImages || []).forEach((url) => form.append("delete_images[]", String(url)));
}

function rememberLink(localId, fields) {
  const current = linkOf(localId);
  const next = {
    gini_id: fields.gini_id ?? current?.gini_id ?? null,
    gini_sku: fields.gini_sku ?? current?.gini_sku ?? skuFor(localId),
    idempotency_key: fields.idempotency_key ?? current?.idempotency_key ?? crypto.randomUUID(),
    status: fields.status ?? current?.status ?? "pending",
    last_error: fields.last_error === undefined ? current?.last_error || "" : fields.last_error,
    image_hash: fields.image_hash === undefined ? current?.image_hash || "" : fields.image_hash,
    published_at: fields.published_at === undefined ? current?.published_at || null : fields.published_at,
  };
  database()
    .prepare(
      `INSERT INTO gini_links (local_id,gini_id,gini_sku,idempotency_key,status,last_error,image_hash,updated_at,published_at)
       VALUES (@local_id,@gini_id,@gini_sku,@idempotency_key,@status,@last_error,@image_hash,@updated_at,@published_at)
       ON CONFLICT(local_id) DO UPDATE SET
         gini_id=excluded.gini_id, gini_sku=excluded.gini_sku, idempotency_key=excluded.idempotency_key,
         status=excluded.status, last_error=excluded.last_error, image_hash=excluded.image_hash,
         updated_at=excluded.updated_at, published_at=excluded.published_at`
    )
    .run({ local_id: localId, ...next, updated_at: nowIso() });
}

function log(localId, action, ok, message) {
  const db = database();
  db.prepare("INSERT INTO gini_log (created_at,local_id,action,ok,message) VALUES (?,?,?,?,?)").run(
    nowIso(),
    localId || null,
    action,
    ok ? 1 : 0,
    scrub(message)
  );
  db.prepare("DELETE FROM gini_log WHERE id NOT IN (SELECT id FROM gini_log ORDER BY id DESC LIMIT 200)").run();
}

function remoteProduct(data) {
  const row = data?.data && !Array.isArray(data.data) ? data.data : null;
  return row && (row.id || row.sku) ? row : null;
}

async function findRemote(sku) {
  try {
    const result = await giniFetch({ method: "GET", requestPath: `${PATHS.products}/${sku}` });
    return remoteProduct(result.data);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

async function syncLocal(localId, action) {
  ensureSchema();
  const product = dbApi.getProduct(localId);
  if (!product) {
    database().prepare("UPDATE gini_jobs SET status='done', updated_at=?, last_error=? WHERE local_id=? AND status IN ('queued','retry','running')").run(
      nowIso(),
      "المنتج لم يعد موجوداً محلياً",
      localId
    );
    log(localId, action, false, "تم تخطي منتج محذوف محلياً دون حذفه من جني");
    return { ok: false, message: "المنتج غير موجود محلياً" };
  }
  if (salePriceOf(product) == null) {
    const message = "يرجى تحديد سعر أسواق جني قبل النشر";
    rememberLink(localId, { status: "failed", last_error: message, gini_sku: skuFor(localId) });
    log(localId, action, false, message);
    return { ok: false, message, permanent: true };
  }
  const map = categoryMap(product.category);
  if (!map) {
    const message = "تصنيف المنتج غير مربوط بتصنيف جني وتصنيفه الفرعي";
    rememberLink(localId, { status: "failed", last_error: message, gini_sku: skuFor(localId) });
    log(localId, action, false, message);
    return { ok: false, message, permanent: true };
  }
  const sku = skuFor(product.id);
  let link = linkOf(localId);
  if (!link?.idempotency_key) {
    rememberLink(localId, { status: "pending", gini_sku: sku, idempotency_key: crypto.randomUUID(), last_error: "" });
    link = linkOf(localId);
  }
  if (link.status === "publishing") {
    const age = Date.now() - Date.parse(link.updated_at || 0);
    if (age >= 0 && age < 60000) {
      const error = new Error("النشر نفسه ما زال قيد التنفيذ");
      error.status = 409;
      throw error;
    }
  }
  rememberLink(localId, { status: "publishing", gini_sku: sku, last_error: link.last_error || "" });
  const files = await loadImages(product);
  if (!files.length) {
    const message = "جني يطلب صورة واحدة على الأقل، ولا توجد صورة قابلة للرفع";
    rememberLink(localId, { status: "failed", last_error: message });
    log(localId, action, false, message);
    return { ok: false, message, permanent: true };
  }
  const hash = imageHash(files);
  const body = payloadOf(product, map, false);
  body.sku = sku;
  try {
    if (action === "stock" && isLinked(linkOf(localId))) {
      const result = await giniFetch({
        method: "PATCH",
        requestPath: `${PATHS.products}/${sku}/stock`,
        json: { price: body.price, quantity: body.quantity },
      });
      const remote = remoteProduct(result.data);
      rememberLink(localId, {
        status: "published",
        gini_id: remote?.id ? String(remote.id) : link.gini_id,
        gini_sku: remote?.sku || sku,
        last_error: "",
        published_at: link.published_at || nowIso(),
      });
      log(localId, "stock", true, "تم تحديث السعر والمخزون في جني");
      return { ok: true, message: "تم تحديث المخزون" };
    }
    const remote = await findRemote(sku);
    if (!remote) {
      let current = linkOf(localId);
      if (current?.gini_id || current?.status === "published") {
        rememberLink(localId, { idempotency_key: crypto.randomUUID(), status: "publishing" });
        current = linkOf(localId);
      }
      const form = new FormData();
      appendForm(form, body, files);
      const created = await giniFetch({
        method: "POST",
        requestPath: PATHS.products,
        form,
        idempotencyKey: current.idempotency_key,
      });
      const row = remoteProduct(created.data);
      rememberLink(localId, {
        status: "published",
        gini_id: row?.id ? String(row.id) : "",
        gini_sku: row?.sku || sku,
        last_error: "",
        image_hash: hash,
        published_at: nowIso(),
      });
      log(localId, "create", true, `تم إنشاء المنتج في جني SKU ${row?.sku || sku}`);
      return { ok: true, message: "تم نشر المنتج" };
    }
    const linked = linkOf(localId);
    const imagesChanged = linked?.image_hash !== hash;
    if (imagesChanged) {
      const form = new FormData();
      form.append("_method", "PUT");
      appendForm(form, body, files, Array.isArray(remote.images) ? remote.images : []);
      const updated = await giniFetch({
        method: "POST",
        requestPath: `${PATHS.products}/${sku}`,
        form,
      });
      const row = remoteProduct(updated.data) || remote;
      rememberLink(localId, {
        status: "published",
        gini_id: row.id ? String(row.id) : String(remote.id || ""),
        gini_sku: row.sku || sku,
        last_error: "",
        image_hash: hash,
        published_at: linked?.published_at || nowIso(),
      });
      log(localId, "update", true, "تم تحديث المنتج وصوره في جني");
      return { ok: true, message: "تم تحديث المنتج" };
    }
    const jsonBody = { ...body };
    delete jsonBody.sku;
    const updated = await giniFetch({
      method: "PUT",
      requestPath: `${PATHS.products}/${sku}`,
      json: jsonBody,
    });
    const row = remoteProduct(updated.data) || remote;
    rememberLink(localId, {
      status: "published",
      gini_id: row.id ? String(row.id) : String(remote.id || ""),
      gini_sku: row.sku || sku,
      last_error: "",
      image_hash: hash,
      published_at: linked?.published_at || nowIso(),
    });
    log(localId, "update", true, "تم تحديث بيانات المنتج في جني");
    return { ok: true, message: "تم تحديث المنتج" };
  } catch (err) {
    const message = scrub(err.message || "فشل المزامنة");
    rememberLink(localId, { status: err.permanent ? "failed" : "pending", last_error: message, gini_sku: sku });
    log(localId, action, false, message);
    err.permanent = !!err.permanent;
    throw err;
  }
}

function enqueue(localId, action) {
  ensureSchema();
  const db = database();
  const existing = db
    .prepare("SELECT * FROM gini_jobs WHERE local_id=? AND status IN ('queued','retry','running') ORDER BY id DESC LIMIT 1")
    .get(localId);
  const stamp = nowIso();
  if (existing) {
    if (action === "upsert" && existing.action !== "upsert" && existing.status !== "running") {
      db.prepare("UPDATE gini_jobs SET action='upsert', updated_at=? WHERE id=?").run(stamp, existing.id);
    }
    return existing.id;
  }
  const info = db
    .prepare(
      "INSERT INTO gini_jobs (local_id,action,status,attempts,next_attempt_at,created_at,updated_at) VALUES (?,?, 'queued', 0, ?, ?, ?)"
    )
    .run(localId, action, stamp, stamp, stamp);
  return Number(info.lastInsertRowid);
}

function noteProductSaved(localId) {
  try {
    ensureSchema();
    const link = linkOf(localId);
    if (!isLinked(link) && !isAuto()) return;
    enqueue(localId, "upsert");
    schedule(() => processQueue(1));
  } catch (err) {
    console.error("gini enqueue", scrub(err.message));
  }
}

function noteStockChanged(ids) {
  try {
    ensureSchema();
    let any = false;
    for (const id of ids || []) {
      if (!id || !isLinked(linkOf(id))) continue;
      enqueue(id, "stock");
      any = true;
    }
    if (any) schedule(() => processQueue(1));
  } catch (err) {
    console.error("gini stock", scrub(err.message));
  }
}

function remainingJobs() {
  return database().prepare("SELECT COUNT(*) AS n FROM gini_jobs WHERE status IN ('queued','retry','running')").get().n || 0;
}

async function processQueue(limit = 1, preferLocalId = null) {
  ensureSchema();
  let processed = 0;
  const results = [];
  let preferred = preferLocalId;
  while (processed < limit) {
    const job = preferred
      ? database()
          .prepare("SELECT * FROM gini_jobs WHERE local_id=? AND status IN ('queued','retry') ORDER BY id DESC LIMIT 1")
          .get(preferred)
      : database()
          .prepare(
            "SELECT * FROM gini_jobs WHERE status IN ('queued','retry') AND (next_attempt_at IS NULL OR next_attempt_at <= ?) ORDER BY id ASC LIMIT 1"
          )
          .get(nowIso());
    preferred = null;
    if (!job) break;
    database().prepare("UPDATE gini_jobs SET status='running', updated_at=? WHERE id=?").run(nowIso(), job.id);
    try {
      const result = await syncLocal(job.local_id, job.action);
      database().prepare("UPDATE gini_jobs SET status='done', updated_at=?, last_error='' WHERE id=?").run(nowIso(), job.id);
      results.push({ id: job.local_id, ok: !!result.ok, message: result.message });
    } catch (err) {
      const attempts = Number(job.attempts || 0) + 1;
      const permanent = !!err.permanent || attempts >= MAX_ATTEMPTS;
      const wait = Number(err.retryAfter || 0) || [15, 60, 180, 600][Math.min(attempts - 1, 3)];
      const next = new Date(Date.now() + wait * 1000).toISOString();
      if (permanent) {
        database()
          .prepare("UPDATE gini_jobs SET status='failed', attempts=?, last_error=?, updated_at=? WHERE id=?")
          .run(attempts, scrub(err.message), nowIso(), job.id);
        rememberLink(job.local_id, { status: "failed", last_error: scrub(err.message) });
      } else {
        database()
          .prepare("UPDATE gini_jobs SET status='retry', attempts=?, next_attempt_at=?, last_error=?, updated_at=? WHERE id=?")
          .run(attempts, next, scrub(err.message), nowIso(), job.id);
      }
      results.push({ id: job.local_id, ok: false, message: scrub(err.message) });
    }
    processed += 1;
  }
  return { processed, remaining: remainingJobs(), results };
}

function publishNow(localId) {
  return schedule(async () => {
    enqueue(localId, "upsert");
    const job = database()
      .prepare("SELECT * FROM gini_jobs WHERE local_id=? AND status IN ('queued','retry') ORDER BY id DESC LIMIT 1")
      .get(localId);
    if (job) database().prepare("UPDATE gini_jobs SET next_attempt_at=?, updated_at=? WHERE id=?").run(nowIso(), nowIso(), job.id);
    const outcome = await processQueue(1, localId);
    const link = linkOf(localId);
    const result = outcome.results.find((row) => row.id === localId) || outcome.results[0] || null;
    return {
      ok: !!(link && link.status === "published" && !link.last_error),
      message: result?.message || link?.last_error || "أُضيف المنتج إلى طابور المزامنة",
      status: link?.status || "pending",
      remaining: outcome.remaining,
    };
  });
}

function syncAll() {
  return schedule(async () => {
    const products = dbApi.listProducts();
    products.forEach((product) => enqueue(product.id, "upsert"));
    const outcome = await processQueue(1);
    return { queued: products.length, ...outcome };
  });
}

function tick(limit = 1) {
  return schedule(() => processQueue(limit));
}

function saveSettings(input) {
  ensureSchema();
  const creds = getCredentials();
  const incomingId = String(input.clientId || "").trim();
  const incomingSecret = String(input.clientSecret || "").trim();
  let credentialsMessage = "";
  if (creds?.source === "env" && (incomingId || incomingSecret)) {
    credentialsMessage = "المفاتيح مضبوطة من بيئة السيرفر ولن تُستبدل من اللوحة";
  } else if (incomingId || incomingSecret) {
    const current = readSecretFile();
    const clientId = incomingId || current?.clientId || "";
    const clientSecret = incomingSecret || current?.clientSecret || "";
    if (!clientId || !clientSecret) {
      const error = new Error("أدخل Client ID وClient Secret معاً عند الحفظ الأول");
      error.permanent = true;
      throw error;
    }
    if (clientId.length > 300 || clientSecret.length > 500) {
      throw new Error("قيمة المفتاح أطول من المتوقع");
    }
    writeSecretFile(clientId, clientSecret);
    credentialsMessage = "تم حفظ بيانات الربط";
  }
  if (Object.prototype.hasOwnProperty.call(input, "autoSync")) configSet("auto_sync", input.autoSync ? "1" : "0");
  if (input.securityStock != null && input.securityStock !== "") configSet("security_stock", String(Math.max(0, Math.round(Number(input.securityStock) || 0))));
  if (Object.prototype.hasOwnProperty.call(input, "isInstallments")) configSet("is_installments", input.isInstallments ? "1" : "0");
  if (input.months != null && input.months !== "") configSet("months", String(Math.max(0, Math.min(10, Math.round(Number(input.months) || 0)))));
  if (Object.prototype.hasOwnProperty.call(input, "isGiniPartner")) configSet("is_gini_partner", input.isGiniPartner ? "1" : "0");
  const stored = getCredentials();
  const savedKeys = !!(stored && stored.clientId && stored.clientSecret);
  if ((incomingId || incomingSecret) && !savedKeys) {
    throw new Error("تعذر حفظ مفاتيح الربط");
  }
  return {
    ok: true,
    saved: savedKeys,
    configured: savedKeys,
    message: savedKeys ? "تم حفظ بيانات الربط" : credentialsMessage || "تم حفظ الإعدادات",
  };
}

function saveMaps(maps) {
  ensureSchema();
  const db = database();
  const stamp = nowIso();
  const replace = db.prepare(
    `INSERT INTO gini_category_map (local_category_id,gini_category_id,gini_subcategory_id,updated_at)
     VALUES (?,?,?,?)
     ON CONFLICT(local_category_id) DO UPDATE SET
       gini_category_id=excluded.gini_category_id,
       gini_subcategory_id=excluded.gini_subcategory_id,
       updated_at=excluded.updated_at`
  );
  const incoming = Array.isArray(maps) ? maps : [];
  const keep = [];
  incoming.forEach((row) => {
    const localId = String(row.localCategoryId || "").trim();
    const categoryId = Number(row.giniCategoryId);
    const subcategoryId = Number(row.giniSubcategoryId);
    if (!localId || !categoryId || !subcategoryId) return;
    replace.run(localId, categoryId, subcategoryId, stamp);
    keep.push(localId);
  });
  if (keep.length) {
    db.prepare(`DELETE FROM gini_category_map WHERE local_category_id NOT IN (${keep.map(() => "?").join(",")})`).run(...keep);
  } else {
    db.prepare("DELETE FROM gini_category_map").run();
  }
  return { ok: true };
}

function overview() {
  ensureSchema();
  const db = database();
  const creds = getCredentials();
  const products = dbApi.listProducts();
  const links = db.prepare("SELECT * FROM gini_links").all();
  const byId = new Map(links.map((row) => [row.local_id, row]));
  let published = 0;
  let failed = 0;
  let waiting = 0;
  const failedRows = [];
  products.forEach((product) => {
    const link = byId.get(product.id);
    if (link?.status === "published" && !link.last_error) {
      published += 1;
      return;
    }
    if (link?.status === "failed" || link?.last_error) {
      failed += 1;
      failedRows.push({
        localId: product.id,
        name: product.name,
        error: link.last_error || "فشلت المزامنة",
        updatedAt: link.updated_at || "",
        status: link.status,
      });
      return;
    }
    waiting += 1;
  });
  return {
    connection: {
      configured: !!creds,
      source: creds?.source || null,
      clientIdMasked: creds ? maskId(creds.clientId) : "",
      lastOk: configGet("last_ping_ok", "0") === "1",
      lastAt: configGet("last_ping_at", ""),
      lastMessage: configGet("last_ping_message", ""),
    },
    autoSync: isAuto(),
    securityStock: securityStock(),
    isInstallments: flag("is_installments"),
    months: Number(configGet("months", "0")) || 0,
    isGiniPartner: flag("is_gini_partner"),
    counts: { published, waiting, failed, queued: remainingJobs() },
    failed: failedRows,
    log: db.prepare("SELECT id,created_at,local_id,action,ok,message FROM gini_log ORDER BY id DESC LIMIT 30").all(),
    maps: db.prepare("SELECT local_category_id,gini_category_id,gini_subcategory_id FROM gini_category_map").all(),
    localCategories: dbApi.listCategories(),
  };
}

function links() {
  ensureSchema();
  return database()
    .prepare("SELECT local_id,gini_id,gini_sku,status,last_error,updated_at FROM gini_links")
    .all()
    .map((row) => ({
      localId: row.local_id,
      giniId: row.gini_id || "",
      giniSku: row.gini_sku || "",
      status: row.status,
      lastError: row.last_error || "",
      updatedAt: row.updated_at || "",
    }));
}

function startWorker() {
  if (workerTimer) return;
  workerTimer = setInterval(() => {
    schedule(() => processQueue(1)).catch((err) => console.error("gini worker", scrub(err.message)));
  }, 15000);
  if (typeof workerTimer.unref === "function") workerTimer.unref();
}

module.exports = {
  ensureSchema,
  startWorker,
  testConnection,
  fetchCategories,
  saveSettings,
  saveMaps,
  overview,
  links,
  noteProductSaved,
  noteStockChanged,
  publishNow,
  syncAll,
  tick,
  sign,
  salePriceOf,
  payloadOf,
  syncLocal,
};
