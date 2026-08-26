<?php
return [
  "admin_user" => getenv("STORE_ADMIN_USER") ?: "admin",
  "admin_password" => getenv("STORE_ADMIN_PASSWORD") ?: "",
  "site_url" => rtrim(getenv("STORE_SITE_URL") ?: "https://way-company.com", "/"),
];
