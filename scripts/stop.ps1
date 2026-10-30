$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$receipt = Join-Path $projectRoot 'local-data\server-process.json'
if (-not (Test-Path -LiteralPath $receipt)) { Write-Host 'No launcher process receipt. If started in a terminal, press Ctrl+C there.'; exit 0 }
$record = Get-Content -LiteralPath $receipt -Raw | ConvertFrom-Json
$target = Get-Process -Id $record.pid -ErrorAction SilentlyContinue
if (-not $target) { Write-Host 'Already stopped.'; exit 0 }
$identity = Get-CimInstance Win32_Process -Filter "ProcessId = $($record.pid)"
$expectedServer = Join-Path $projectRoot 'backend\server.mjs'
if ($target.ProcessName -ne 'node' -or $target.StartTime.ToUniversalTime().ToString('o') -ne $record.startedAt -or -not $identity.CommandLine.Contains($expectedServer)) { Write-Host 'Process identity differs. Refusing to stop an unrelated process.'; exit 1 }
Stop-Process -Id $target.Id
Remove-Item -LiteralPath $receipt
Write-Host 'Kuz PSCV stopped. Local content and uploaded files are preserved.'
