@echo off
echo.
echo ==========================================
echo  SpeakFree Mobile - Installation
echo ==========================================
echo.

echo [1/3] Verification de Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe.
    echo Telechargez et installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detecte: 
node --version

echo.
echo [2/3] Installation d'Expo CLI globalement...
call npm install -g expo-cli

echo.
echo [3/3] Installation des dependances du projet...
call npm install

echo.
echo ==========================================
echo  Installation terminee !
echo ==========================================
echo.
echo Prochaines etapes:
echo.
echo 1. Modifiez services/api.service.js et discussion.service.js
echo    Remplacez "localhost" par l'IP de votre machine (ex: 192.168.1.10)
echo.
echo 2. Assurez-vous que le backend est demarre:
echo    cd backend
echo    npm run start:dev
echo.
echo 3. Lancez l'application mobile:
echo    npm start
echo.
echo 4. Installez Expo Go sur votre telephone et scannez le QR code
echo.
pause
