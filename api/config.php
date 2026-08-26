<?php
return [
  "admin_user" => getenv("STORE_ADMIN_USER") ?: "admin",
  "admin_password" => getenv("STORE_ADMIN_PASSWORD") ?: "",
];
