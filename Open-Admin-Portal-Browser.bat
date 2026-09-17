@echo off
chcp 65001 > nul
title Open Rosheta Admin Portal Browser
color 0B

cd /d "%~dp0"

echo [1/2] إغلاق أي سيرفرات قديمة...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/2] فتح بورتال تسجيل الدخول والتفعيل...
start "" cmd /c "timeout /t 5 >nul && start "" http://localhost:3000/admin/login"

call npm run dev

pause
