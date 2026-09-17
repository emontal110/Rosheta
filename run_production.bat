@echo off
chcp 65001 > nul
title Rosheta Medical Prescription Application (Production Mode)

cd /d "%~dp0"

echo =========================================================
echo       Rosheta Medical Prescription (Production Mode)
echo =========================================================
echo.

if exist .next\ (
    rmdir /s /q .next >nul 2>&1
)

echo  [1] Building production package...
call npm run build

echo  [2] Starting server and opening browser...
start http://localhost:3000
call npm run start

pause
