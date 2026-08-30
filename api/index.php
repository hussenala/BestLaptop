<?php
require_once __DIR__ . DIRECTORY_SEPARATOR . "load-env.php";
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");
header("X-LiteSpeed-Cache-Control: no-cache");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS");
if (!empty($_SERVER["HTTP_ORIGIN"])) {
  $origin = $_SERVER["HTTP_ORIGIN"];
  $allowed = [
    "https://way-company.com",
    "https://www.way-company.com",
    "https://bestlaptop-ip.com",
    "https://www.bestlaptop-ip.com",
    "http://127.0.0.1:8765",
    "http://localhost:8765",
  ];
  if (
    in_array($origin, $allowed, true)
    || preg_match("#^https://([a-z0-9-]+\\.)?way-company\\.com$#i", $origin)
    || preg_match("#^https://([a-z0-9-]+\\.)?bestlaptop-ip\\.com$#i", $origin)
  ) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
  }
}
if (($_SERVER["REQUEST_METHOD"] ?? "") === "OPTIONS") {
  http_response_code(204);
  exit;
}

function json_out($status, $body) {
  http_response_code($status);
  echo json_encode($body, JSON_UNESCAPED_UNICODE);
  exit;
}

function read_json() {
  $raw = file_get_contents("php://input");
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function bearer() {
  $h = $_SERVER["HTTP_AUTHORIZATION"] ?? $_SERVER["REDIRECT_HTTP_AUTHORIZATION"] ?? "";
  if (!$h && function_exists("getallheaders")) {
    $headers = getallheaders();
    $h = $headers["Authorization"] ?? $headers["authorization"] ?? "";
  }
  if (stripos($h, "Bearer ") === 0) return substr($h, 7);
  return null;
}

function route_path() {
  if (!empty($_GET["r"])) return "/" . ltrim((string) $_GET["r"], "/");
  if (!empty($_SERVER["PATH_INFO"])) return "/" . ltrim($_SERVER["PATH_INFO"], "/");
  $uri = parse_url($_SERVER["REQUEST_URI"] ?? "/", PHP_URL_PATH) ?: "/";
  if (preg_match("#/api(?:/index\\.php)?(/.*)?$#", $uri, $m)) {
    return $m[1] ?: "/";
  }
  return "/";
}

function db_file() {
  $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . "server" . DIRECTORY_SEPARATOR . "data";
  if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
    json_out(503, [
      "error" => "Database directory is not writable",
      "detail" => "Set permissions 775 on server/data/ in Hostinger File Manager.",
    ]);
  }
  return $dir . DIRECTORY_SEPARATOR . "store.db";
}

function db_writable() {
  $file = db_file();
  $dir = dirname($file);
  return (file_exists($file) && is_writable($file)) || is_writable($dir);
}

function pdo() {
  static $pdo;
  if ($pdo) return $pdo;
  if (!in_array("sqlite", PDO::getAvailableDrivers(), true)) {
    json_out(503, ["error" => "PDO SQLite is disabled. Enable it in hPanel → PHP Extensions."]);
  }
  $file = db_file();
  $pdo = new PDO("sqlite:" . $file, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
  $pdo->exec("PRAGMA foreign_keys = ON;");
  init_schema($pdo);
  return $pdo;
}

function init_schema(PDO $pdo) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, role TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, title TEXT NOT NULL, text TEXT);
    CREATE TABLE IF NOT EXISTS brands (id TEXT PRIMARY KEY, name TEXT NOT NULL, country TEXT);
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT, category TEXT,
      price INTEGER NOT NULL DEFAULT 0, old_price INTEGER, cpu TEXT, ram TEXT, storage TEXT,
      rating REAL DEFAULT 4.5, stock INTEGER DEFAULT 0, tag TEXT, specs TEXT, screen TEXT,
      gpu TEXT, tgp TEXT, cooling TEXT, headline TEXT, blurb TEXT, slide INTEGER DEFAULT 0,
      image TEXT, images_json TEXT, created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY, created_at TEXT NOT NULL, status TEXT NOT NULL,
      customer_json TEXT NOT NULL, address_json TEXT NOT NULL, delivery_json TEXT NOT NULL,
      payment_json TEXT NOT NULL, items_json TEXT NOT NULL, subtotal INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0, shipping INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, type TEXT NOT NULL, value INTEGER NOT NULL,
      min_amount INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, uses INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS hero_slides (
      id TEXT PRIMARY KEY, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL, headline TEXT, blurb TEXT, image TEXT, video_url TEXT, product_id TEXT,
      category TEXT, tag TEXT, gpu TEXT, tgp TEXT, cooling TEXT, screen TEXT, chip1 TEXT, chip2 TEXT
    );
    CREATE TABLE IF NOT EXISTS product_sliders (
      id TEXT PRIMARY KEY, sort_order INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
      eyebrow TEXT, title TEXT NOT NULL, category TEXT DEFAULT 'all', brand TEXT DEFAULT '',
      limit_count INTEGER DEFAULT 8, product_ids_json TEXT DEFAULT '[]', autoplay INTEGER DEFAULT 1,
      speed_ms INTEGER DEFAULT 4500, link_url TEXT DEFAULT 'products.html'
    );
  ");
  try {
    $cols = $pdo->query("PRAGMA table_info(product_sliders)")->fetchAll();
    $hasBrand = false;
    foreach ($cols as $c) {
      if (($c["name"] ?? "") === "brand") $hasBrand = true;
    }
    if (!$hasBrand) $pdo->exec("ALTER TABLE product_sliders ADD COLUMN brand TEXT DEFAULT ''");
  } catch (Throwable $e) {
    /* ignore migration errors */
  }
  try {
    $cols = $pdo->query("PRAGMA table_info(products)")->fetchAll();
    $hasCondition = false;
    $hasProductCondition = false;
    foreach ($cols as $c) {
      $name = $c["name"] ?? "";
      if ($name === "condition") $hasCondition = true;
      if ($name === "product_condition") $hasProductCondition = true;
    }
    if (!$hasProductCondition) {
      $pdo->exec("ALTER TABLE products ADD COLUMN product_condition TEXT NOT NULL DEFAULT 'new'");
      if ($hasCondition) {
        $pdo->exec("UPDATE products SET product_condition = COALESCE(NULLIF(condition, ''), 'new')");
      }
      $pdo->exec("UPDATE products SET product_condition = 'new' WHERE product_condition IS NULL OR product_condition = ''");
    }
  } catch (Throwable $e) {
    /* ignore migration errors */
  }
  try {
    $cols = $pdo->query("PRAGMA table_info(hero_slides)")->fetchAll();
    $hasVideo = false;
    foreach ($cols as $c) {
      if (($c["name"] ?? "") === "video_url") $hasVideo = true;
    }
    if (!$hasVideo) $pdo->exec("ALTER TABLE hero_slides ADD COLUMN video_url TEXT");
    $hasImageOnly = false;
    foreach ($cols as $c) {
      if (($c["name"] ?? "") === "image_only") $hasImageOnly = true;
    }
    if (!$hasImageOnly) $pdo->exec("ALTER TABLE hero_slides ADD COLUMN image_only INTEGER NOT NULL DEFAULT 0");
    $hasHideSpecs = false;
    foreach ($cols as $c) {
      if (($c["name"] ?? "") === "hide_specs") $hasHideSpecs = true;
    }
    if (!$hasHideSpecs) $pdo->exec("ALTER TABLE hero_slides ADD COLUMN hide_specs INTEGER NOT NULL DEFAULT 0");
    $hasTextPosition = false;
    foreach ($cols as $c) {
      if (($c["name"] ?? "") === "text_position") $hasTextPosition = true;
    }
    if (!$hasTextPosition) $pdo->exec("ALTER TABLE hero_slides ADD COLUMN text_position TEXT NOT NULL DEFAULT 'default'");
    $hasShowAddToCart = false;
    foreach ($cols as $c) {
      if (($c["name"] ?? "") === "show_add_to_cart") $hasShowAddToCart = true;
    }
    if (!$hasShowAddToCart) $pdo->exec("ALTER TABLE hero_slides ADD COLUMN show_add_to_cart INTEGER NOT NULL DEFAULT 1");
  } catch (Throwable $e) {
    /* ignore migration errors */
  }
  $n = (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
  if ($n === 0) {
    $ins = $pdo->prepare("INSERT INTO users (id,name,username,password_hash,role) VALUES (?,?,?,?,?)");
    $ins->execute(["u-admin", "حسين", "admin", hash_password("husseinalaa"), "admin"]);
    $ins->execute(["u-manager", "مدير المبيعات", "manager", hash_password("manager123"), "manager"]);
  }
  $cfgFile = __DIR__ . DIRECTORY_SEPARATOR . "config.php";
  $cfg = is_file($cfgFile) ? include $cfgFile : [];
  $user = trim((string) ($cfg["admin_user"] ?? ""));
  $pass = (string) ($cfg["admin_password"] ?? "");
  if ($user && $pass) {
    $st = $pdo->prepare("SELECT id, password_hash FROM users WHERE username=?");
    $st->execute([$user]);
    $row = $st->fetch();
    if ($row) {
      if (!verify_password($pass, $row["password_hash"])) {
        $pdo->prepare("UPDATE users SET password_hash=? WHERE username=?")->execute([hash_password($pass), $user]);
      }
    } else {
      $pdo->prepare("INSERT INTO users (id,name,username,password_hash,role) VALUES (?,?,?,?,?)")
        ->execute(["u-admin", $user, $user, hash_password($pass), "admin"]);
    }
  }
  seed_default_slides($pdo);
  migrate_checkout_options($pdo);
  migrate_office_gallery($pdo);
  migrate_office_gallery_v2($pdo);
}

