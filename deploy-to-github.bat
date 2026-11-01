@echo off
title Push Smart Attendance System to GitHub
cd /d "%~dp0"

echo =======================================================
echo   Smart Attendance System - GitHub Setup
echo =======================================================
echo.
echo Please create a new EMPTY repository on GitHub:
echo https://github.com/new
echo (Do NOT initialize with README, .gitignore or license)
echo.
set /p REPO_URL="Enter your GitHub Repo URL (e.g. https://github.com/username/repo.git): "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL entered. Exiting.
    pause
    exit /b
)

echo.
echo [1/3] Adding git remote origin...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo [2/3] Setting branch to main...
git branch -M main

echo [3/3] Pushing code to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo =======================================================
    echo Push failed!
    echo If GitHub asks for login, please sign in.
    echo If you use Personal Access Token, use it as password.
    echo =======================================================
) else (
    echo.
    echo =======================================================
    echo SUCCESS! Your code is now live on GitHub.
    echo You can now connect it to Render and Vercel!
    echo =======================================================
)

pause
