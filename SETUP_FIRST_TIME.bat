@echo off
title First-time setup - Smart Attendance
cd /d "%~dp0"

python --version >nul 2>&1
if errorlevel 1 goto nopython
for /f "tokens=2 delims= " %%v in ('python --version') do set PYV=%%v
for /f "tokens=1,2 delims=." %%a in ("%PYV%") do (
  set MAJ=%%a
  set MIN=%%b
)
if not "%MAJ%"=="3" goto badpython
if %MIN% LSS 9 goto badpython
if %MIN% GTR 12 goto badpython

node --version >nul 2>&1
if errorlevel 1 goto nonode

echo ============================================
echo [1/2] Setting up the AI service (3-5 minutes)...
echo ============================================
cd ai-service
if not exist venv\Scripts\activate.bat python -m venv venv
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 goto fail
cd ..

echo ============================================
echo [2/2] Setting up the frontend (2-5 minutes)...
echo ============================================
cd frontend
call npm install
if errorlevel 1 goto fail
cd ..

echo.
echo ============================================
echo  SETUP COMPLETE!
echo  Next: 1) Run the backend from IntelliJ
echo        2) Double-click START_ALL_SERVICES.bat
echo ============================================
pause
exit /b

:nopython
echo Python is not installed. Install Python 3.12 from python.org (tick "Add python.exe to PATH").
start https://www.python.org/downloads/
pause
exit /b

:badpython
echo Your Python version is %PYV%. Python 3.9 to 3.12 is required. Please install Python 3.12.
start https://www.python.org/downloads/
pause
exit /b

:nonode
echo Node.js is not installed. Install the LTS version from nodejs.org, then run this file again.
start https://nodejs.org/
pause
exit /b

:fail
echo.
echo Something went wrong. Please check the error shown above.
pause
exit /b
