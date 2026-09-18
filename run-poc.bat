@echo off
title Playwright PoC Setup & Runner
color 0A

echo ======================================================================
echo                  PLAYWRIGHT POC QUICK SETUP & RUNNER
echo ======================================================================
echo.

:: 1. Check if Node.js is already available in PATH or default Program Files directory
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    )
)

:: 2. If Node.js is still missing, attempt automatic installation via winget
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js is NOT installed on this PC.
    echo [!] Attempting automatic Node.js LTS installation via winget...
    echo.
    winget install --id OpenJS.NodeJS.LTS --exact --accept-source-agreements --accept-package-agreements
    
    :: Refresh PATH for the current batch session
    if exist "%ProgramFiles%\nodejs\node.exe" (
        set "PATH=%ProgramFiles%\nodejs;%PATH%"
    )
)

:: 3. Final verification of Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [!] Automatic Node.js installation could not complete.
    echo Please download & install Node.js (LTS) manually from: https://nodejs.org/
    echo After installing, restart your terminal/VS Code and run this file again.
    echo.
    pause
    exit /b 1
)

echo [1/3] Node.js Version:
node -v
echo.

echo [2/3] Installing project dependencies (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo [!] Failed to install npm dependencies.
    pause
    exit /b 1
)
echo.

echo [3/3] Downloading Playwright Chromium browser...
call npx playwright install chromium
if %errorlevel% neq 0 (
    echo [!] Failed to download Chromium browser.
    pause
    exit /b 1
)
echo.

echo ======================================================================
echo  Setup Complete! Opening Playwright Interactive UI...
echo ======================================================================
echo.
call npx playwright test --project=webapp-poc --ui

pause
