$project = 'C:\max\biblioteca-hub-a3-2026.2'
$backend = Join-Path $project 'backend'
$frontend = Join-Path $project 'frontend'

Set-Location $project
docker compose up -d mysql | Out-Host

$mysqlReady = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
    $mysqlContainer = docker compose ps -q mysql
    $status = if ($mysqlContainer) { docker inspect -f '{{.State.Health.Status}}' $mysqlContainer 2>$null } else { '' }
    if ($status -eq 'healthy') { $mysqlReady = $true; break }
    Start-Sleep -Seconds 2
}

if (-not $mysqlReady) {
    Write-Host 'MySQL não ficou saudável. Verifique: docker compose logs mysql' -ForegroundColor Red
    exit 1
}

Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$backend'; dotnet run --project 'Biblioteca.Api/Biblioteca.Api.csproj' --urls http://localhost:5180"
Start-Process powershell -ArgumentList '-NoExit', '-Command', "Set-Location '$frontend'; npm run dev -- --host localhost"

Start-Sleep -Seconds 5
Start-Process 'http://localhost:5173'
Write-Host 'Biblioteca iniciada. Chrome será aberto em http://localhost:5173' -ForegroundColor Green
