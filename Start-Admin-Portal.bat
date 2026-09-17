@echo off
title Rosheta Admin Subscriptions Portal
color 0A

echo ========================================================
echo       Rosheta Admin Subscriptions Control Portal
echo ========================================================
echo.
echo [1/2] Opening Admin Subscriptions Portal in Default Browser...
echo URL: http://localhost:3000/admin/subscriptions
echo.

timeout /t 2 >nul
start "" "http://localhost:3000/admin/subscriptions"

echo [2/2] Starting Local Server...
echo.

call npm run dev

pause
