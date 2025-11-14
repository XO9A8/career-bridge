@echo off
REM CareerBridge Build & Run Automation
REM Simple batch wrapper for Windows

if "%1"=="" goto help
if "%1"=="help" goto help

REM Call PowerShell script with the command
powershell -ExecutionPolicy Bypass -File "%~dp0make.ps1" %*
goto end

:help
echo.
echo CareerBridge - Build and Run Automation
echo ========================================
echo.
echo Usage: make.bat [command]
echo.
echo Common Commands:
echo   help           - Show this help message
echo   install        - Install all dependencies
echo   quickstart     - Quick setup (install + database setup)
echo   dev            - Start development servers (backend + frontend)
echo   build          - Build for production
echo   test           - Run tests
echo   clean          - Clean build artifacts
echo.
echo For full list of commands, run: powershell -File make.ps1
echo.

:end
