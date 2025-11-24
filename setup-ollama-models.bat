@echo off
echo ============================================
echo  DrewChatApp - Ollama Model Setup
echo ============================================
echo.
echo This will download recommended Ollama models
echo.
echo Recommended models (choose what to download):
echo   1. llama3.2:1b (1.3 GB) - Fastest, good for testing
echo   2. qwen2.5-coder:1.5b (1 GB) - Best for coding
echo   3. llama3.2:3b (2 GB) - Balanced performance
echo   4. qwen2.5-coder:7b (4.7 GB) - Professional coding
echo   5. llama3.1:8b (4.7 GB) - High capability
echo.
echo Make sure Ollama is running (run start-ollama.bat first)
echo.
pause

:menu
echo.
echo Select a model to download (or Q to quit):
echo.
echo [1] llama3.2:1b (1.3 GB) - Fastest
echo [2] qwen2.5-coder:1.5b (1 GB) - Coding specialist
echo [3] llama3.2:3b (2 GB) - Balanced
echo [4] qwen2.5-coder:7b (4.7 GB) - Advanced coding
echo [5] llama3.1:8b (4.7 GB) - High capability
echo [Q] Quit
echo.
set /p choice="Enter your choice: "

if "%choice%"=="1" (
    echo.
    echo Downloading llama3.2:1b...
    ollama pull llama3.2:1b
    goto menu
)
if "%choice%"=="2" (
    echo.
    echo Downloading qwen2.5-coder:1.5b...
    ollama pull qwen2.5-coder:1.5b
    goto menu
)
if "%choice%"=="3" (
    echo.
    echo Downloading llama3.2:3b...
    ollama pull llama3.2:3b
    goto menu
)
if "%choice%"=="4" (
    echo.
    echo Downloading qwen2.5-coder:7b...
    ollama pull qwen2.5-coder:7b
    goto menu
)
if "%choice%"=="5" (
    echo.
    echo Downloading llama3.1:8b...
    ollama pull llama3.1:8b
    goto menu
)
if /i "%choice%"=="Q" goto end

echo Invalid choice. Please try again.
goto menu

:end
echo.
echo ============================================
echo  Model Setup Complete!
echo ============================================
echo.
echo To view installed models: ollama list
echo To use models: Start dev server and select from dropdown
echo.
pause
