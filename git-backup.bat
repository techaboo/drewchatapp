@echo off
REM Git Backup Script for DrewChatApp
REM Run this script to create a stable backup before making changes

echo ========================================
echo DrewChatApp - Git Backup Script
echo ========================================
echo.

REM Navigate to project directory (already here if running from project root)
cd /d "%~dp0"

echo Step 1: Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo ERROR: Git initialization failed
    pause
    exit /b 1
)
echo SUCCESS: Git initialized
echo.

echo Step 2: Adding all files...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo SUCCESS: All files staged
echo.

echo Step 3: Creating initial commit...
git commit -m "✅ STABLE: All 22 Workers AI models working + Copilot instructions - Production-ready baseline before theme toggle implementation - Local Ollama integration (19 models) - Cloudflare Workers AI support (22 models) - Authentication with admin approval - Email notifications via Resend - Web search via MCP bridge - Streaming SSE responses - Model selection and management - Password reset functionality - Session management - File upload support - Comprehensive documentation"
if %errorlevel% neq 0 (
    echo ERROR: Commit failed
    pause
    exit /b 1
)
echo SUCCESS: Initial commit created
echo.

echo Step 4: Tagging stable version...
git tag -a v1.0-stable -m "Working version - 22 models, auth, email, web search, copilot instructions"
if %errorlevel% neq 0 (
    echo ERROR: Tagging failed
    pause
    exit /b 1
)
echo SUCCESS: Tagged as v1.0-stable
echo.

echo Step 5: Creating experimental branch...
git checkout -b experimental
if %errorlevel% neq 0 (
    echo ERROR: Branch creation failed
    pause
    exit /b 1
)
echo SUCCESS: Switched to experimental branch
echo.

echo ========================================
echo Git Backup Complete!
echo ========================================
echo.
echo Current branch: experimental
echo Stable version tagged as: v1.0-stable
echo.
echo You can now safely make changes.
echo To return to stable version: git checkout main
echo To view all branches: git branch -a
echo To view tags: git tag -l
echo.
pause
