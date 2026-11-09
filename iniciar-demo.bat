@echo off
echo ============================================================
echo   Iniciando MypesOS en Modo Demo Directo (SIN DOCKER)
echo ============================================================
echo.

start "MypesOS Mock API (Puerto 4100)" cmd /k "node mock-server.mjs"
timeout /t 2 /nobreak >nul

echo.
echo Levantando el servidor Web (Puerto 3100)...
echo Cuando termine de compilar, abre en tu navegador:
echo.
echo    http://localhost:3100/demo
echo.
echo ============================================================

cd apps\web
call npx next dev -p 3100
