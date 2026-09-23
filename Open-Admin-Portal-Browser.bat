@echo off
title PenRx+ Admin Portal
color 0A

cd /d "%~dp0"

echo ========================================================
echo        PenRx+ Admin Portal Control Center
echo ========================================================
echo.

echo [1/3] Closing existing node server processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/3] Launching background server checker...
start "" powershell -NoProfile -ExecutionPolicy Bypass -Command "$ready=$false; for($i=0; $i -lt 30; $i++) { Start-Sleep -s 1; try { $client = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 3000); if ($client.Connected) { $ready=$true; $client.Close(); break } } catch {} }; cmd /c start http://localhost:3000/admin/login"

echo [3/3] Starting PenRx+ Server...
echo ========================================================
echo.

call npm run dev

pause
