@echo off
title Open Rosheta Admin Portal Browser
color 0B

cd /d "%~dp0"

echo [1/2] Closing stale node processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/2] Launching browser and starting server...
start "" powershell -Command "Start-Sleep -s 4; Start-Process 'http://localhost:3000/admin/login'"

call npm run dev

pause
