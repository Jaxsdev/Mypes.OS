Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Iniciando MypesOS en Modo Demo Directo (SIN DOCKER)" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "node mock-server.mjs"
Start-Sleep -Seconds 2

Write-Host "Levantando el servidor Web en http://localhost:3100..." -ForegroundColor Yellow
Write-Host "Abre en tu navegador directamente:" -ForegroundColor White
Write-Host "   http://localhost:3100/demo" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot\apps\web"
npx next dev -p 3100
