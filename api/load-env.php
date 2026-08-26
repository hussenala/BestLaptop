<?php
/** Load KEY=VALUE lines from .env into putenv (only if not already set). */
function load_env_file($path) {
  if (!is_file($path)) return;
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  if (!$lines) return;
  foreach ($lines as $line) {
    $line = trim($line);
    if ($line === "" || $line[0] === "#") continue;
    $eq = strpos($line, "=");
    if ($eq === false) continue;
    $key = trim(substr($line, 0, $eq));
    $val = trim(substr($line, $eq + 1));
    if ($val !== "" && (($val[0] === '"' && substr($val, -1) === '"') || ($val[0] === "'" && substr($val, -1) === "'"))) {
      $val = substr($val, 1, -1);
    }
    if ($key !== "" && getenv($key) === false) {
      putenv("$key=$val");
      $_ENV[$key] = $val;
    }
  }
}

load_env_file(dirname(__DIR__) . DIRECTORY_SEPARATOR . ".env");
load_env_file(__DIR__ . DIRECTORY_SEPARATOR . ".env");
