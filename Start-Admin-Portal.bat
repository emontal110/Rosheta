@echo off
chcp 65001 > nul
title Rosheta Admin Subscriptions Portal
color 0A

cd /d "%~dp0"

echo ========================================================
echo       Rosheta Admin Subscriptions Control Portal
echo ========================================================
echo.

echo [1/3] إغلاق جميع السيرفرات والعمليات المفتوحة سابقاً...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 >nul

echo [2/3] فتح بورتال لوحة التحكم في المتصفح...
echo URL: http://localhost:3000/admin/subscriptions
start "" "http://localhost:3000/admin/subscriptions"

echo.
echo [3/3] تشغيل سيرفر التفعيل والتحكم...
echo ========================================================
echo.

call npm run dev

pause
