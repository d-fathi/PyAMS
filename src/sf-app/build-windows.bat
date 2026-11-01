@echo off
REM Builds the PyAMS Windows installer and portable exe.  Needs Node.js 18+ (https://nodejs.org)
cd /d "%~dp0"
call npm install || goto :error
call npm run dist:win || goto :error
echo.
echo Done. The installer and the portable exe are in the "dist" folder.
pause
exit /b 0
:error
echo.
echo Build failed - see the messages above.
pause
exit /b 1
