<?php
/** GINI third-party client. Endpoints are limited to the official merchant docs. */

const GINI_ORIGIN = "https://merchant.gini.iq";
const GINI_USER_AGENT = "BestLaptop-Gini/1.0";
const GINI_MAX_ATTEMPTS = 5;

function gini_data_dir() {
  return dirname(__DIR__) . DIRECTORY_SEPARATOR . "server" . DIRECTORY_SEPARATOR . "data";
}

function gini_now() {
  return gmdate("c");
}

function gini_ensure(PDO $pdo) {
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS gini_config (key TEXT PRIMARY KEY, value TEXT NOT NULL);
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
  ");
  $stale = gmdate("c", time() - 120);
  $pdo->prepare("UPDATE gini_jobs SET status='queued', updated_at=? WHERE status='running' AND updated_at < ?")->execute([gini_now(), $stale]);
  $pdo->prepare("UPDATE gini_links SET status='pending', updated_at=? WHERE status='publishing' AND updated_at < ?")->execute([gini_now(), $stale]);
}

function gini_config(PDO $pdo, $key, $fallback = "") {
  $st = $pdo->prepare("SELECT value FROM gini_config WHERE key=?");
  $st->execute([$key]);
  $value = $st->fetchColumn();
  return $value === false ? $fallback : (string) $value;
}

function gini_config_set(PDO $pdo, $key, $value) {
  $pdo->prepare("INSERT INTO gini_config (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value")->execute([$key, (string) $value]);
}

function gini_key_bytes() {
  $env = getenv("GINI_SECRETS_KEY");
  if (is_string($env) && strlen($env) >= 16) return hash("sha256", $env, true);
  $path = gini_data_dir() . DIRECTORY_SEPARATOR . "gini.key";
  if (!is_file($path)) {
    if (!is_dir(gini_data_dir())) mkdir(gini_data_dir(), 0775, true);
    file_put_contents($path, random_bytes(32));
    @chmod($path, 0600);
  }
  $raw = file_get_contents($path);
  return strlen($raw) === 32 ? $raw : hash("sha256", $raw, true);
}

function gini_encrypt($plain) {
  $iv = random_bytes(12);
  $tag = "";
  $enc = openssl_encrypt((string) $plain, "aes-256-gcm", gini_key_bytes(), OPENSSL_RAW_DATA, $iv, $tag);
  if ($enc === false) throw new RuntimeException("تعذر حفظ مفاتيح جني");
  return base64_encode($iv . $tag . $enc);
}

function gini_decrypt($stored) {
  $raw = base64_decode((string) $stored, true);
  if ($raw === false || strlen($raw) < 28) throw new RuntimeException("تعذر قراءة مفاتيح جني المحفوظة");
  $plain = openssl_decrypt(substr($raw, 28), "aes-256-gcm", gini_key_bytes(), OPENSSL_RAW_DATA, substr($raw, 0, 12), substr($raw, 12, 16));
  if ($plain === false) throw new RuntimeException("تعذر قراءة مفاتيح جني المحفوظة");
  return $plain;
}

function gini_read_secrets() {
  $path = gini_data_dir() . DIRECTORY_SEPARATOR . "gini.secrets.json";
  if (!is_file($path)) return null;
  $parsed = json_decode((string) file_get_contents($path), true);
  if (!is_array($parsed)) return null;
  try {
    $clientId = gini_decrypt($parsed["clientId"] ?? "");
    $clientSecret = gini_decrypt($parsed["clientSecret"] ?? "");
  } catch (Throwable $e) {
    return null;
  }
  if ($clientId === "" || $clientSecret === "") return null;
  return ["clientId" => $clientId, "clientSecret" => $clientSecret];
}

function gini_write_secrets($clientId, $clientSecret) {
  $dir = gini_data_dir();
  if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
    throw new RuntimeException("مجلد حفظ المفاتيح غير قابل للإنشاء");
  }
  if (!is_writable($dir)) {
    throw new RuntimeException("مجلد حفظ المفاتيح غير قابل للكتابة");
  }
  $payload = json_encode([
    "v" => 1,
    "clientId" => gini_encrypt($clientId),
    "clientSecret" => gini_encrypt($clientSecret),
  ], JSON_UNESCAPED_SLASHES);
  if ($payload === false) throw new RuntimeException("تعذر تجهيز ملف المفاتيح");
  $path = $dir . DIRECTORY_SEPARATOR . "gini.secrets.json";
  if (file_put_contents($path, $payload, LOCK_EX) === false) {
    throw new RuntimeException("تعذر كتابة ملف مفاتيح الربط");
  }
  @chmod($path, 0600);
  $read = gini_read_secrets();
  if (!$read || $read["clientId"] !== $clientId || $read["clientSecret"] !== $clientSecret) {
    throw new RuntimeException("تعذر قراءة مفاتيح الربط بعد حفظها");
  }
}

function gini_credentials() {
  $envId = trim((string) getenv("GINI_CLIENT_ID"));
  $envSecret = trim((string) getenv("GINI_CLIENT_SECRET"));
  if ($envId !== "" && $envSecret !== "") return ["clientId" => $envId, "clientSecret" => $envSecret, "source" => "env"];
  $file = gini_read_secrets();
  if ($file) return $file + ["source" => "file"];
  return null;
}

function gini_mask($value) {
  $text = (string) $value;
  if ($text === "") return "";
  if (strlen($text) <= 4) return "••••";
  return substr($text, 0, 2) . "••••" . substr($text, -2);
}