function default_cities() {
  return [
    "بغداد", "البصرة", "الموصل", "أربيل", "النجف", "كربلاء", "بابل", "الأنبار",
    "ديالى", "واسط", "صلاح الدين", "كركوك", "ذي قار", "ميسان", "المثنى", "القادسية", "دهوك", "السليمانية",
  ];
}

function default_shipping() {
  return [
    ["id" => "baghdad", "label" => "توصيل بغداد", "fee" => 10000, "hint" => "توصيل داخل بغداد خلال يوم عمل"],
    ["id" => "governorate", "label" => "توصيل المحافظات", "fee" => 10000, "hint" => "توصيل خارج بغداد خلال 2–4 أيام"],
  ];
}

function default_payments() {
  return [
    ["id" => "cod", "label" => "الدفع عند الاستلام", "hint" => "ادفع نقداً عند استلام الطلب"],
    ["id" => "office", "label" => "الدفع في المعرض", "hint" => "ادفع في المعرض عند زيارتك"],
  ];
}

function normalize_store_phone($value) {
  $digits = preg_replace("/\D+/", "", (string) $value);
  if (strlen($digits) === 11 && str_starts_with($digits, "07")) {
    return substr($digits, 0, 4) . " " . substr($digits, 4, 3) . " " . substr($digits, 7);
  }
  if (strlen($digits) === 10 && str_starts_with($digits, "7")) {
    $digits = "0" . $digits;
    return substr($digits, 0, 4) . " " . substr($digits, 4, 3) . " " . substr($digits, 7);
  }
  return trim((string) $value);
}

function checkout_options(array $s) {
  if (empty($s["cities"])) $s["cities"] = default_cities();
  if (empty($s["shipping"])) $s["shipping"] = default_shipping();
  if (empty($s["payments"])) $s["payments"] = default_payments();
  $s["officeGallery"] = normalize_office_gallery($s["officeGallery"] ?? null);
  $s["maintenanceMode"] = !empty($s["maintenanceMode"]);
  if (empty($s["maintenanceMessage"])) $s["maintenanceMessage"] = "";
  if (!isset($s["homeLayout"]) || !is_array($s["homeLayout"])) $s["homeLayout"] = null;
  $s["cartEnabled"] = normalize_bool_setting($s["cartEnabled"] ?? null, true);
  if (!empty($s["phone"])) $s["phone"] = normalize_store_phone($s["phone"]);
  if (!empty($s["whatsapp"])) $s["whatsapp"] = normalize_store_phone($s["whatsapp"]);
  elseif (!empty($s["phone"])) $s["whatsapp"] = $s["phone"];
  if (empty($s["email"]) || trim((string) $s["email"]) === "\\") {
    $s["email"] = "support@bestlaptop.iq";
  }
  return $s;
}

function normalize_bool_setting($value, $default = true) {
  if ($value === null) return $default;
  if ($value === false || $value === 0 || $value === "0" || $value === "false") return false;
  if ($value === true || $value === 1 || $value === "1" || $value === "true") return true;
  return $default;
}

function is_maintenance_mode(PDO $pdo) {
  return !empty(settings_raw($pdo)["maintenanceMode"]);
}

function normalize_text_position($value) {
  $v = trim((string) ($value ?? "default"));
  return in_array($v, ["center", "right"], true) ? $v : "default";
}

function normalize_gallery_image($value) {
  if (is_string($value)) return trim($value);
  if (is_array($value)) {
    return trim((string) ($value["src"] ?? $value["url"] ?? ""));
  }
  return "";
}

function normalize_office_gallery($gallery) {
  $defaults = default_office_gallery();
  if (!is_array($gallery)) return $defaults;
  $images = is_array($gallery["images"] ?? null) ? $gallery["images"] : [];
  $normalized = [];
  foreach ($defaults["images"] as $key => $_) {
    $normalized[$key] = normalize_gallery_image($images[$key] ?? "");
  }
  return [
    "active" => ($gallery["active"] ?? true) !== false,
    "title" => trim((string) ($gallery["title"] ?? $defaults["title"])) ?: $defaults["title"],
    "images" => $normalized,
  ];
}

function default_office_gallery() {
  return [
    "active" => true,
    "title" => "من داخل مكتب بيست لابتوب",
    "images" => ["wide" => "", "tall" => "", "bottomStart" => "", "bottomEnd" => ""],
  ];
}

function merge_settings(array $current, array $patch) {
  $merged = array_replace_recursive($current, $patch);
  if (array_key_exists("officeGallery", $patch)) {
    $merged["officeGallery"] = normalize_office_gallery(
      array_replace_recursive($current["officeGallery"] ?? [], $patch["officeGallery"] ?? [])
    );
  }
  return checkout_options($merged);
}

