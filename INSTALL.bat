@echo off
echo.
echo ==========================================
echo  SpeakFree - Installation Complete
echo ==========================================
echo.

echo [1/5] Installing root dependencies...
call npm install

echo.
echo [2/5] Installing backend dependencies...
cd backend
call npm install

echo.
echo [3/5] Generating Prisma client...
call npx prisma generate

echo.
echo [4/5] Creating database and running migrations...
call npx prisma migrate dev --name init

echo.
echo [5/5] Seeding database with test data...
call npx prisma seed

cd ..

echo.
echo ==========================================
echo  Installation Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Edit .env file with your configuration
echo   2. Run START-DEV.bat to start the backend
echo   3. Open http://localhost:3000/api/health
echo.
echo Test accounts:
echo   Super Admin: superadmin@speakfree.com / Code: 200700
echo   School: college.demo@example.com / EcoleDemo123!
echo.
pause
