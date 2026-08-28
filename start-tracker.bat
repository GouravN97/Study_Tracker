@echo off
title University Study Tracker - Auto Update & Launch
cd /d "%~dp0"

echo [1/3] Checking for latest updates from Git repository...
git pull

echo.
echo [2/3] Starting local server at http://localhost:3000...
start "" http://localhost:3000

echo.
echo [3/3] Tracker is running! Press Ctrl+C in this window to stop the server when done.
echo ----------------------------------------------------------------------------------
npm run dev
