@echo off
title Satellite Super Resolution - Server
cd /d "%~dp0"
echo ===================================================
echo   SATELLITE SUPER RESOLUTION
echo   Sharper satellite imagery. Better insight.
echo ===================================================
echo.
echo Starting local application server...
node server.js
pause
