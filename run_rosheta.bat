@echo off
chcp 65001 > nul
title PenRx+ Application

cd /d "%~dp0"

echo =========================================================
echo       منظومة PenRx+ الطبية المتكاملة
echo =========================================================
echo.

echo  [1] فحص وإغلاق أي سيرفرات سابقة مفتوحة على البورت 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo  [2] فحص جاهزية السيرفر وفتح المتصفح تلقائياً...
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "$ready=$false; for($i=0; $i -lt 30; $i++) { Start-Sleep -s 1; try { $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 3000); if ($client.Connected) { $ready=$true; $client.Close(); break } } catch {} }; cmd /c start http://localhost:3000"

echo  [3] تشغيل السيرفر المحلي...
echo =========================================================
echo.

call npm run dev

pause
