@echo off
echo.
echo ==========================================
echo  SpeakFree - Starting Development Server
echo ==========================================
echo.

:: Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo [INFO] Please edit .env file with your configuration
    pause
)

echo [1/3] Starting Docker services (MySQL + Redis)...
docker-compose up -d mysql redis

echo.
echo [2/3] Waiting for MySQL to be ready...
timeout /t 10 /nobreak > nul

echo.
echo [3/3] Starting Backend API...
cd backend
call npm run start:dev

pause
