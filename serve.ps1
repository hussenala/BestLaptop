$ErrorActionPreference = "Stop"
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$node = Join-Path $env:LOCALAPPDATA "Programs\cursor\resources\app\resources\helpers\node.exe"
if (-not (Test-Path $node)) {
  $node = "node"
}
Write-Output "Starting BEST LAPTOP API server on http://127.0.0.1:8765/"
& $node "$root\server\server.js"