function gini_scrub($message) {
  $text = trim(preg_replace('/\s+/', ' ', (string) $message));
  $creds = gini_credentials();
  if ($creds) {
    $text = str_replace($creds["clientSecret"], "•••", $text);
    $text = str_replace($creds["clientId"], gini_mask($creds["clientId"]), $text);
  }
  return function_exists("mb_substr") ? mb_substr($text, 0, 400) : substr($text, 0, 400);
}

function gini_sign($method, $path, $body, $timestamp, $secret) {
  return hash_hmac("sha256", $method . $path . $body . $timestamp, $secret);
}

function gini_explain($status, $text, $headers) {
  $trimmed = trim((string) $text);
  if ($trimmed === "" || str_starts_with($trimmed, "<") || stripos($trimmed, "cloudfront") !== false || stripos($trimmed, "request blocked") !== false) {
    $id = $headers["x-amz-cf-id"] ?? "";
    return gini_scrub("جدار GINI حجب الطلب قبل وصوله إلى واجهة API. أرسل لدعم جني عنوان IP هذا السيرفر" . ($id ? " ومعرّف الطلب " . substr($id, 0, 80) : ""));
  }
  $data = json_decode($trimmed, true);
  $base = is_array($data) ? ($data["error"] ?? $data["message"] ?? "استجابة غير متوقعة من جني ($status)") : "استجابة غير متوقعة من جني ($status)";
  $hint = is_array($data["diagnostics"]["hints"] ?? null) ? ($data["diagnostics"]["hints"][0] ?? "") : "";
  return gini_scrub($hint ? "$base: $hint" : $base);
}

function gini_retryable($status, $message) {
  if (in_array($status, [409, 429, 502, 503, 504], true)) return true;
  if ($status === 401 && preg_match('/expired|clock/i', $message)) return true;
  if ($status === 0) return true;
  return false;
}

function gini_request($method, $path, $json = null, $fields = null, $idempotencyKey = null) {
  if (!function_exists("curl_init")) throw new RuntimeException("امتداد cURL غير مفعّل على الاستضافة");
  $creds = gini_credentials();
  if (!$creds) {
    $error = new RuntimeException("مفاتيح أسواق جني غير مضبوطة على السيرفر");
    $error->status = 0;
    $error->permanent = true;
    throw $error;
  }
  $timestamp = (string) time();
  $raw = $json === null ? "" : json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $signature = gini_sign($method, $path, $fields ? "" : $raw, $timestamp, $creds["clientSecret"]);
  $headers = [
    "X-API-KEY: " . $creds["clientId"],
    "X-TIMESTAMP: " . $timestamp,
    "X-SIGNATURE: " . $signature,
    "User-Agent: " . GINI_USER_AGENT,
    "Accept: application/json",
  ];
  if ($idempotencyKey) $headers[] = "Idempotency-Key: " . $idempotencyKey;
  if (!$fields && $json !== null) $headers[] = "Content-Type: application/json";
  $ch = curl_init(GINI_ORIGIN . $path);
  $options = [
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HEADER => true,
    CURLOPT_TIMEOUT => 20,
    CURLOPT_FOLLOWLOCATION => false,
  ];
  if ($method !== "GET" && $method !== "DELETE") $options[CURLOPT_POSTFIELDS] = $fields ?: $raw;
  curl_setopt_array($ch, $options);
  $rawResponse = curl_exec($ch);
  if ($rawResponse === false) {
    $error = new RuntimeException(gini_scrub("تعذر الاتصال بخادم جني"));
    $error->status = 0;
    curl_close($ch);
    throw $error;
  }
  $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
  curl_close($ch);
  $headerText = substr($rawResponse, 0, $headerSize);
  $body = substr($rawResponse, $headerSize);
  $responseHeaders = [];
  foreach (explode("\n", $headerText) as $line) {
    $parts = explode(":", $line, 2);
    if (count($parts) === 2) $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
  }
  if ($status >= 300 && $status < 400) {
    $error = new RuntimeException("جني أعاد تحويلاً غير متوقع");
    $error->status = $status;
    $error->permanent = true;
    throw $error;
  }
  if ($status < 200 || $status >= 300) {
    $message = gini_explain($status, $body, $responseHeaders);
    $error = new RuntimeException($message);
    $error->status = $status;
    $error->permanent = !gini_retryable($status, $message);
    $error->retryAfter = (int) ($responseHeaders["retry-after"] ?? 0);
    throw $error;
  }
  if (trim($body) === "") return ["status" => $status, "data" => null];
  $data = json_decode($body, true);
  if (!is_array($data)) {
    $error = new RuntimeException("جني أعاد استجابة ليست JSON");
    $error->status = $status;
    $error->permanent = true;
    throw $error;
  }
  return ["status" => $status, "data" => $data];
}

function gini_log(PDO $pdo, $localId, $action, $ok, $message) {
  $pdo->prepare("INSERT INTO gini_log (created_at,local_id,action,ok,message) VALUES (?,?,?,?,?)")->execute([
    gini_now(), $localId ?: null, $action, $ok ? 1 : 0, gini_scrub($message),
  ]);
  $pdo->exec("DELETE FROM gini_log WHERE id NOT IN (SELECT id FROM gini_log ORDER BY id DESC LIMIT 200)");
}

function gini_link(PDO $pdo, $localId) {
  $st = $pdo->prepare("SELECT * FROM gini_links WHERE local_id=?");
  $st->execute([$localId]);
  $row = $st->fetch();
  return $row ?: null;
}

function gini_linked($link) {
  return $link && (!empty($link["gini_id"]) || ($link["status"] ?? "") === "published");
}

function gini_auto(PDO $pdo) {
  return gini_config($pdo, "auto_sync", "0") === "1";
}

