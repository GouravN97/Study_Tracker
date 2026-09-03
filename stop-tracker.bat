@echo off
title Stop University Study Tracker
cd /d "%~dp0"

echo ========================================================================
echo   STOPPING UNIVERSITY STUDY TRACKER
echo ========================================================================
echo.

echo Checking for processes on port 3000...
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        echo Stopping process with PID %%a on port 3000...
        taskkill /F /PID %%a >nul 2>nul
    )
    echo [SUCCESS] Tracker server on port 3000 has been stopped.
) else (
    echo [INFO] No tracker process was detected running on port 3000.
)

echo.
pause
