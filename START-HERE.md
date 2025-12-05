# 🚀 Guide de Démarrage - SpeakFree

## Installation Rapide (Windows)

### 1. Copier la configuration
```powershell
Copy-Item .env.example .env
```

### 2. Option A : Avec Docker (Recommandé) 🐳

```powershell
# Démarrer tous les services (MySQL + Redis + Backend)
docker-compose up -d

# Vérifier que tout fonctionne
docker-compose ps

# Voir les logs
docker-compose logs -f backend

# Arrêter
docker-compose down
```

✅ L'API est disponible sur `http://localhost:3000`

### 3. Option B : Installation Manuelle

#### Backend

```powershell
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Créer les tables MySQL
npm run prisma:migrate

# Ajouter les données de test
npm run prisma:seed

# Démarrer le serveur
npm run start:dev
```

#### Mobile Flutter

```powershell
# Aller dans le dossier mobile
cd mobile

# Installer les dépendances
flutter pub get

# Lancer l'app (Android)
flutter run

# Ou iOS
flutter run -d ios
```

## 🧪 Tester l'API

### PowerShell

```powershell
# Test de santé
Invoke-WebRequest -Uri "http://localhost:3000/api" -Method GET

# Login Super Admin
$body = @{
    email = "superadmin@speakfree.com"
    code = "200700"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/superadmin/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

# Login École
$body = @{
    email = "college.demo@example.com"
    password = "EcoleDemo123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/school/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## 📊 Interface Base de Données

```powershell
cd backend
npm run prisma:studio
```

Ouvre `http://localhost:5555` avec une interface graphique pour voir les données.

## 🐛 Dépannage

### Port 3000 déjà utilisé

```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

### Problème MySQL

```powershell
# Vérifier que MySQL est démarré
Get-Service MySQL*

# Démarrer MySQL
Start-Service MySQL80
```

### Réinitialiser la base de données

```powershell
cd backend

# Supprimer et recréer
npm run prisma:migrate reset

# Recharger les données de test
npm run prisma:seed
```

## 📝 Comptes de Test

| Type | Email | Mot de passe/Code |
|------|-------|-------------------|
| Super Admin | superadmin@speakfree.com | **200700** |
| École Active | college.demo@example.com | EcoleDemo123! |
| École Pending | lycee.demo@example.com | LyceeDemo123! |

**Codes de signalement test** :
- Suivi : `RPT-DEMO1`
- Discussion : `DSC-DEMO1`

## 🔧 Commandes Utiles

### Backend

```powershell
cd backend

# Développement avec hot-reload
npm run start:dev

# Build production
npm run build

# Lancer en production
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Prisma
npm run prisma:generate     # Générer le client
npm run prisma:migrate      # Nouvelle migration
npm run prisma:studio       # Interface DB
npm run prisma:seed         # Charger données test

# Lint & Format
npm run lint
npm run format
```

### Mobile

```powershell
cd mobile

# Lancer l'app
flutter run

# Build Android (APK)
flutter build apk --release

# Build Android (AAB pour Play Store)
flutter build appbundle --release

# Build iOS
flutter build ipa --release

# Tests
flutter test
flutter test --coverage

# Analyser le code
flutter analyze

# Nettoyer
flutter clean
```

### Docker

```powershell
# Démarrer tout
docker-compose up -d

# Arrêter tout
docker-compose down

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f mysql

# Rebuild
docker-compose build --no-cache

# Supprimer tout (volumes inclus)
docker-compose down -v
```

## 📦 Structure des Dossiers

```
speakfree-mobile/
├── backend/          # API NestJS
├── mobile/           # App Flutter
├── admin-web/        # Panel admin (à créer)
├── docs/             # Documentation
└── docker/           # Config Docker
```

## 🔗 URLs Importantes

| Service | URL |
|---------|-----|
| API Backend | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 |
| Admin Web | http://localhost:5173 |
| Mobile (Expo) | http://localhost:8081 |

## 📞 Support

- 📚 [Documentation Complète](./docs/DOCUMENTATION-COMPLETE.md)
- 🚀 [Quick Start](./docs/QUICK-START.md)
- 📋 [Résumé Projet](./PROJET-RESUME.md)

## ✅ Vérification Finale

Avant de commencer à développer :

- [ ] Docker fonctionne OU MySQL + Redis installés
- [ ] Backend démarre sans erreur
- [ ] Prisma Studio s'ouvre
- [ ] Super admin peut se connecter
- [ ] École peut se connecter
- [ ] Base de données a les données de test

**Tout est OK ? Vous êtes prêt ! 🎉**