function gini_sku($localId) {
  $clean = preg_replace('/[^A-Za-z0-9-]/', '', str_replace(' ', '-', trim((string) $localId)));
  $sku = preg_match('/^bl-/i', $clean) ? $clean : "BL-" . ($clean !== "" ? $clean : "item");
  return substr($sku, 0, 64);
}

function gini_remember(PDO $pdo, $localId, array $fields) {
  $current = gini_link($pdo, $localId) ?: [];
  $next = [
    "gini_id" => array_key_exists("gini_id", $fields) ? $fields["gini_id"] : ($current["gini_id"] ?? null),
    "gini_sku" => $fields["gini_sku"] ?? ($current["gini_sku"] ?? gini_sku($localId)),
    "idempotency_key" => $fields["idempotency_key"] ?? ($current["idempotency_key"] ?? bin2hex(random_bytes(16))),
    "status" => $fields["status"] ?? ($current["status"] ?? "pending"),
    "last_error" => array_key_exists("last_error", $fields) ? $fields["last_error"] : ($current["last_error"] ?? ""),
    "image_hash" => array_key_exists("image_hash", $fields) ? $fields["image_hash"] : ($current["image_hash"] ?? ""),
    "published_at" => array_key_exists("published_at", $fields) ? $fields["published_at"] : ($current["published_at"] ?? null),
  ];
  $pdo->prepare("INSERT INTO gini_links (local_id,gini_id,gini_sku,idempotency_key,status,last_error,image_hash,updated_at,published_at)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(local_id) DO UPDATE SET gini_id=excluded.gini_id, gini_sku=excluded.gini_sku, idempotency_key=excluded.idempotency_key,
      status=excluded.status, last_error=excluded.last_error, image_hash=excluded.image_hash, updated_at=excluded.updated_at, published_at=excluded.published_at")
    ->execute([$localId, $next["gini_id"], $next["gini_sku"], $next["idempotency_key"], $next["status"], $next["last_error"], $next["image_hash"], gini_now(), $next["published_at"]]);
}

function gini_words($text, $max) {
  $parts = preg_split('/\s+/', trim((string) $text)) ?: [];
  $parts = array_values(array_filter($parts, fn($part) => $part !== ""));
  return implode(" ", array_slice($parts, 0, $max));
}

function gini_condition_label($value) {
  if ($value === "refurbished") return "مجدد";
  if ($value === "open-box") return "مفتوح";
  if ($value === "used") return "مستعمل";
  return "جديد";
}

function gini_description($product) {
  $lines = array_filter([
    $product["headline"] ?? "",
    $product["blurb"] ?? "",
    $product["specs"] ?? "",
    !empty($product["cpu"]) ? "المعالج: " . $product["cpu"] : "",
    !empty($product["gpu"]) ? "كرت الشاشة: " . $product["gpu"] : "",
    !empty($product["ram"]) ? "الذاكرة: " . $product["ram"] : "",
    !empty($product["storage"]) ? "التخزين: " . $product["storage"] : "",
    !empty($product["screen"]) ? "الشاشة: " . $product["screen"] : "",
  ]);
  $text = gini_words($lines ? implode("\n", $lines) : ($product["name"] ?? "لابتوب"), 1000);
  return function_exists("mb_substr") ? mb_substr($text, 0, 8000) : substr($text, 0, 8000);
}

function gini_options($product) {
  $pairs = [
    ["المعالج", $product["cpu"] ?? ""],
    ["كرت الشاشة", $product["gpu"] ?? ""],
    ["قدرة الكرت", $product["tgp"] ?? ""],
    ["التبريد", $product["cooling"] ?? ""],
    ["الذاكرة", $product["ram"] ?? ""],
    ["التخزين", $product["storage"] ?? ""],
    ["الشاشة", $product["screen"] ?? ""],
    ["الحالة", gini_condition_label($product["condition"] ?? "new")],
  ];
  $out = [];
  foreach ($pairs as $pair) {
    if (trim((string) $pair[1]) === "") continue;
    $out[] = ["key" => gini_cut($pair[0], 255), "value" => gini_cut(trim((string) $pair[1]), 255)];
    if (count($out) === 20) break;
  }
  return $out;
}

function gini_tags($product) {
  $parts = array_filter(array_map("trim", [
    (string) ($product["brand"] ?? ""),
    (string) ($product["category"] ?? ""),
    (string) ($product["tag"] ?? ""),
    gini_condition_label($product["condition"] ?? "new"),
  ]));
  return substr(implode(",", $parts), 0, 500);
}

function gini_resolve_image($src) {
  $raw = trim((string) $src);
  if ($raw === "" || str_starts_with($raw, "data:")) return null;
  if (preg_match('#^https?://#i', $raw)) return ["remote" => $raw];
  $rel = str_replace(["/", "\\"], DIRECTORY_SEPARATOR, ltrim(rawurldecode($raw), "/"));
  $root = dirname(__DIR__);
  $abs = $root . DIRECTORY_SEPARATOR . $rel;
  $realRoot = realpath($root);
  $real = realpath($abs);
  if (!$realRoot || !$real || !str_starts_with($real, $realRoot) || !is_file($real)) {
    $error = new RuntimeException("ملف الصورة غير موجود على السيرفر");
    $error->permanent = true;
    throw $error;
  }
  return ["file" => $real];
}

function gini_load_images($product) {
  $list = !empty($product["images"]) && is_array($product["images"]) ? $product["images"] : (!empty($product["image"]) ? [$product["image"]] : []);
  $files = [];
  $temps = [];
  foreach ($list as $src) {
    if (count($files) >= 10) break;
    $item = gini_resolve_image($src);
    if (!$item) continue;
    if (!empty($item["file"])) {
      $size = filesize($item["file"]);
      if ($size > 5 * 1024 * 1024) {
        $error = new RuntimeException("إحدى الصور أكبر من 5MB والحد في جني هو 5MB");
        $error->permanent = true;
        throw $error;
      }
      $mime = mime_content_type($item["file"]) ?: "image/jpeg";
      $files[] = ["path" => $item["file"], "mime" => $mime, "name" => basename($item["file"]), "signature" => $item["file"] . ":" . $size . ":" . filemtime($item["file"]), "temp" => false];
    } else {
      $binary = file_get_contents($item["remote"]);
      if ($binary === false) {
        $error = new RuntimeException("تعذر تنزيل صورة المنتج لرفعها إلى جني");
        $error->permanent = true;
        throw $error;
      }
      if (strlen($binary) > 5 * 1024 * 1024) {
        $error = new RuntimeException("إحدى الصور أكبر من 5MB والحد في جني هو 5MB");
        $error->permanent = true;
        throw $error;
      }
      $tmp = tempnam(sys_get_temp_dir(), "gini");
      file_put_contents($tmp, $binary);
      $temps[] = $tmp;
      $files[] = ["path" => $tmp, "mime" => "image/jpeg", "name" => "image.jpg", "signature" => $item["remote"], "temp" => true];
    }
  }
  return [$files, $temps];
}

function gini_cleanup_temps($files) {
  foreach ($files as $file) {
    if (!empty($file["temp"]) && is_file($file["path"])) @unlink($file["path"]);
  }
}

function gini_sale_price($product) {
  $raw = $product["giniPrice"] ?? null;
  if ($raw === null || $raw === "") return null;
  if (!is_numeric($raw)) return null;
  $price = (int) round((float) $raw);
  return $price < 0 ? null : $price;
}

function gini_payload(PDO $pdo, $product, $map) {
  $installments = gini_config($pdo, "is_installments", "0") === "1";
  $months = (int) gini_config($pdo, "months", "0");
  $body = [
    "name" => gini_cut($product["name"] ?? "منتج", 255),
    "description" => gini_description($product),
    "price" => gini_sale_price($product),
    "quantity" => max(0, (int) round((float) ($product["stock"] ?? 0))),
    "security_stock" => max(0, (int) gini_config($pdo, "security_stock", "1")),
    "category_id" => (int) $map["gini_category_id"],
    "subcategory_id" => (int) $map["gini_subcategory_id"],
    "is_visible" => ((int) ($product["stock"] ?? 0)) > 0 ? 1 : 0,
    "is_installments" => $installments ? 1 : 0,
    "is_gini_partner" => gini_config($pdo, "is_gini_partner", "0") === "1",
    "sku" => gini_sku($product["id"]),
    "tags" => gini_tags($product),
    "options" => gini_options($product),
    "is_used" => ($product["condition"] ?? "") === "used",
  ];
  if ($installments && $months >= 1 && $months <= 10) $body["months"] = $months;
  return $body;
}

function gini_form_fields($body, $files, $deleteImages = []) {
  $fields = [];
  foreach ($body as $key => $value) {
    if ($key === "options" || $value === null) continue;
    if (is_bool($value)) $fields[$key] = $value ? "1" : "0";
    else $fields[$key] = (string) $value;
  }
  foreach ($body["options"] as $index => $option) {
    $fields["options[$index][key]"] = $option["key"];
    $fields["options[$index][value]"] = $option["value"];
  }
  foreach ($files as $index => $file) {
    $fields["images[$index]"] = new CURLFile($file["path"], $file["mime"], $file["name"]);
  }
  foreach (array_values($deleteImages) as $index => $url) $fields["delete_images[$index]"] = (string) $url;
  return $fields;
}

function gini_cut($text, $len) {
  $text = (string) $text;
  if (function_exists("mb_substr")) return mb_substr($text, 0, $len);
  return substr($text, 0, $len);
}

function gini_remote_row($data) {
  $row = null;
  if (is_array($data["data"] ?? null)) {
    $keys = array_keys($data["data"]);
    $isList = $keys === [] || $keys === range(0, count($keys) - 1);
    if (!$isList) $row = $data["data"];
  }
  return is_array($row) && (!empty($row["id"]) || !empty($row["sku"])) ? $row : null;
}

function gini_find_remote($sku) {
  try {
    $result = gini_request("GET", "/api/v2.0/third-party/products/" . $sku);
    return gini_remote_row($result["data"]);
  } catch (Throwable $error) {
    if (($error->status ?? 0) === 404) return null;
    throw $error;
  }
}

function gini_sync(PDO $pdo, $localId, $action) {
  $product = get_product($pdo, $localId);
  if (!$product) {
    $pdo->prepare("UPDATE gini_jobs SET status='done', updated_at=?, last_error=? WHERE local_id=? AND status IN ('queued','retry','running')")->execute([
      gini_now(), "المنتج لم يعد موجوداً محلياً", $localId,
    ]);
    gini_log($pdo, $localId, $action, false, "تم تخطي منتج محذوف محلياً دون حذفه من جني");
    return ["ok" => false, "message" => "المنتج غير موجود محلياً"];
  }
  if (gini_sale_price($product) === null) {
    $message = "يرجى تحديد سعر أسواق جني قبل النشر";
    gini_remember($pdo, $localId, ["status" => "failed", "last_error" => $message, "gini_sku" => gini_sku($localId)]);
    gini_log($pdo, $localId, $action, false, $message);
    return ["ok" => false, "message" => $message, "permanent" => true];
  }
  $st = $pdo->prepare("SELECT * FROM gini_category_map WHERE local_category_id=?");
  $st->execute([$product["category"] ?? ""]);
  $map = $st->fetch();
  if (!$map) {
    $message = "تصنيف المنتج غير مربوط بتصنيف جني وتصنيفه الفرعي";
    gini_remember($pdo, $localId, ["status" => "failed", "last_error" => $message, "gini_sku" => gini_sku($localId)]);
    gini_log($pdo, $localId, $action, false, $message);
    return ["ok" => false, "message" => $message, "permanent" => true];
  }
  $sku = gini_sku($product["id"]);
  $link = gini_link($pdo, $localId);
  if (empty($link["idempotency_key"])) {
    gini_remember($pdo, $localId, ["status" => "pending", "gini_sku" => $sku, "idempotency_key" => bin2hex(random_bytes(16)), "last_error" => ""]);
    $link = gini_link($pdo, $localId);
  }
  gini_remember($pdo, $localId, ["status" => "publishing", "gini_sku" => $sku]);
  [$files] = gini_load_images($product);
  if (!$files) {
    $message = "جني يطلب صورة واحدة على الأقل، ولا توجد صورة قابلة للرفع";
    gini_remember($pdo, $localId, ["status" => "failed", "last_error" => $message]);
    gini_log($pdo, $localId, $action, false, $message);
    return ["ok" => false, "message" => $message, "permanent" => true];
  }
  $hash = hash("sha256", implode("|", array_column($files, "signature")));
  $body = gini_payload($pdo, $product, $map);
  try {
    if ($action === "stock" && gini_linked(gini_link($pdo, $localId))) {
      $result = gini_request("PATCH", "/api/v2.0/third-party/products/$sku/stock", ["price" => $body["price"], "quantity" => $body["quantity"]]);
      $remote = gini_remote_row($result["data"]);
      gini_remember($pdo, $localId, [
        "status" => "published",
        "gini_id" => !empty($remote["id"]) ? (string) $remote["id"] : ($link["gini_id"] ?? ""),
        "gini_sku" => $remote["sku"] ?? $sku,
        "last_error" => "",
        "published_at" => $link["published_at"] ?? gini_now(),
      ]);
      gini_log($pdo, $localId, "stock", true, "تم تحديث السعر والمخزون في جني");
      gini_cleanup_temps($files);
      return ["ok" => true, "message" => "تم تحديث المخزون"];
    }
    $remote = gini_find_remote($sku);
    if (!$remote) {
      $current = gini_link($pdo, $localId);
      if (!empty($current["gini_id"]) || ($current["status"] ?? "") === "published") {
        gini_remember($pdo, $localId, ["idempotency_key" => bin2hex(random_bytes(16)), "status" => "publishing"]);
        $current = gini_link($pdo, $localId);
      }
      $created = gini_request("POST", "/api/v2.0/third-party/products", null, gini_form_fields($body, $files), $current["idempotency_key"]);
      $row = gini_remote_row($created["data"]);
      gini_remember($pdo, $localId, [
        "status" => "published",
        "gini_id" => !empty($row["id"]) ? (string) $row["id"] : "",
        "gini_sku" => $row["sku"] ?? $sku,
        "last_error" => "",
        "image_hash" => $hash,
        "published_at" => gini_now(),
      ]);
      gini_log($pdo, $localId, "create", true, "تم إنشاء المنتج في جني");
      gini_cleanup_temps($files);
      return ["ok" => true, "message" => "تم نشر المنتج"];
    }
    $linked = gini_link($pdo, $localId);
    if (($linked["image_hash"] ?? "") !== $hash) {
      $fields = gini_form_fields($body, $files, is_array($remote["images"] ?? null) ? $remote["images"] : []);
      $fields["_method"] = "PUT";
      $updated = gini_request("POST", "/api/v2.0/third-party/products/$sku", null, $fields);
      $row = gini_remote_row($updated["data"]) ?: $remote;
      gini_remember($pdo, $localId, [
        "status" => "published",
        "gini_id" => !empty($row["id"]) ? (string) $row["id"] : (string) ($remote["id"] ?? ""),
        "gini_sku" => $row["sku"] ?? $sku,
        "last_error" => "",
        "image_hash" => $hash,
        "published_at" => $linked["published_at"] ?? gini_now(),
      ]);
      gini_log($pdo, $localId, "update", true, "تم تحديث المنتج وصوره في جني");
      gini_cleanup_temps($files);
      return ["ok" => true, "message" => "تم تحديث المنتج"];
    }
    $json = $body;
    unset($json["sku"]);
    $updated = gini_request("PUT", "/api/v2.0/third-party/products/$sku", $json);
    $row = gini_remote_row($updated["data"]) ?: $remote;
    gini_remember($pdo, $localId, [
      "status" => "published",
      "gini_id" => !empty($row["id"]) ? (string) $row["id"] : (string) ($remote["id"] ?? ""),
      "gini_sku" => $row["sku"] ?? $sku,
      "last_error" => "",
      "image_hash" => $hash,
      "published_at" => $linked["published_at"] ?? gini_now(),
    ]);
    gini_log($pdo, $localId, "update", true, "تم تحديث بيانات المنتج في جني");
    gini_cleanup_temps($files);
    return ["ok" => true, "message" => "تم تحديث المنتج"];
  } catch (Throwable $error) {
    gini_cleanup_temps($files);
    $message = gini_scrub($error->getMessage());
    $permanent = !empty($error->permanent);
    gini_remember($pdo, $localId, ["status" => $permanent ? "failed" : "pending", "last_error" => $message, "gini_sku" => $sku]);
    gini_log($pdo, $localId, $action, false, $message);
    $error->permanent = $permanent;
    throw $error;
  }
}

function gini_enqueue(PDO $pdo, $localId, $action) {
  gini_ensure($pdo);
  $st = $pdo->prepare("SELECT * FROM gini_jobs WHERE local_id=? AND status IN ('queued','retry','running') ORDER BY id DESC LIMIT 1");
  $st->execute([$localId]);
  $existing = $st->fetch();
  $stamp = gini_now();
  if ($existing) {
    if ($action === "upsert" && $existing["action"] !== "upsert" && $existing["status"] !== "running") {
      $pdo->prepare("UPDATE gini_jobs SET action='upsert', updated_at=? WHERE id=?")->execute([$stamp, $existing["id"]]);
    }
    return (int) $existing["id"];
  }
  $pdo->prepare("INSERT INTO gini_jobs (local_id,action,status,attempts,next_attempt_at,created_at,updated_at) VALUES (?,?,'queued',0,?,?,?)")
    ->execute([$localId, $action, $stamp, $stamp, $stamp]);
  return (int) $pdo->lastInsertId();
}

function gini_remaining(PDO $pdo) {
  return (int) $pdo->query("SELECT COUNT(*) FROM gini_jobs WHERE status IN ('queued','retry','running')")->fetchColumn();
}

function gini_process(PDO $pdo, $limit = 1, $prefer = null) {
  gini_ensure($pdo);
  $processed = 0;
  $results = [];
  while ($processed < $limit) {
    if ($prefer) {
      $st = $pdo->prepare("SELECT * FROM gini_jobs WHERE local_id=? AND status IN ('queued','retry') ORDER BY id DESC LIMIT 1");
      $st->execute([$prefer]);
      $prefer = null;
    } else {
      $st = $pdo->prepare("SELECT * FROM gini_jobs WHERE status IN ('queued','retry') AND (next_attempt_at IS NULL OR next_attempt_at <= ?) ORDER BY id ASC LIMIT 1");
      $st->execute([gini_now()]);
    }
    $job = $st->fetch();
    if (!$job) break;
    $pdo->prepare("UPDATE gini_jobs SET status='running', updated_at=? WHERE id=?")->execute([gini_now(), $job["id"]]);
    try {
      $result = gini_sync($pdo, $job["local_id"], $job["action"]);
      $pdo->prepare("UPDATE gini_jobs SET status='done', updated_at=?, last_error='' WHERE id=?")->execute([gini_now(), $job["id"]]);
      $results[] = ["id" => $job["local_id"], "ok" => !empty($result["ok"]), "message" => $result["message"] ?? ""];
    } catch (Throwable $error) {
      $attempts = (int) $job["attempts"] + 1;
      $permanent = !empty($error->permanent) || $attempts >= GINI_MAX_ATTEMPTS;
      $wait = !empty($error->retryAfter) ? (int) $error->retryAfter : [15, 60, 180, 600][min($attempts - 1, 3)];
      if ($permanent) {
        $pdo->prepare("UPDATE gini_jobs SET status='failed', attempts=?, last_error=?, updated_at=? WHERE id=?")->execute([$attempts, gini_scrub($error->getMessage()), gini_now(), $job["id"]]);
        gini_remember($pdo, $job["local_id"], ["status" => "failed", "last_error" => gini_scrub($error->getMessage())]);
      } else {
        $pdo->prepare("UPDATE gini_jobs SET status='retry', attempts=?, next_attempt_at=?, last_error=?, updated_at=? WHERE id=?")->execute([
          $attempts, gmdate("c", time() + $wait), gini_scrub($error->getMessage()), gini_now(), $job["id"],
        ]);
      }
      $results[] = ["id" => $job["local_id"], "ok" => false, "message" => gini_scrub($error->getMessage())];
    }
    $processed++;
  }
  return ["processed" => $processed, "remaining" => gini_remaining($pdo), "results" => $results];
}

function gini_note_product_saved(PDO $pdo, $localId) {
  try {
    gini_ensure($pdo);
    $link = gini_link($pdo, $localId);
    if (!gini_linked($link) && !gini_auto($pdo)) return;
    gini_enqueue($pdo, $localId, "upsert");
    gini_process($pdo, 1);
  } catch (Throwable $e) {
    gini_log($pdo, $localId, "upsert", false, $e->getMessage());
  }
}

function gini_note_stock(PDO $pdo, array $ids) {
  try {
    gini_ensure($pdo);
    $any = false;
    foreach ($ids as $id) {
      if (!$id || !gini_linked(gini_link($pdo, $id))) continue;
      gini_enqueue($pdo, $id, "stock");
      $any = true;
    }
    if ($any) gini_process($pdo, 1);
  } catch (Throwable $e) {
    gini_log($pdo, null, "stock", false, $e->getMessage());
  }
}

function gini_test(PDO $pdo) {
  gini_ensure($pdo);
  if (!gini_credentials()) {
    $message = "لم يُحفظ Client ID وClient Secret بعد";
    gini_config_set($pdo, "last_ping_ok", "0");
    gini_config_set($pdo, "last_ping_at", gini_now());
    gini_config_set($pdo, "last_ping_message", $message);
    return ["ok" => false, "configured" => false, "message" => $message];
  }
  try {
    $result = gini_request("GET", "/api/v2.0/third-party/ping");
    $merchant = (string) ($result["data"]["data"]["merchant"]["business_name"] ?? "");
    $message = $merchant !== "" ? "تم الاتصال بحساب $merchant" : "تم الاتصال بنجاح";
    gini_config_set($pdo, "last_ping_ok", "1");
    gini_config_set($pdo, "last_ping_at", gini_now());
    gini_config_set($pdo, "last_ping_message", gini_scrub($message));
    gini_log($pdo, null, "ping", true, $message);
    return ["ok" => true, "configured" => true, "merchant" => gini_scrub($merchant), "message" => gini_scrub($message)];
  } catch (Throwable $error) {
    $message = gini_scrub($error->getMessage());
    gini_config_set($pdo, "last_ping_ok", "0");
    gini_config_set($pdo, "last_ping_at", gini_now());
    gini_config_set($pdo, "last_ping_message", $message);
    gini_log($pdo, null, "ping", false, $message);
    return ["ok" => false, "configured" => true, "message" => $message];
  }
}

function gini_categories() {
  $result = gini_request("GET", "/api/v2.0/third-party/categories");
  $rows = is_array($result["data"]["data"] ?? null) ? $result["data"]["data"] : [];
  $out = [];
  foreach ($rows as $row) {
    $subs = [];
    foreach ($row["subcategories"] ?? [] as $sub) {
      $subs[] = ["id" => (int) ($sub["id"] ?? 0), "name" => (string) ($sub["name"] ?? ""), "slug" => (string) ($sub["slug"] ?? "")];
    }
    $out[] = ["id" => (int) ($row["id"] ?? 0), "name" => (string) ($row["name"] ?? ""), "slug" => (string) ($row["slug"] ?? ""), "subcategories" => $subs];
  }
  return $out;
}

function gini_save_settings(PDO $pdo, array $input) {
  gini_ensure($pdo);
  $creds = gini_credentials();
  $incomingId = trim((string) ($input["clientId"] ?? ""));
  $incomingSecret = trim((string) ($input["clientSecret"] ?? ""));
  $message = "";
  if (($creds["source"] ?? "") === "env" && ($incomingId !== "" || $incomingSecret !== "")) {
    $message = "المفاتيح مضبوطة من بيئة السيرفر ولن تُستبدل من اللوحة";
  } elseif ($incomingId !== "" || $incomingSecret !== "") {
    $current = gini_read_secrets();
    $clientId = $incomingId !== "" ? $incomingId : ($current["clientId"] ?? "");
    $clientSecret = $incomingSecret !== "" ? $incomingSecret : ($current["clientSecret"] ?? "");
    if ($clientId === "" || $clientSecret === "") json_out(400, ["error" => "أدخل Client ID وClient Secret معاً عند الحفظ الأول"]);
    if (strlen($clientId) > 300 || strlen($clientSecret) > 500) json_out(400, ["error" => "قيمة المفتاح أطول من المتوقع"]);
    try {
      gini_write_secrets($clientId, $clientSecret);
    } catch (Throwable $error) {
      json_out(500, ["error" => "تعذر حفظ مفاتيح الربط"]);
    }
    $message = "تم حفظ بيانات الربط";
  }
  if (array_key_exists("autoSync", $input)) gini_config_set($pdo, "auto_sync", !empty($input["autoSync"]) ? "1" : "0");
  if (isset($input["securityStock"]) && $input["securityStock"] !== "") gini_config_set($pdo, "security_stock", (string) max(0, (int) $input["securityStock"]));
  if (array_key_exists("isInstallments", $input)) gini_config_set($pdo, "is_installments", !empty($input["isInstallments"]) ? "1" : "0");
  if (isset($input["months"]) && $input["months"] !== "") gini_config_set($pdo, "months", (string) max(0, min(10, (int) $input["months"])));
  if (array_key_exists("isGiniPartner", $input)) gini_config_set($pdo, "is_gini_partner", !empty($input["isGiniPartner"]) ? "1" : "0");
  $stored = gini_credentials();
  $savedKeys = is_array($stored) && ($stored["clientId"] ?? "") !== "" && ($stored["clientSecret"] ?? "") !== "";
  if (($incomingId !== "" || $incomingSecret !== "") && !$savedKeys) {
    json_out(500, ["error" => "تعذر حفظ مفاتيح الربط"]);
  }
  return [
    "ok" => true,
    "saved" => $savedKeys,
    "configured" => $savedKeys,
    "message" => $savedKeys ? "تم حفظ بيانات الربط" : ($message !== "" ? $message : "تم حفظ الإعدادات"),
  ];
}

function gini_save_maps(PDO $pdo, $maps) {
  gini_ensure($pdo);
  $stamp = gini_now();
  $keep = [];
  $st = $pdo->prepare("INSERT INTO gini_category_map (local_category_id,gini_category_id,gini_subcategory_id,updated_at) VALUES (?,?,?,?)
    ON CONFLICT(local_category_id) DO UPDATE SET gini_category_id=excluded.gini_category_id, gini_subcategory_id=excluded.gini_subcategory_id, updated_at=excluded.updated_at");
  foreach (is_array($maps) ? $maps : [] as $row) {
    $localId = trim((string) ($row["localCategoryId"] ?? ""));
    $categoryId = (int) ($row["giniCategoryId"] ?? 0);
    $subcategoryId = (int) ($row["giniSubcategoryId"] ?? 0);
    if ($localId === "" || !$categoryId || !$subcategoryId) continue;
    $st->execute([$localId, $categoryId, $subcategoryId, $stamp]);
    $keep[] = $localId;
  }
  if ($keep) {
    $marks = implode(",", array_fill(0, count($keep), "?"));
    $pdo->prepare("DELETE FROM gini_category_map WHERE local_category_id NOT IN ($marks)")->execute($keep);
  } else {
    $pdo->exec("DELETE FROM gini_category_map");
  }
  return ["ok" => true];
}

function gini_overview(PDO $pdo) {
  gini_ensure($pdo);
  $creds = gini_credentials();
  $products = list_products($pdo);
  $links = $pdo->query("SELECT * FROM gini_links")->fetchAll();
  $byId = [];
  foreach ($links as $link) $byId[$link["local_id"]] = $link;
  $published = 0;
  $failed = 0;
  $waiting = 0;
  $failedRows = [];
  foreach ($products as $product) {
    $link = $byId[$product["id"]] ?? null;
    if ($link && $link["status"] === "published" && empty($link["last_error"])) {
      $published++;
      continue;
    }
    if ($link && ($link["status"] === "failed" || !empty($link["last_error"]))) {
      $failed++;
      $failedRows[] = [
        "localId" => $product["id"],
        "name" => $product["name"],
        "error" => $link["last_error"] ?: "فشلت المزامنة",
        "updatedAt" => $link["updated_at"] ?? "",
        "status" => $link["status"],
      ];
      continue;
    }
    $waiting++;
  }
  return [
    "connection" => [
      "configured" => (bool) $creds,
      "source" => $creds["source"] ?? null,
      "clientIdMasked" => $creds ? gini_mask($creds["clientId"]) : "",
      "lastOk" => gini_config($pdo, "last_ping_ok", "0") === "1",
      "lastAt" => gini_config($pdo, "last_ping_at", ""),
      "lastMessage" => gini_config($pdo, "last_ping_message", ""),
    ],
    "autoSync" => gini_auto($pdo),
    "securityStock" => (int) gini_config($pdo, "security_stock", "1"),
    "isInstallments" => gini_config($pdo, "is_installments", "0") === "1",
    "months" => (int) gini_config($pdo, "months", "0"),
    "isGiniPartner" => gini_config($pdo, "is_gini_partner", "0") === "1",
    "counts" => ["published" => $published, "waiting" => $waiting, "failed" => $failed, "queued" => gini_remaining($pdo)],
    "failed" => $failedRows,
    "log" => $pdo->query("SELECT id,created_at,local_id,action,ok,message FROM gini_log ORDER BY id DESC LIMIT 30")->fetchAll(),
    "maps" => $pdo->query("SELECT local_category_id,gini_category_id,gini_subcategory_id FROM gini_category_map")->fetchAll(),
    "localCategories" => list_categories($pdo),
  ];
}

function gini_links(PDO $pdo) {
  gini_ensure($pdo);
  $rows = $pdo->query("SELECT local_id,gini_id,gini_sku,status,last_error,updated_at FROM gini_links")->fetchAll();
  $out = [];
  foreach ($rows as $row) {
    $out[] = [
      "localId" => $row["local_id"],
      "giniId" => $row["gini_id"] ?? "",
      "giniSku" => $row["gini_sku"] ?? "",
      "status" => $row["status"],
      "lastError" => $row["last_error"] ?? "",
      "updatedAt" => $row["updated_at"] ?? "",
    ];
  }
  return $out;
}

function gini_handle(PDO $pdo, $path, $method) {
  require_auth($pdo, ["admin"]);
  if ($path === "/admin/gini" && $method === "GET") json_out(200, gini_overview($pdo));
  if ($path === "/admin/gini/links" && $method === "GET") json_out(200, ["links" => gini_links($pdo)]);
  if ($path === "/admin/gini/settings" && ($method === "PUT" || $method === "POST")) json_out(200, gini_save_settings($pdo, read_json() ?: []));
  if ($path === "/admin/gini/test" && $method === "POST") json_out(200, gini_test($pdo));
  if ($path === "/admin/gini/categories" && $method === "GET") {
    try {
      json_out(200, ["categories" => gini_categories()]);
    } catch (Throwable $error) {
      json_out(400, ["error" => gini_scrub($error->getMessage())]);
    }
  }
  if ($path === "/admin/gini/category-map" && $method === "PUT") {
    $body = read_json() ?: [];
    json_out(200, gini_save_maps($pdo, $body["maps"] ?? []));
  }
  if ($path === "/admin/gini/publish" && $method === "POST") {
    $body = read_json() ?: [];
    $localId = (string) ($body["productId"] ?? "");
    if ($localId === "") json_out(400, ["error" => "productId required"]);
    gini_enqueue($pdo, $localId, "upsert");
    $job = $pdo->prepare("SELECT id FROM gini_jobs WHERE local_id=? AND status IN ('queued','retry') ORDER BY id DESC LIMIT 1");
    $job->execute([$localId]);
    $id = $job->fetchColumn();
    if ($id) $pdo->prepare("UPDATE gini_jobs SET next_attempt_at=?, updated_at=? WHERE id=?")->execute([gini_now(), gini_now(), $id]);
    $outcome = gini_process($pdo, 1, $localId);
    $link = gini_link($pdo, $localId);
    $result = $outcome["results"][0] ?? null;
    json_out(200, [
      "ok" => $link && $link["status"] === "published" && empty($link["last_error"]),
      "message" => $result["message"] ?? ($link["last_error"] ?? "أُضيف المنتج إلى طابور المزامنة"),
      "status" => $link["status"] ?? "pending",
      "remaining" => $outcome["remaining"],
    ]);
  }
  if ($path === "/admin/gini/sync-all" && $method === "POST") {
    foreach (list_products($pdo) as $product) gini_enqueue($pdo, $product["id"], "upsert");
    $outcome = gini_process($pdo, 1);
    $outcome["queued"] = count(list_products($pdo));
    json_out(200, $outcome);
  }
  if ($path === "/admin/gini/tick" && $method === "POST") json_out(200, gini_process($pdo, 1));
  json_out(404, ["error" => "API route not found", "path" => $path]);
}
