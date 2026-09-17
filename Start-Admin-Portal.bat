@echo off
chcp 65001 > nul
title Rosheta Admin Subscriptions Portal
color 0A

cd /d "%~dp0"

echo ========================================================
echo       Rosheta Admin Subscriptions Control Portal
echo ========================================================
echo.

echo [1/3] إغلاق جميع السيرفرات السابقة...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] بدء تشغيل السيرفر المحلي...
echo.

REM Launch browser in parallel after short delay for server initialization
start "" cmd /c "timeout /t 5 >nul && start "" http://localhost:3000/admin/login"

echo [3/3] جاري تشغيل سيرفر Next.js...
call npm run dev

pause