function migrate_checkout_options(PDO $pdo) {
  $done = $pdo->query("SELECT value FROM meta WHERE key='checkout_opts_v2'")->fetchColumn();
  if ($done) return;
  $s = checkout_options(settings_raw($pdo));
  save_settings($pdo, $s);
  $pdo->exec("INSERT INTO meta (key,value) VALUES ('checkout_opts_v2','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value");
}

function migrate_office_gallery(PDO $pdo) {
  $done = $pdo->query("SELECT value FROM meta WHERE key='office_gallery_v1'")->fetchColumn();
  if ($done) return;
  $raw = settings_raw($pdo);
  if (empty($raw["officeGallery"]) || !is_array($raw["officeGallery"])) {
    $raw["officeGallery"] = default_office_gallery();
  }
  save_settings($pdo, checkout_options($raw));
  $pdo->exec("INSERT INTO meta (key,value) VALUES ('office_gallery_v1','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value");
}

function migrate_office_gallery_v2(PDO $pdo) {
  $done = $pdo->query("SELECT value FROM meta WHERE key='office_gallery_v2'")->fetchColumn();
  if ($done) return;
  $raw = settings_raw($pdo);
  save_settings($pdo, checkout_options($raw));
  $pdo->exec("INSERT INTO meta (key,value) VALUES ('office_gallery_v2','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value");
}

function ensure_upload_dir($folder) {
  $allowed = ["logo", "slides", "gallery", "products"];
  if (!in_array($folder, $allowed, true)) $folder = "products";
  $root = dirname(__DIR__) . DIRECTORY_SEPARATOR . "uploads";
  $dir = $root . DIRECTORY_SEPARATOR . $folder;
  if (!is_dir($root) && !@mkdir($root, 0775, true) && !is_dir($root)) {
    return [null, "Set permissions 775 on uploads/"];
  }
  if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
    return [null, "Set permissions 775 on uploads/$folder/"];
  }
  if (!is_writable($dir)) {
    return [null, "Set permissions 775 on uploads/$folder/"];
  }
  return [$dir, null];
}

function settings_raw(PDO $pdo) {
  $row = $pdo->query("SELECT value FROM settings WHERE key='main'")->fetchColumn();
  return $row ? (json_decode($row, true) ?: []) : [];
}

function seed_default_slides(PDO $pdo) {
  $count = (int) $pdo->query("SELECT COUNT(*) FROM hero_slides")->fetchColumn();
  if ($count > 0) return;
  $rows = $pdo->query("SELECT * FROM products WHERE slide=1 ORDER BY name")->fetchAll();
  if (!$rows) return;
  $ins = $pdo->prepare("INSERT INTO hero_slides (id,sort_order,active,title,headline,blurb,image,product_id,category,tag,gpu,tgp,cooling,screen,chip1,chip2)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)");
  foreach ($rows as $i => $row) {
    $images = json_decode($row["images_json"] ?: "[]", true) ?: [];
    $image = $row["image"] ?: ($images[0] ?? "");
    $ins->execute([
      "sl-" . $row["id"],
      $i,
      1,
      $row["name"],
      $row["headline"] ?? "",
      $row["blurb"] ?? "",
      $image,
      $row["id"],
      $row["category"] ?? "",
      $row["tag"] ?? "",
      $row["gpu"] ?? "",
      $row["tgp"] ?? "",
      $row["cooling"] ?? "",
      $row["screen"] ?? "",
      "ضمان سنتين حقيقي",
      "أداء كامل للكرت",
    ]);
  }
  if ($rows) bump($pdo);
}

function hash_password($password) {
  $salt = bin2hex(random_bytes(16));
  $hash = hash_pbkdf2("sha256", $password, $salt, 120000, 64, false);
  return "pbkdf2:$salt:$hash";
}

function verify_password($password, $stored) {
  $stored = (string) $stored;
  if (strpos($stored, "pbkdf2:") === 0) {
    $parts = explode(":", $stored, 3);
    if (count($parts) !== 3) return false;
    $next = hash_pbkdf2("sha256", $password, $parts[1], 120000, 64, false);
    return hash_equals($parts[2], $next);
  }
  if (strpos($stored, '$2y$') === 0 || strpos($stored, '$2a$') === 0) {
    return password_verify($password, $stored);
  }
  $parts = explode(":", $stored, 2);
  if (count($parts) === 2 && function_exists("sodium_crypto_pwhash_scryptsalsa208sha256_ll")) {
    $salt = @hex2bin($parts[0]);
    if ($salt === false || $salt === "") return false;
    try {
      $calc = sodium_crypto_pwhash_scryptsalsa208sha256_ll($password, $salt, 16384, 8, 1, 64);
      return hash_equals(strtolower($parts[1]), bin2hex($calc));
    } catch (Throwable $e) {
      return false;
    }
  }
  return false;
}

function uid($prefix) {
  return $prefix . "-" . base_convert((string) (int) (microtime(true) * 1000), 10, 36);
}

