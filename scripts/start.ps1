param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$localUrl = 'http://127.0.0.1:4318'
$runtimeDirectory = Join-Path $projectRoot 'local-data'
try {
    $health = Invoke-RestMethod -Uri "$localUrl/api/health" -TimeoutSec 2
    if ($health.app -eq 'kuz-pscv') {
        if (-not $NoBrowser) { Start-Process $localUrl }
        Write-Host "Kuz PSCV is already running: $localUrl"
        exit 0
    }
} catch { }
try {
    $nodeCommand = Get-Command node -ErrorAction Stop
    $nodeMajor = [int]((& $nodeCommand.Source --version).TrimStart('v').Split('.')[0])
    if ($nodeMajor -lt 22) { throw 'Node.js 22 or newer is required.' }
    New-Item -ItemType Directory -Path $runtimeDirectory -Force | Out-Null
    $serverPath = Join-Path $projectRoot 'backend\server.mjs'
    $env:PORT = '4318'
    $child = Start-Process -FilePath $nodeCommand.Source -ArgumentList @('"' + $serverPath + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimeDirectory 'server.stdout.log') -RedirectStandardError (Join-Path $runtimeDirectory 'server.stderr.log') -PassThru
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        $child.Refresh()
        if ($child.HasExited) { throw 'The server exited. Read local-data/server.stderr.log; port 4318 may be occupied.' }
        try { $health = Invoke-RestMethod -Uri "$localUrl/api/health" -TimeoutSec 1; if ($health.app -eq 'kuz-pscv') { $ready = $true; break } } catch { }
    }
    if (-not $ready) { Stop-Process -Id $child.Id -ErrorAction SilentlyContinue; throw 'Server did not become ready. Read local-data/server.stderr.log.' }
    @{ pid = $child.Id; startedAt = $child.StartTime.ToUniversalTime().ToString('o'); server = $serverPath } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runtimeDirectory 'server-process.json') -Encoding UTF8
    if (-not $NoBrowser) { Start-Process $localUrl }
    Write-Host "Kuz PSCV started: $localUrl"
    Write-Host "Editor: $localUrl/admin"
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host 'Install Node.js 22+ from https://nodejs.org if node was not found.'
    exit 1
}
