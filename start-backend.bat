@echo off
title Backend - Smart Attendance
cd /d "%~dp0backend"
echo ============================================
echo Starting Backend on port 9630...
echo DO NOT CLOSE THIS WINDOW while using the app.
echo ============================================
if exist "C:\Program Files\Java\jdk-21\bin\java.exe" (
    "C:\Program Files\Java\jdk-21\bin\java.exe" -jar target\smart-attendance-backend-1.0.0.jar
) else (
    java -jar target\smart-attendance-backend-1.0.0.jar
)
pause
