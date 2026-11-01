@echo off
setlocal
cd /d "%~dp0"

rem ============================================================
rem  Shrink the photos in img\ so the site stays small and fast.
rem  Max side 1400px, JPEG quality 80. Files that are already small
rem  enough are skipped, so it is safe to run again and again.
rem  Run this after adding photos, before uploading to GitHub.
rem ============================================================

set "PS=powershell"
where pwsh >nul 2>nul
if not errorlevel 1 set "PS=pwsh"

echo Using %PS% ...
echo.

"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0compress-photos.ps1"
if errorlevel 1 goto :failed

echo.
pause
exit /b 0

:failed
echo.
echo [FAILED] See the message above.
echo.
pause
exit /b 1
