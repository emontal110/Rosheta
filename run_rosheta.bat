@echo off
chcp 65001 > nul
title Rosheta Medical Prescription Application

REM Set working directory to batch script location
cd /d "%~dp0"

echo =========================================================
echo       نظام روشتة الطبية (Rosheta PWA)
echo =========================================================
echo.

echo  [1] فحص وإغلاق أي سيرفرات سابقة مفتوحة على البورت 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo  [2] فتح المتصفح تلقائياً على http://localhost:3000 ...
start http://localhost:3000

echo  [3] تشغيل السيرفر المحتفظ بالكاش للبدء السريع...
echo =========================================================
echo.

call npm run dev

pause
