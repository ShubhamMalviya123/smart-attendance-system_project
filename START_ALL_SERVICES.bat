@echo off
title Smart Attendance System - All Services
echo ========================================================
echo Starting Smart Attendance System
echo This will open 3 separate windows:
echo   1. AI Microservice (Port 8000)
echo   2. Spring Boot Backend (Port 9630) - Connected to MySQL
echo   3. React Frontend (Port 3000)
echo ========================================================
start "1. AI Service" cmd /k "%~dp0start-ai-service.bat"
timeout /t 3 /nobreak >nul
start "2. Backend" cmd /k "%~dp0start-backend.bat"
timeout /t 4 /nobreak >nul
start "3. Frontend" cmd /k "%~dp0start-frontend.bat"
timeout /t 5 /nobreak >nul
start http://localhost:3000
echo.
echo All 3 services are launching. App will open at http://localhost:3000
pause
