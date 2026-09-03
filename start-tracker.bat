@echo off
setlocal enabledelayedexpansion
title University Course Study Tracker
cd /d "%~dp0"

echo ========================================================================
echo   UNIVERSITY COURSE WEEKLY STUDY TRACKER - LAUNCHER
echo ========================================================================
echo.

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Node.js is required to run the local tracker server.
    echo.
    echo Please install the LTS version of Node.js from:
    echo   https://nodejs.org/
    echo.
    echo After installing Node.js, re-run this file.
    echo ========================================================================
    pause
    exit /b 1
)

:: 2. Check for Git updates (gracefully skips if not a git repo or no git)
if exist ".git" (
    where git >nul 2>nul
    if %errorlevel% equ 0 (
        echo [1/3] Checking for latest updates from Git repository...
        git pull --quiet
    )
)

:: 3. Verify that node_modules and dependencies exist
if not exist "node_modules\" (
    echo [2/3] First-time setup detected: Installing required packages...
    echo (This may take a minute, please wait...)
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] npm install encountered an issue!
        echo Please check your internet connection and try running "npm install" manually.
        echo ========================================================================
        pause
        exit /b 1
    )
    echo [2/3] Packages installed successfully!
) else (
    echo [2/3] Packages verified.
)

:: 4. Detect and free port 3000 if occupied by a stale background instance
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>nul
if %errorlevel% equ 0 (
    echo.
    echo [NOTICE] Port 3000 is already occupied by a previous running instance.
    echo Releasing port 3000 to start fresh...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>nul
    )
    timeout /t 1 >nul
)

:: 5. Launch the application in the default web browser
echo [3/3] Opening University Study Tracker at http://localhost:3000...
start "" http://localhost:3000

echo.
echo ========================================================================
echo TRACKER SERVER IS RUNNING!
echo - Web App: http://localhost:3000
echo - Keep this Command Prompt window open while using the application.
echo - To stop the server when you are done, press Ctrl+C in this window.
echo ========================================================================
echo.

:run_server
:: 6. Launch the server using "call" so batch shell retains control
call npm run dev

:: 7. If the server exits or crashes, KEEP THE WINDOW OPEN!
echo.
echo ========================================================================
echo [STOPPED] The tracker server process stopped or exited.
echo If an error was displayed above, you can review it now.
echo ========================================================================
echo.
echo What would you like to do?
echo   [R] Restart Tracker Server
echo   [I] Reinstall Dependencies (npm install) and Restart
echo   [Q] Quit / Close Window
echo.
set /p choice="Enter choice [R, I, Q]: "

if /i "%choice%"=="R" (
    cls
    echo Restarting University Study Tracker server...
    goto :run_server
)

if /i "%choice%"=="I" (
    cls
    echo Reinstalling dependencies...
    call npm install
    goto :run_server
)

echo Exiting...
exit /b 0

