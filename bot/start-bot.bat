@echo off
title ArchMC Discord Bot
cd /d "%~dp0"

echo ===================================================
echo   ArchMC Discord Auth & Moderation Bot
echo ===================================================
echo.

if not exist node_modules (
    echo [INFO] Installing dependencies (discord.js, express, dotenv, cors)...
    npm install
    echo.
)

echo [INFO] Starting Bot...
node index.js

pause

