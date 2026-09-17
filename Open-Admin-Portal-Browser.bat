@echo off
chcp 65001 > nul
title Open Rosheta Admin Portal Browser
color 0B

cd /d "%~dp0"

echo [1/2] إغلاق أي سيرفرات قديمة على البورت 3000...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 1 >nul

echo [2/2] فتح بورتال التحكم في المتصفح وتأكيد التشغيل...
start "" "http://localhost:3000/admin/subscriptions"

call npm run dev

pause