function bump(PDO $pdo) {
  $pdo->prepare("INSERT INTO meta (key,value) VALUES ('version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    ->execute([(string) (int) (microtime(true) * 1000)]);
}

function version(PDO $pdo) {
  $v = $pdo->query("SELECT value FROM meta WHERE key='version'")->fetchColumn();
  return $v ?: "0";
}

function app_build() {
  return 109;
}

function normalize_upload_path($src) {
  $src = trim((string) $src);
  if ($src === "") return "";
  if (preg_match('#^https?://#i', $src) || str_starts_with($src, "data:")) return $src;
  if (str_starts_with($src, "/")) return $src;
  return "/" . ltrim($src, "./");
}

function normalize_product_images($images, $cover = "") {
  $images = is_array($images) ? $images : [];
  $seen = [];
  $out = [];
  foreach ($images as $src) {
    $src = normalize_upload_path($src);
    if ($src === "" || isset($seen[$src])) continue;
    $seen[$src] = true;
    $out[] = $src;
  }
  $cover = normalize_upload_path($cover);
  if ($cover !== "") {
    $idx = array_search($cover, $out, true);
    if ($idx === false) array_unshift($out, $cover);
    elseif ($idx > 0) {
      $item = $out[$idx];
      array_splice($out, $idx, 1);
      array_unshift($out, $item);
    }
  }
  if (!$out && $cover !== "") $out = [$cover];
  return array_values($out);
}

function normalize_product_condition($value) {
  $raw = strtolower(trim((string) ($value ?? "new")));
  if ($raw === "open box" || $raw === "open_box" || $raw === "openbox") $raw = "open-box";
  if ($raw === "refurb") $raw = "refurbished";
  if ($raw === "مستعمل" || $raw === "يوزد") $raw = "used";
  $allowed = ["new", "refurbished", "open-box", "used"];
  return in_array($raw, $allowed, true) ? $raw : "new";
}

function product_condition_from_row($row) {
  if (!$row) return "new";
  $raw = $row["product_condition"] ?? $row["condition"] ?? "new";
  return normalize_product_condition($raw);
}

function product_condition_from_payload($payload, $fallback = "new") {
  if (!is_array($payload)) return normalize_product_condition($fallback);
  $raw = $payload["condition"] ?? $payload["productCondition"] ?? $fallback;
  return normalize_product_condition($raw);
}

function products_have_condition_column(PDO $pdo) {
  try {
    foreach ($pdo->query("PRAGMA table_info(products)")->fetchAll() as $c) {
      if (($c["name"] ?? "") === "product_condition") return true;
    }
  } catch (Throwable $e) {
    /* ignore */
  }
  return false;
}

function health(PDO $pdo) {
  $users = (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
  $products = (int) $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
  $uploads = dirname(__DIR__) . DIRECTORY_SEPARATOR . "uploads";
  [$galleryDir, $galleryError] = ensure_upload_dir("gallery");
  $conditionReady = products_have_condition_column($pdo);
  $features = ["cartEnabled", "showAddToCart", "headerSearchV2", "homeEffects", "adminModalFix"];
  if ($conditionReady) $features[] = "productCondition";
  return [
    "ok" => true,
    "db" => true,
    "engine" => "sqlite-php",
    "build" => app_build(),
    "features" => $features,
    "productConditionReady" => $conditionReady,
    "users" => $users,
    "hasAdmin" => $users > 0,
    "version" => version($pdo),
    "storeVersion" => version($pdo),
    "products" => $products,
    "dbWritable" => db_writable(),
    "uploadsWritable" => is_dir($uploads) ? is_writable($uploads) : @mkdir($uploads, 0775, true),
    "galleryUploadWritable" => $galleryDir !== null,
    "galleryUploadHint" => $galleryError,
  ];
}

function settings(PDO $pdo) {
  return checkout_options(settings_raw($pdo));
}

function save_settings(PDO $pdo, $s) {
  $normalized = checkout_options(is_array($s) ? $s : []);
  $pdo->prepare("INSERT INTO settings (key,value) VALUES ('main',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    ->execute([json_encode($normalized, JSON_UNESCAPED_UNICODE)]);
  bump($pdo);
}

function product_from_row($row) {
  if (!$row) return null;
  $images = [];
  if (!empty($row["images_json"])) {
    $images = json_decode($row["images_json"], true) ?: [];
  }
  if (!$images && !empty($row["image"])) $images = [$row["image"]];
  $images = normalize_product_images($images, $row["image"] ?? "");
  return [
    "id" => $row["id"],
    "name" => $row["name"],
    "brand" => $row["brand"],
    "category" => $row["category"],
    "price" => (int) $row["price"],
    "oldPrice" => $row["old_price"] === null ? null : (int) $row["old_price"],
    "cpu" => $row["cpu"],
    "ram" => $row["ram"],
    "storage" => $row["storage"],
    "stock" => (int) $row["stock"],
    "tag" => $row["tag"],
    "specs" => $row["specs"],
    "screen" => $row["screen"],
    "gpu" => $row["gpu"],
    "tgp" => $row["tgp"],
    "cooling" => $row["cooling"],
    "headline" => $row["headline"],
    "blurb" => $row["blurb"],
    "slide" => !empty($row["slide"]),
    "condition" => product_condition_from_row($row),
    "images" => $images,
    "image" => $images[0] ?? ($row["image"] ?? ""),
    "createdAt" => $row["created_at"] ?? "",
  ];
}

function list_products(PDO $pdo) {
  return array_map(
    "product_from_row",
    $pdo->query(
      "SELECT * FROM products ORDER BY COALESCE(NULLIF(created_at, ''), '1970-01-01') DESC, name ASC"
    )->fetchAll()
  );
}

function get_product(PDO $pdo, $id) {
  $st = $pdo->prepare("SELECT * FROM products WHERE id=?");
  $st->execute([$id]);
  return product_from_row($st->fetch());
}

function upsert_product(PDO $pdo, $p) {
  $rawImages = [];
  if (!empty($p["images"]) && is_array($p["images"])) $rawImages = $p["images"];
  elseif (!empty($p["image"])) $rawImages = [$p["image"]];
  $images = normalize_product_images($rawImages, $p["image"] ?? "");
  $existing = get_product($pdo, $p["id"]);
  $created = $existing["createdAt"] ?? ($p["createdAt"] ?? gmdate("c"));
  $condition = product_condition_from_payload($p, $existing["condition"] ?? "new");
  $st = $pdo->prepare("INSERT INTO products (id,name,brand,category,price,old_price,cpu,ram,storage,stock,tag,specs,screen,gpu,tgp,cooling,headline,blurb,slide,image,images_json,product_condition,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, brand=excluded.brand, category=excluded.category, price=excluded.price,
      old_price=excluded.old_price, cpu=excluded.cpu, ram=excluded.ram, storage=excluded.storage, stock=excluded.stock,
      tag=excluded.tag, specs=excluded.specs, screen=excluded.screen, gpu=excluded.gpu, tgp=excluded.tgp, cooling=excluded.cooling,
      headline=excluded.headline, blurb=excluded.blurb, slide=excluded.slide, image=excluded.image, images_json=excluded.images_json,
      product_condition=excluded.product_condition");
  $st->execute([
    $p["id"], $p["name"] ?? "", $p["brand"] ?? "", $p["category"] ?? "",
    (int) ($p["price"] ?? 0), isset($p["oldPrice"]) ? (int) $p["oldPrice"] : null,
    $p["cpu"] ?? "", $p["ram"] ?? "", $p["storage"] ?? "", (int) ($p["stock"] ?? 0),
    $p["tag"] ?? "", $p["specs"] ?? "", $p["screen"] ?? "", $p["gpu"] ?? "", $p["tgp"] ?? "",
    $p["cooling"] ?? "", $p["headline"] ?? "", $p["blurb"] ?? "", !empty($p["slide"]) ? 1 : 0,
    $images[0] ?? "", json_encode($images, JSON_UNESCAPED_UNICODE), $condition, $created,
  ]);
  bump($pdo);
  return get_product($pdo, $p["id"]);
}

function list_categories(PDO $pdo) {
  return $pdo->query("SELECT id, title, text FROM categories ORDER BY title")->fetchAll();
}
function list_brands(PDO $pdo) {
  return $pdo->query("SELECT * FROM brands ORDER BY name")->fetchAll();
}
function list_coupons(PDO $pdo) {
  $rows = $pdo->query("SELECT id,code,type,value,min_amount as min,active,uses FROM coupons ORDER BY code")->fetchAll();
  foreach ($rows as &$c) $c["active"] = !empty($c["active"]);
  return $rows;
}
function list_slides(PDO $pdo, $activeOnly = false) {
  $sql = "SELECT * FROM hero_slides" . ($activeOnly ? " WHERE active=1" : "") . " ORDER BY sort_order ASC, title ASC";
  $rows = $pdo->query($sql)->fetchAll();
  $out = [];
  foreach ($rows as $row) {
    $out[] = [
      "id" => $row["id"], "sortOrder" => (int) $row["sort_order"], "active" => !empty($row["active"]),
      "title" => $row["title"], "headline" => $row["headline"] ?? "", "blurb" => $row["blurb"] ?? "",
      "image" => $row["image"] ?? "", "videoUrl" => $row["video_url"] ?? "", "productId" => $row["product_id"] ?? "",
      "category" => $row["category"] ?? "", "tag" => $row["tag"] ?? "", "gpu" => $row["gpu"] ?? "",
      "tgp" => $row["tgp"] ?? "", "cooling" => $row["cooling"] ?? "", "screen" => $row["screen"] ?? "",
      "chip1" => $row["chip1"] ?? "", "chip2" => $row["chip2"] ?? "",
      "imageOnly" => !empty($row["image_only"]),
      "hideSpecs" => !empty($row["hide_specs"]),
      "textPosition" => normalize_text_position($row["text_position"] ?? "default"),
      "showAddToCart" => normalize_bool_setting($row["show_add_to_cart"] ?? null, true),
    ];
  }
  return $out;
}
function list_ps(PDO $pdo, $activeOnly = false) {
  $sql = "SELECT * FROM product_sliders" . ($activeOnly ? " WHERE active=1" : "") . " ORDER BY sort_order ASC, title ASC";
  $rows = $pdo->query($sql)->fetchAll();
  $out = [];
  foreach ($rows as $row) {
    $out[] = [
      "id" => $row["id"], "sortOrder" => (int) $row["sort_order"], "active" => !empty($row["active"]),
      "eyebrow" => $row["eyebrow"] ?? "", "title" => $row["title"], "category" => $row["category"] ?? "all",
      "brand" => $row["brand"] ?? "",
      "limit" => (int) ($row["limit_count"] ?? 8), "productIds" => json_decode($row["product_ids_json"] ?: "[]", true) ?: [],
      "autoplay" => (int) $row["autoplay"] !== 0, "speedMs" => (int) ($row["speed_ms"] ?? 4500),
      "linkUrl" => $row["link_url"] ?? "products.html",
    ];
  }
  return $out;
}

function get_slide(PDO $pdo, $id) {
  foreach (list_slides($pdo, false) as $s) {
    if ($s["id"] === $id) return $s;
  }
  return null;
}

function upsert_slide(PDO $pdo, array $s) {
  $id = $s["id"] ?? uid("sl");
  $pdo->prepare("INSERT INTO hero_slides (id,sort_order,active,title,headline,blurb,image,video_url,product_id,category,tag,gpu,tgp,cooling,screen,chip1,chip2,image_only,hide_specs,text_position,show_add_to_cart)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET sort_order=excluded.sort_order, active=excluded.active, title=excluded.title, headline=excluded.headline,
      blurb=excluded.blurb, image=excluded.image, video_url=excluded.video_url, product_id=excluded.product_id, category=excluded.category,
      tag=excluded.tag, gpu=excluded.gpu, tgp=excluded.tgp, cooling=excluded.cooling, screen=excluded.screen, chip1=excluded.chip1, chip2=excluded.chip2,
      image_only=excluded.image_only, hide_specs=excluded.hide_specs, text_position=excluded.text_position, show_add_to_cart=excluded.show_add_to_cart")
    ->execute([
      $id,
      (int) ($s["sortOrder"] ?? 0),
      !empty($s["active"]) ? 1 : 0,
      $s["title"] ?? "",
      $s["headline"] ?? "",
      $s["blurb"] ?? "",
      $s["image"] ?? "",
      $s["videoUrl"] ?? "",
      $s["productId"] ?? "",
      $s["category"] ?? "",
      $s["tag"] ?? "",
      $s["gpu"] ?? "",
      $s["tgp"] ?? "",
      $s["cooling"] ?? "",
      $s["screen"] ?? "",
      $s["chip1"] ?? "",
      $s["chip2"] ?? "",
      !empty($s["imageOnly"]) ? 1 : 0,
      !empty($s["hideSpecs"]) ? 1 : 0,
      normalize_text_position($s["textPosition"] ?? "default"),
      normalize_bool_setting($s["showAddToCart"] ?? null, true) ? 1 : 0,
    ]);
  bump($pdo);
  return get_slide($pdo, $id);
}

function get_ps(PDO $pdo, $id) {
  foreach (list_ps($pdo, false) as $s) {
    if ($s["id"] === $id) return $s;
  }
  return null;
}

function upsert_ps(PDO $pdo, array $s) {
  $id = $s["id"] ?? uid("ps");
  $productIds = $s["productIds"] ?? [];
  if (!is_array($productIds)) $productIds = [];
  $pdo->prepare("INSERT INTO product_sliders (id,sort_order,active,eyebrow,title,category,brand,limit_count,product_ids_json,autoplay,speed_ms,link_url)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET sort_order=excluded.sort_order, active=excluded.active, eyebrow=excluded.eyebrow, title=excluded.title,
      category=excluded.category, brand=excluded.brand, limit_count=excluded.limit_count, product_ids_json=excluded.product_ids_json,
      autoplay=excluded.autoplay, speed_ms=excluded.speed_ms, link_url=excluded.link_url")
    ->execute([
      $id,
      (int) ($s["sortOrder"] ?? 0),
      !empty($s["active"]) ? 1 : 0,
      $s["eyebrow"] ?? "",
      $s["title"] ?? "",
      $s["category"] ?? "all",
      $s["brand"] ?? "",
      (int) ($s["limit"] ?? 8),
      json_encode($productIds, JSON_UNESCAPED_UNICODE),
      !empty($s["autoplay"]) ? 1 : 0,
      (int) ($s["speedMs"] ?? 4500),
      $s["linkUrl"] ?? "products.html",
    ]);
  bump($pdo);
  return get_ps($pdo, $id);
}

function list_orders(PDO $pdo) {
  $rows = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC")->fetchAll();
  $out = [];
  foreach ($rows as $row) {
    $out[] = [
      "id" => $row["id"], "createdAt" => $row["created_at"], "status" => $row["status"],
      "customer" => json_decode($row["customer_json"], true), "address" => json_decode($row["address_json"], true),
      "delivery" => json_decode($row["delivery_json"], true), "payment" => json_decode($row["payment_json"], true),
      "items" => json_decode($row["items_json"], true), "subtotal" => (int) $row["subtotal"],
      "discount" => (int) $row["discount"], "shipping" => (int) $row["shipping"], "total" => (int) $row["total"],
    ];
  }
  return $out;
}
function unique_customers($orders) {
  $map = [];
  foreach ($orders as $o) {
    $key = $o["customer"]["phone"] ?? "";
    $prev = $map[$key] ?? ["orders" => 0, "spent" => 0];
    $map[$key] = [
      "id" => "cu-" . $key, "name" => $o["customer"]["name"] ?? "", "phone" => $key,
      "email" => $o["customer"]["email"] ?? "", "city" => $o["address"]["city"] ?? "",
      "orders" => $prev["orders"] + 1, "spent" => $prev["spent"] + (int) ($o["total"] ?? 0),
    ];
  }
  return array_values($map);
}
function list_users(PDO $pdo) {
  return $pdo->query("SELECT id,name,username,role FROM users ORDER BY name")->fetchAll();
}

function session_user(PDO $pdo) {
  $token = bearer();
  if (!$token) return null;
  $st = $pdo->prepare("SELECT u.id,u.name,u.username,u.role,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=?");
  $st->execute([$token]);
  $row = $st->fetch();
  if (!$row || (int) $row["expires_at"] < (int) (microtime(true) * 1000)) {
    if ($row) $pdo->prepare("DELETE FROM sessions WHERE token=?")->execute([$token]);
    return null;
  }
  $pdo->prepare("UPDATE sessions SET expires_at=? WHERE token=?")->execute([
    (int) (microtime(true) * 1000) + 1000 * 60 * 60 * 24 * 30,
    $token,
  ]);
  return ["id" => $row["id"], "name" => $row["name"], "username" => $row["username"], "role" => $row["role"]];
}

function require_auth(PDO $pdo, $roles = null) {
  $user = session_user($pdo);
  if (!$user) json_out(401, ["error" => "Unauthorized"]);
  if ($roles && !in_array($user["role"], $roles, true) && $user["role"] !== "admin") {
    json_out(403, ["error" => "Forbidden"]);
  }
  return $user;
}

function public_store(PDO $pdo) {
  $s = settings($pdo);
  return [
    "version" => version($pdo),
    "products" => list_products($pdo),
    "categories" => list_categories($pdo),
    "brands" => list_brands($pdo),
    "settings" => $s,
    "slides" => list_slides($pdo, true),
    "productSliders" => list_ps($pdo, true),
    "store" => [
      "name" => $s["name"] ?? "BEST LAPTOP",
      "nameAr" => $s["nameAr"] ?? "بيست لابتوب",
      "logo" => $s["logo"] ?? "img/logo.jpg",
      "notice" => $s["notice"] ?? "",
      "city" => $s["city"] ?? "",
      "address" => $s["address"] ?? "",
      "fullAddress" => $s["fullAddress"] ?? "",
      "phone" => $s["phone"] ?? "",
      "whatsapp" => $s["whatsapp"] ?? ($s["phone"] ?? ""),
      "email" => $s["email"] ?? "",
      "hours" => $s["hours"] ?? "",
      "warranty" => $s["warranty"] ?? "",
      "currency" => $s["currency"] ?? "IQD",
      "cities" => $s["cities"] ?? [],
      "shipping" => $s["shipping"] ?? [],
      "payments" => $s["payments"] ?? [],
      "featured" => $s["featured"] ?? ["eyebrow" => "الأكثر مبيعاً", "title" => "منتجات مميزة للقيمنق والمونتاج", "category" => "all", "limit" => 8, "productIds" => [], "autoplay" => true, "speedMs" => 4500],
      "officeGallery" => normalize_office_gallery($s["officeGallery"] ?? null),
      "maintenanceMode" => !empty($s["maintenanceMode"]),
      "maintenanceMessage" => $s["maintenanceMessage"] ?? "",
      "cartEnabled" => normalize_bool_setting($s["cartEnabled"] ?? null, true),
    ],
  ];
}

try {
  $pdo = pdo();
  $method = strtoupper($_SERVER["REQUEST_METHOD"] ?? "GET");
  $path = route_path();
  $path = "/" . ltrim($path, "/");
  if ($path === "/index.php") $path = "/";

  if ($path === "/health" && $method === "GET") json_out(200, health($pdo));
  if ($path === "/store" && $method === "GET") json_out(200, public_store($pdo));

  if ($path === "/orders" && $method === "POST") {
    if (is_maintenance_mode($pdo)) json_out(503, ["error" => "الموقع تحت الصيانة حالياً"]);
    $body = read_json();
    if (empty($body["items"])) json_out(400, ["error" => "Empty order"]);
    $id = $body["id"] ?? ("BL-" . substr((string) time(), -6));
    foreach ($body["items"] as $item) {
      $p = get_product($pdo, $item["id"]);
      if (!$p || $p["stock"] < (int) $item["qty"]) json_out(400, ["error" => "Product unavailable: " . $item["id"]]);
    }
    $pdo->prepare("INSERT INTO orders (id,created_at,status,customer_json,address_json,delivery_json,payment_json,items_json,subtotal,discount,shipping,total) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
      ->execute([
        $id, $body["createdAt"] ?? gmdate("c"), "new",
        json_encode($body["customer"] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($body["address"] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($body["delivery"] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($body["payment"] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($body["items"], JSON_UNESCAPED_UNICODE),
        (int) ($body["subtotal"] ?? 0), (int) ($body["discount"] ?? 0),
        (int) ($body["shipping"] ?? 0), (int) ($body["total"] ?? 0),
      ]);
    foreach ($body["items"] as $item) {
      $pdo->prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id=?")->execute([(int) $item["qty"], $item["id"]]);
    }
    bump($pdo);
    $orders = list_orders($pdo);
    foreach ($orders as $o) if ($o["id"] === $id) json_out(201, $o);
    json_out(201, ["id" => $id]);
  }

  if (preg_match("#^/orders/([^/]+)$#", $path, $m) && $method === "GET") {
    foreach (list_orders($pdo) as $o) if ($o["id"] === urldecode($m[1])) json_out(200, $o);
    json_out(404, ["error" => "Not found"]);
  }

  if ($path === "/auth/login" && $method === "POST") {
    $body = read_json();
    $name = trim((string) ($body["username"] ?? ""));
    $pass = (string) ($body["password"] ?? "");
    $st = $pdo->prepare("SELECT * FROM users WHERE username=? OR lower(username)=lower(?)");
    $st->execute([$name, $name]);
    $user = $st->fetch();
    $ok = $user && verify_password($pass, $user["password_hash"]);
    if (!$ok) {
      $h = health($pdo);
      if (!$h["hasAdmin"]) json_out(503, ["error" => "Admin accounts missing"]);
      json_out(401, ["error" => "Invalid credentials"]);
    }
    $token = bin2hex(random_bytes(32));
    $expires = (int) (microtime(true) * 1000) + 1000 * 60 * 60 * 24 * 30;
    $pdo->prepare("INSERT INTO sessions (token,user_id,expires_at) VALUES (?,?,?)")->execute([$token, $user["id"], $expires]);
    json_out(200, [
      "token" => $token,
      "user" => ["id" => $user["id"], "name" => $user["name"], "username" => $user["username"], "role" => $user["role"]],
      "expires" => $expires,
    ]);
  }

  if ($path === "/auth/logout" && $method === "POST") {
    $t = bearer();
    if ($t) $pdo->prepare("DELETE FROM sessions WHERE token=?")->execute([$t]);
    json_out(200, ["ok" => true]);
  }

  if ($path === "/auth/me" && $method === "GET") {
    $user = session_user($pdo);
    if (!$user) json_out(401, ["error" => "Unauthorized"]);
    json_out(200, ["user" => $user]);
  }

  if ($path === "/admin/state" && $method === "GET") {
    $user = require_auth($pdo);
    $orders = list_orders($pdo);
    json_out(200, [
      "version" => version($pdo),
      "products" => list_products($pdo),
      "categories" => list_categories($pdo),
      "brands" => list_brands($pdo),
      "orders" => $orders,
      "customers" => unique_customers($orders),
      "coupons" => list_coupons($pdo),
      "slides" => list_slides($pdo, false),
      "productSliders" => list_ps($pdo, false),
      "settings" => settings($pdo),
      "users" => list_users($pdo),
      "orderStatuses" => [
        ["id" => "new", "label" => "جديد"], ["id" => "confirming", "label" => "قيد التأكيد"],
        ["id" => "preparing", "label" => "قيد التجهيز"], ["id" => "ready", "label" => "جاهز للتسليم"],
        ["id" => "done", "label" => "مكتمل"], ["id" => "canceled", "label" => "ملغي"],
      ],
      "user" => $user,
    ]);
  }

  if ($path === "/admin/products") {
    require_auth($pdo);
    if ($method === "GET") json_out(200, list_products($pdo));
    if ($method === "POST") {
      $body = read_json();
      $body["id"] = $body["id"] ?? uid("pr");
      json_out(201, upsert_product($pdo, $body));
    }
  }
  if (preg_match("#^/admin/products/([^/]+)$#", $path, $m)) {
    require_auth($pdo);
    $id = urldecode($m[1]);
    if ($method === "PUT") {
      $body = read_json();
      $body["id"] = $id;
      json_out(200, upsert_product($pdo, $body));
    }
    if ($method === "DELETE") {
      $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
      bump($pdo);
      json_out(200, ["ok" => true]);
    }
  }

  if ($path === "/admin/categories") {
    require_auth($pdo);
    if ($method === "GET") json_out(200, list_categories($pdo));
    if ($method === "POST") {
      $body = read_json();
      $pdo->prepare("INSERT INTO categories (id,title,text) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, text=excluded.text")
        ->execute([$body["id"], $body["title"] ?? "", $body["text"] ?? ""]);
      bump($pdo);
      json_out(201, $body);
    }
  }
  if (preg_match("#^/admin/categories/([^/]+)$#", $path, $m)) {
    require_auth($pdo);
    $id = urldecode($m[1]);
    if ($method === "PUT") {
      $body = read_json();
      $body["id"] = $id;
      $pdo->prepare("INSERT INTO categories (id,title,text) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, text=excluded.text")
        ->execute([$id, $body["title"] ?? "", $body["text"] ?? ""]);
      bump($pdo);
      json_out(200, $body);
    }
    if ($method === "DELETE") {
      $pdo->prepare("DELETE FROM categories WHERE id=?")->execute([$id]);
      bump($pdo);
      json_out(200, ["ok" => true]);
    }
  }

  if ($path === "/admin/brands") {
    require_auth($pdo);
    if ($method === "GET") json_out(200, list_brands($pdo));
    if ($method === "POST") {
      $body = read_json();
      $body["id"] = $body["id"] ?? uid("br");
      $pdo->prepare("INSERT INTO brands (id,name,country) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, country=excluded.country")
        ->execute([$body["id"], $body["name"] ?? "", $body["country"] ?? ""]);
      bump($pdo);
      json_out(201, $body);
    }
  }
  if (preg_match("#^/admin/brands/([^/]+)$#", $path, $m)) {
    require_auth($pdo);
    $id = urldecode($m[1]);
    if ($method === "PUT") {
      $body = read_json();
      $body["id"] = $id;
      $pdo->prepare("INSERT INTO brands (id,name,country) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, country=excluded.country")
        ->execute([$id, $body["name"] ?? "", $body["country"] ?? ""]);
      bump($pdo);
      json_out(200, $body);
    }
    if ($method === "DELETE") {
      $pdo->prepare("DELETE FROM brands WHERE id=?")->execute([$id]);
      bump($pdo);
      json_out(200, ["ok" => true]);
    }
  }

  if ($path === "/admin/coupons") {
    require_auth($pdo);
    if ($method === "GET") json_out(200, list_coupons($pdo));
    if ($method === "POST") {
      $body = read_json();
      $body["id"] = $body["id"] ?? uid("cp");
      $pdo->prepare("INSERT INTO coupons (id,code,type,value,min_amount,active,uses) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET code=excluded.code,type=excluded.type,value=excluded.value,min_amount=excluded.min_amount,active=excluded.active,uses=excluded.uses")
        ->execute([$body["id"], $body["code"] ?? "", $body["type"] ?? "percent", (int) ($body["value"] ?? 0), (int) ($body["min"] ?? 0), !empty($body["active"]) ? 1 : 0, (int) ($body["uses"] ?? 0)]);
      bump($pdo);
      json_out(201, $body);
    }
  }
  if (preg_match("#^/admin/coupons/([^/]+)$#", $path, $m)) {
    require_auth($pdo);
    $id = urldecode($m[1]);
    if ($method === "PUT") {
      $body = read_json();
      $body["id"] = $id;
      $pdo->prepare("INSERT INTO coupons (id,code,type,value,min_amount,active,uses) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET code=excluded.code,type=excluded.type,value=excluded.value,min_amount=excluded.min_amount,active=excluded.active,uses=excluded.uses")
        ->execute([$id, $body["code"] ?? "", $body["type"] ?? "percent", (int) ($body["value"] ?? 0), (int) ($body["min"] ?? 0), !empty($body["active"]) ? 1 : 0, (int) ($body["uses"] ?? 0)]);
      bump($pdo);
      json_out(200, $body);
    }
    if ($method === "DELETE") {
      $pdo->prepare("DELETE FROM coupons WHERE id=?")->execute([$id]);
      bump($pdo);
      json_out(200, ["ok" => true]);
    }
  }

  if ($path === "/admin/orders" && $method === "GET") {
    require_auth($pdo);
    json_out(200, list_orders($pdo));
  }
  if (preg_match("#^/admin/orders/([^/]+)$#", $path, $m)) {
    require_auth($pdo);
    $id = urldecode($m[1]);
    if ($method === "PATCH") {
      $body = read_json();
      if (empty($body["status"])) json_out(400, ["error" => "status required"]);
      $pdo->prepare("UPDATE orders SET status=? WHERE id=?")->execute([$body["status"], $id]);
      bump($pdo);
      foreach (list_orders($pdo) as $o) if ($o["id"] === $id) json_out(200, $o);
      json_out(404, ["error" => "Not found"]);
    }
    if ($method === "DELETE") {
      $pdo->prepare("DELETE FROM orders WHERE id=?")->execute([$id]);
      bump($pdo);
      json_out(200, ["ok" => true]);
    }
  }

  if ($path === "/admin/upload" && $method === "POST") {
    require_auth($pdo);
    $body = read_json();
    if (!preg_match("#^data:image/(\\w+);base64,(.+)$#", (string) ($body["data"] ?? ""), $mm)) {
      json_out(400, ["error" => "Invalid image data"]);
    }
    $ext = $mm[1] === "jpeg" ? "jpg" : $mm[1];
    $bin = base64_decode($mm[2], true);
    if ($bin === false || strlen($bin) > 8 * 1024 * 1024) json_out(400, ["error" => "Image too large (max 8MB)"]);
    $folder = in_array($body["folder"] ?? "", ["logo", "slides", "gallery"], true) ? $body["folder"] : "products";
    [$dir, $uploadError] = ensure_upload_dir($folder);
    if (!$dir) {
      json_out(500, ["error" => "Upload folder not writable", "detail" => $uploadError]);
    }
    $name = (int) (microtime(true) * 1000) . "-" . bin2hex(random_bytes(4)) . "." . $ext;
    if (file_put_contents($dir . DIRECTORY_SEPARATOR . $name, $bin) === false) {
      json_out(500, ["error" => "Upload failed", "detail" => "Could not write file to uploads/$folder/"]);
    }
    json_out(201, ["url" => "/uploads/$folder/$name"]);
  }

  if ($path === "/admin/office-gallery" && in_array($method, ["GET", "PATCH"], true)) {
    require_auth($pdo);
    if ($method === "GET") {
      json_out(200, normalize_office_gallery(settings_raw($pdo)["officeGallery"] ?? null));
    }
    if ($method === "PATCH") {
      $body = read_json();
      $current = settings_raw($pdo);
      $merged = merge_settings($current, ["officeGallery" => is_array($body) ? $body : []]);
      save_settings($pdo, $merged);
      json_out(200, $merged["officeGallery"]);
    }
  }

  if ($path === "/admin/inventory" && $method === "PATCH") {
    require_auth($pdo);
    $body = read_json();
    $p = get_product($pdo, $body["id"] ?? "");
    if (!$p) json_out(404, ["error" => "Not found"]);
    $p["stock"] = (int) $body["stock"];
    json_out(200, upsert_product($pdo, $p));
  }

  if ($path === "/admin/settings") {
    require_auth($pdo, ["admin"]);
    if ($method === "GET") json_out(200, settings($pdo));
    if ($method === "PUT") {
      $body = read_json();
      $merged = merge_settings(settings_raw($pdo), is_array($body) ? $body : []);
      save_settings($pdo, $merged);
      json_out(200, ["settings" => $merged, "version" => version($pdo)]);
    }
  }

  if ($path === "/admin/users") {
    require_auth($pdo, ["admin"]);
    if ($method === "GET") json_out(200, list_users($pdo));
    if ($method === "POST") {
      $body = read_json();
      $id = $body["id"] ?? uid("u");
      $pdo->prepare("INSERT INTO users (id,name,username,password_hash,role) VALUES (?,?,?,?,?)")
        ->execute([$id, $body["name"] ?? "", $body["username"] ?? "", hash_password($body["password"] ?? ""), $body["role"] ?? "manager"]);
      json_out(201, ["id" => $id, "name" => $body["name"] ?? "", "username" => $body["username"] ?? "", "role" => $body["role"] ?? "manager"]);
    }
  }
  if (preg_match("#^/admin/users/([^/]+)$#", $path, $m)) {
    require_auth($pdo, ["admin"]);
    $id = urldecode($m[1]);
    if ($method === "PUT") {
      $body = read_json();
      $st = $pdo->prepare("SELECT * FROM users WHERE id=?");
      $st->execute([$id]);
      $existing = $st->fetch();
      if (!$existing) json_out(400, ["error" => "المستخدم غير موجود"]);
      $name = trim((string) ($body["name"] ?? $existing["name"]));
      $username = trim((string) ($body["username"] ?? $existing["username"]));
      $role = $body["role"] ?? $existing["role"];
      if ($existing["role"] === "admin" && $role !== "admin") {
        $adminCount = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn();
        if ($adminCount < 2) json_out(400, ["error" => "لا يمكن تغيير دور آخر أدمن"]);
      }
      if (!empty($body["password"])) {
        $pdo->prepare("UPDATE users SET name=?, username=?, password_hash=?, role=? WHERE id=?")
          ->execute([$name, $username, hash_password($body["password"]), $role, $id]);
      } else {
        $pdo->prepare("UPDATE users SET name=?, username=?, role=? WHERE id=?")->execute([$name, $username, $role, $id]);
      }
      json_out(200, ["id" => $id, "name" => $name, "username" => $username, "role" => $role]);
    }
    if ($method === "DELETE") {
      $users = list_users($pdo);
      $target = null;
      $admins = 0;
      foreach ($users as $u) {
        if ($u["role"] === "admin") $admins++;
        if ($u["id"] === $id) $target = $u;
      }
      if ($admins < 2 && ($target["role"] ?? "") === "admin") json_out(400, ["error" => "Cannot delete last admin"]);
      $pdo->prepare("DELETE FROM users WHERE id=?")->execute([$id]);
      json_out(200, ["ok" => true]);
    }
  }

  if ($path === "/admin/slides/reorder" && $method === "PATCH") {
    require_auth($pdo);
    $ids = read_json()["ids"] ?? [];
    $i = 0;
    foreach ($ids as $id) {
      $pdo->prepare("UPDATE hero_slides SET sort_order=? WHERE id=?")->execute([$i++, $id]);
    }
    bump($pdo);
    json_out(200, ["ok" => true]);
  }
  if ($path === "/admin/product-sliders/reorder" && $method === "PATCH") {
    require_auth($pdo);
    $ids = read_json()["ids"] ?? [];
    $i = 0;
    foreach ($ids as $id) {
      $pdo->prepare("UPDATE product_sliders SET sort_order=? WHERE id=?")->execute([$i++, $id]);
    }
    bump($pdo);
    json_out(200, ["ok" => true]);
  }

  if ($path === "/admin/slides") {
    require_auth($pdo);
    if ($method === "GET") json_out(200, list_slides($pdo, false));
    if ($method === "POST") {
      $body = read_json();
      if (!isset($body["sortOrder"])) $body["sortOrder"] = count(list_slides($pdo, false));
      json_out(201, upsert_slide($pdo, $body));
    }
  }
  if (preg_match("#^/admin/slides/([^/]+)$#", $path, $m)) {
    require_auth($pdo);
    $id = urldecode($m[1]);
    if ($method === "PUT") {
      $body = read_json();
      $body["id"] = $id;
      json_out(200, upsert_slide($pdo, $body));
    }
    if ($method === "DELETE") {
      $pdo->prepare("DELETE FROM hero_slides WHERE id=?")->execute([$id]);
      bump($pdo);
      json_out(200, ["ok" => true]);
    }
  }

  if ($path === "/admin/product-sliders") {
    require_auth($pdo);
    if ($method === "GET") json_out(200, list_ps($pdo, false));
    if ($method === "POST") {
      $body = read_json();
      if (!isset($body["sortOrder"])) $body["sortOrder"] = count(list_ps($pdo, false));
      json_out(201, upsert_ps($pdo, $body));
    }
  }
  if (preg_match("#^/admin/product-sliders/([^/]+)$#", $path, $m)) {
    require_auth($pdo);
    $id = urldecode($m[1]);
    if ($method === "PUT") {
      $body = read_json();
      $body["id"] = $id;
      json_out(200, upsert_ps($pdo, $body));
    }
    if ($method === "DELETE") {
      $pdo->prepare("DELETE FROM product_sliders WHERE id=?")->execute([$id]);
      bump($pdo);
      json_out(200, ["ok" => true]);
    }
  }

  json_out(404, ["error" => "API route not found", "path" => $path]);
} catch (Throwable $e) {
  json_out(500, ["error" => "Server error", "detail" => $e->getMessage()]);
}
