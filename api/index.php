<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS");
if (!empty($_SERVER["HTTP_ORIGIN"])) {
  header("Access-Control-Allow-Origin: " . $_SERVER["HTTP_ORIGIN"]);
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
    $dir = sys_get_temp_dir();
  }
  return $dir . DIRECTORY_SEPARATOR . "store.db";
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
      eyebrow TEXT, title TEXT NOT NULL, category TEXT DEFAULT 'all', limit_count INTEGER DEFAULT 8,
      product_ids_json TEXT DEFAULT '[]', autoplay INTEGER DEFAULT 1, speed_ms INTEGER DEFAULT 4500,
      link_url TEXT DEFAULT 'products.html'
    );
  ");
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

function health(PDO $pdo) {
  $users = (int) $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
  return ["ok" => true, "db" => true, "engine" => "sqlite-php", "users" => $users, "hasAdmin" => $users > 0, "version" => version($pdo)];
}

function settings(PDO $pdo) {
  $row = $pdo->query("SELECT value FROM settings WHERE key='main'")->fetchColumn();
  return $row ? (json_decode($row, true) ?: []) : [];
}

function save_settings(PDO $pdo, $s) {
  $pdo->prepare("INSERT INTO settings (key,value) VALUES ('main',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")
    ->execute([json_encode($s, JSON_UNESCAPED_UNICODE)]);
  bump($pdo);
}

function product_from_row($row) {
  if (!$row) return null;
  $images = [];
  if (!empty($row["images_json"])) {
    $images = json_decode($row["images_json"], true) ?: [];
  }
  if (!$images && !empty($row["image"])) $images = [$row["image"]];
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
    "images" => $images,
    "image" => $images[0] ?? ($row["image"] ?? ""),
    "createdAt" => $row["created_at"] ?? "",
  ];
}

function list_products(PDO $pdo) {
  return array_map("product_from_row", $pdo->query("SELECT * FROM products ORDER BY name")->fetchAll());
}

function get_product(PDO $pdo, $id) {
  $st = $pdo->prepare("SELECT * FROM products WHERE id=?");
  $st->execute([$id]);
  return product_from_row($st->fetch());
}

function upsert_product(PDO $pdo, $p) {
  $images = [];
  if (!empty($p["images"]) && is_array($p["images"])) $images = $p["images"];
  elseif (!empty($p["image"])) $images = [$p["image"]];
  $existing = get_product($pdo, $p["id"]);
  $created = $existing["createdAt"] ?? ($p["createdAt"] ?? gmdate("c"));
  $st = $pdo->prepare("INSERT INTO products (id,name,brand,category,price,old_price,cpu,ram,storage,stock,tag,specs,screen,gpu,tgp,cooling,headline,blurb,slide,image,images_json,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, brand=excluded.brand, category=excluded.category, price=excluded.price,
      old_price=excluded.old_price, cpu=excluded.cpu, ram=excluded.ram, storage=excluded.storage, stock=excluded.stock,
      tag=excluded.tag, specs=excluded.specs, screen=excluded.screen, gpu=excluded.gpu, tgp=excluded.tgp, cooling=excluded.cooling,
      headline=excluded.headline, blurb=excluded.blurb, slide=excluded.slide, image=excluded.image, images_json=excluded.images_json");
  $st->execute([
    $p["id"], $p["name"] ?? "", $p["brand"] ?? "", $p["category"] ?? "",
    (int) ($p["price"] ?? 0), isset($p["oldPrice"]) ? (int) $p["oldPrice"] : null,
    $p["cpu"] ?? "", $p["ram"] ?? "", $p["storage"] ?? "", (int) ($p["stock"] ?? 0),
    $p["tag"] ?? "", $p["specs"] ?? "", $p["screen"] ?? "", $p["gpu"] ?? "", $p["tgp"] ?? "",
    $p["cooling"] ?? "", $p["headline"] ?? "", $p["blurb"] ?? "", !empty($p["slide"]) ? 1 : 0,
    $images[0] ?? "", json_encode($images, JSON_UNESCAPED_UNICODE), $created,
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
      "limit" => (int) ($row["limit_count"] ?? 8), "productIds" => json_decode($row["product_ids_json"] ?: "[]", true) ?: [],
      "autoplay" => (int) $row["autoplay"] !== 0, "speedMs" => (int) ($row["speed_ms"] ?? 4500),
      "linkUrl" => $row["link_url"] ?? "products.html",
    ];
  }
  return $out;
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
    $expires = (int) (microtime(true) * 1000) + 1000 * 60 * 60 * 12;
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
    $folder = in_array($body["folder"] ?? "", ["logo", "slides"], true) ? $body["folder"] : "products";
    $dir = dirname(__DIR__) . DIRECTORY_SEPARATOR . "uploads" . DIRECTORY_SEPARATOR . $folder;
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) json_out(400, ["error" => "Upload failed"]);
    $name = (int) (microtime(true) * 1000) . "-" . bin2hex(random_bytes(4)) . "." . $ext;
    file_put_contents($dir . DIRECTORY_SEPARATOR . $name, $bin);
    json_out(201, ["url" => "/uploads/$folder/$name"]);
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
      save_settings($pdo, $body);
      json_out(200, $body);
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

  json_out(404, ["error" => "API route not found", "path" => $path]);
} catch (Throwable $e) {
  json_out(500, ["error" => "Server error", "detail" => $e->getMessage()]);
}
