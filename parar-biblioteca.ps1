Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'Biblioteca.Api.csproj|npm run dev' } | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
}
Write-Host 'Processos da aplicação encerrados. O MySQL e o volume foram preservados.' -ForegroundColor Yellow
