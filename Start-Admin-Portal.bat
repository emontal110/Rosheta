@echo off
title Rosheta Admin Subscriptions Portal
color 0A

cd /d "%~dp0"

echo ========================================================
echo       Rosheta Admin Subscriptions Control Portal
echo ========================================================
echo.

echo [1/3] Closing stale server processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Opening Admin Login Portal in browser...
start "" powershell -Command "Start-Sleep -s 4; Start-Process 'http://localhost:3000/admin/login'"

echo [3/3] Starting Local Next.js Server...
echo ========================================================
echo.

call npm run dev

pause
