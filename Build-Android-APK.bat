@echo off
echo =========================================================
echo       🚀 PenRx+ (بن آر إكس +) - Android APK Builder
echo =========================================================
echo.
echo 1. Updating web assets & Capacitor sync...
call npx cap sync android

echo.
echo 2. Building Android APK via Gradle...
cd android
call gradlew assembleDebug

echo.
echo =========================================================
echo ✅ Done! The generated APK file is located at:
echo    android\app\build\outputs\apk\debug\app-debug.apk
echo =========================================================
pause
