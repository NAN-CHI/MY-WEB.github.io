@echo off
setlocal
cd /d "%~dp0"

rem ============================================================
rem  Update the photo data used by friends.html
rem  ------------------------------------------------------------------
rem  1. Put photos into  img\            (shown in "all photos" + carousel)
rem  2. Or into            img\friends\<name>\   (that person's own section)
rem  3. Double-click this file, then refresh friends.html
rem  ------------------------------------------------------------
rem  Uses PowerShell 7 (pwsh) when available, otherwise the built-in
rem  Windows PowerShell 5.1 -- so it works on a fresh Windows install.
rem ============================================================

set "PS=powershell"
where pwsh >nul 2>nul
if not errorlevel 1 set "PS=pwsh"

echo Using %PS% ...
echo.

"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0update-friends.ps1"
if errorlevel 1 goto :failed

echo.
echo [DONE] js\friends-data.js has been rebuilt.
echo        Refresh friends.html to see the new photos.
echo.
pause
exit /b 0

:failed
echo.
echo [FAILED] The update did not finish - see the message above.
echo.
echo Tips:
echo   - If it says "running scripts is disabled", right-click this file
echo     and choose "Run as administrator".
echo   - Make sure the folder layout is still:
echo       img\                      photos for the "all photos" wall
echo       img\friends\<name>\       photos for one person's section
echo.
pause
exit /b 1
