@echo off
title Satellite Super Resolution - Server
cd /d "%~dp0"
echo ===================================================
echo   SATELLITE SUPER RESOLUTION
echo   Sharper satellite imagery. Better insight.
echo ===================================================
echo.
echo Starting local application server...
start http://localhost:4200/
node server.js
pause
