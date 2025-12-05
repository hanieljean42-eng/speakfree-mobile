# 🚀 Guide de Déploiement SpeakFree sur GitHub

Ce guide vous explique comment déployer l'application SpeakFree sur GitHub avec CI/CD automatisé.

---

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration du repository GitHub](#configuration-du-repository-github)
3. [Configuration des secrets](#configuration-des-secrets)
4. [Déploiement du backend](#déploiement-du-backend)
5. [Déploiement du mobile](#déploiement-du-mobile)
6. [Workflows CI/CD](#workflows-cicd)
7. [Monitoring et logs](#monitoring-et-logs)

---

## 🔧 Prérequis

### Comptes nécessaires

- ✅ Compte GitHub
- ✅ Compte Docker Hub (pour les images Docker)
- ✅ Compte Expo (pour l'app mobile)
- ✅ Serveur de production (VPS, AWS, DigitalOcean, etc.)

### Outils à installer localement

```powershell
# Git (si pas déjà installé)
winget install Git.Git

# Docker Desktop (pour build local)
winget install Docker.DockerDesktop

# GitHub CLI (optionnel mais pratique)
winget install GitHub.cli
```

---

## 📦 Configuration du repository GitHub

### 1. Créer le repository sur GitHub

**Option A : Via l'interface web**
1. Aller sur https://github.com/new
2. Nom du repository : `speakfree-mobile`
3. Description : "Application mobile de signalement anonyme pour établissements scolaires"
4. Visibilité : **Private** (recommandé pour la production)
5. Cliquer sur "Create repository"

**Option B : Via GitHub CLI**
```powershell
gh auth login
gh repo create speakfree-mobile --private --description "Application mobile de signalement anonyme"
```

### 2. Pousser le code existant

```powershell
cd C:\Users\davis\OneDrive\Documents\GitHub\speakfree-mobile

# Vérifier l'état Git
git status

# Ajouter tous les nouveaux fichiers
git add .

# Commit avec les workflows CI/CD
git commit -m "feat: Add CI/CD workflows and production config"

# Ajouter le remote GitHub (remplacer YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/speakfree-mobile.git

# Pousser vers GitHub
git push -u origin main
```

### 3. Créer les branches

```powershell
# Créer la branche develop
git checkout -b develop
git push -u origin develop

# Retourner sur main
git checkout main
```

**Structure des branches :**
- `main` : Production (déploiement automatique)
- `develop` : Développement (tests uniquement)
- `feature/*` : Nouvelles fonctionnalités

---

## 🔐 Configuration des secrets

Les secrets sont nécessaires pour le CI/CD. Allez dans votre repository GitHub :
**Settings → Secrets and variables → Actions → New repository secret**

### Secrets pour le Backend

| Secret | Description | Exemple |
|--------|-------------|---------|
| `DOCKER_USERNAME` | Votre nom d'utilisateur Docker Hub | `johndoe` |
| `DOCKER_PASSWORD` | Votre mot de passe Docker Hub | `********` |
| `PRODUCTION_HOST` | IP ou domaine du serveur | `api.speakfree.com` |
| `PRODUCTION_USER` | Utilisateur SSH | `ubuntu` |
| `SSH_PRIVATE_KEY` | Clé privée SSH | `-----BEGIN RSA...` |
| `SSH_PORT` | Port SSH (optionnel) | `22` |
| `JWT_SECRET` | Secret JWT (32+ caractères) | `your-super-secret-jwt-key-change-me` |
| `JWT_REFRESH_SECRET` | Secret refresh token | `your-refresh-secret-key-change-me` |

### Secrets pour le Mobile

| Secret | Description | Obtention |
|--------|-------------|-----------|
| `EXPO_TOKEN` | Token d'accès Expo | https://expo.dev/accounts/[account]/settings/access-tokens |

### Comment générer les secrets

**JWT Secrets (recommandé) :**
```powershell
# Générer un secret fort
$secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET: $secret"

$refreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_REFRESH_SECRET: $refreshSecret"
```

**Clé SSH (pour déploiement) :**
```powershell
# Sur votre serveur de production
ssh-keygen -t rsa -b 4096 -C "github-actions@speakfree.com"

# Copier la clé publique sur le serveur
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys

# Copier la clé privée (à mettre dans SSH_PRIVATE_KEY)
cat ~/.ssh/id_rsa
```

---

## 🐳 Déploiement du Backend

### 1. Préparer Docker Hub

```powershell
# Se connecter à Docker Hub
docker login

# Builder l'image localement (test)
cd backend
docker build -f Dockerfile.prod -t YOUR_USERNAME/speakfree-backend:latest .

# Pousser l'image
docker push YOUR_USERNAME/speakfree-backend:latest
```

### 2. Préparer le serveur de production

**Se connecter au serveur :**
```bash
ssh ubuntu@your-server-ip
```

**Installer les dépendances :**
```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Créer le dossier de l'application
sudo mkdir -p /opt/speakfree
sudo chown $USER:$USER /opt/speakfree
cd /opt/speakfree
```

**Créer le fichier .env de production :**
```bash
nano /opt/speakfree/.env
```

Contenu du fichier `.env` :
```env
# Database
DB_ROOT_PASSWORD=your-strong-root-password-change-me
DB_NAME=speakfree
DB_USER=speakfree_user
DB_PASSWORD=your-strong-db-password-change-me
DB_PORT=3306

# Redis
REDIS_PASSWORD=your-strong-redis-password-change-me
REDIS_PORT=6379

# Backend
NODE_ENV=production
BACKEND_PORT=3000
API_URL=https://api.speakfree.com

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-me
JWT_REFRESH_SECRET=your-refresh-secret-key-change-me
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://speakfree.com,https://www.speakfree.com

# Docker Hub
DOCKER_USERNAME=your-docker-username
```

**Copier docker-compose.prod.yml sur le serveur :**
```bash
nano /opt/speakfree/docker-compose.yml
# Coller le contenu de docker-compose.prod.yml
```

**Démarrer les services :**
```bash
cd /opt/speakfree
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend

# Vérifier le health check
curl http://localhost:3000/api/health
```

### 3. Configurer Nginx (optionnel mais recommandé)

**Installer Nginx :**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

**Configurer le reverse proxy :**
```bash
sudo nano /etc/nginx/sites-available/speakfree
```

Contenu :
```nginx
server {
    listen 80;
    server_name api.speakfree.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Activer et obtenir SSL :**
```bash
sudo ln -s /etc/nginx/sites-available/speakfree /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtenir certificat SSL (Let's Encrypt)
sudo certbot --nginx -d api.speakfree.com
```

---

## 📱 Déploiement du Mobile

### 1. Configurer Expo

```powershell
# Installer EAS CLI
npm install -g eas-cli

# Se connecter à Expo
eas login

# Configurer le projet
eas build:configure
```

### 2. Créer eas.json

Créer le fichier `eas.json` à la racine :
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./android-service-account.json"
      },
      "ios": {
        "appleId": "your-email@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

### 3. Modifier l'URL de l'API

Dans `services/api.service.js`, remplacer :
```javascript
// AVANT (développement)
const API_URL = 'http://192.168.1.100:3000/api';

// APRÈS (production)
const API_URL = 'https://api.speakfree.com/api';
```

Ou mieux, utiliser des variables d'environnement :
```javascript
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.apiUrl || 'https://api.speakfree.com/api';
```

Et dans `app.json` :
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://api.speakfree.com/api"
    }
  }
}
```

### 4. Builder l'application

**Android :**
```powershell
# Build APK (test)
eas build --platform android --profile preview

# Build AAB (production - Google Play)
eas build --platform android --profile production
```

**iOS :**
```powershell
# Build (nécessite un compte Apple Developer)
eas build --platform ios --profile production
```

### 5. Publier sur Expo

```powershell
# Publier une mise à jour OTA (Over-The-Air)
eas update --branch production --message "Version 1.0.0"
```

---

## 🔄 Workflows CI/CD

### Backend CI/CD (`backend-ci.yml`)

**Déclencheurs :**
- Push sur `main` ou `develop`
- Pull Request vers `main` ou `develop`
- Modifications dans `/backend/`

**Étapes :**
1. ✅ **Test** : Tests unitaires, linting, migrations
2. 🏗️ **Build** : Construction de l'image Docker
3. 🚀 **Deploy** : Déploiement automatique sur le serveur

**Utilisation :**
```powershell
# Créer une Pull Request
git checkout -b feature/new-feature
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature

# Les tests s'exécutent automatiquement
# Merger la PR déclenche le déploiement
```

### Mobile CI/CD (`mobile-ci.yml`)

**Déclencheurs :**
- Push sur `main` ou `develop`
- Pull Request
- Modifications dans `/components/`, `/screens/`, etc.

**Étapes :**
1. 🎨 **Lint** : Vérification du code
2. 🏗️ **Build** : Build Expo preview
3. 📱 **Publish** : Publication sur Expo (main seulement)

---

## 📊 Monitoring et logs

### Vérifier le statut des workflows

**Via l'interface GitHub :**
1. Aller sur votre repository
2. Onglet **Actions**
3. Voir les workflows en cours et l'historique

**Via GitHub CLI :**
```powershell
gh run list
gh run view [run-id]
gh run watch
```

### Logs du serveur de production

```bash
# Se connecter au serveur
ssh ubuntu@your-server-ip

cd /opt/speakfree

# Logs backend
docker-compose logs -f backend

# Logs MySQL
docker-compose logs -f mysql

# Logs Redis
docker-compose logs -f redis

# Tous les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend
```

### Monitoring de santé

**Backend health check :**
```bash
curl https://api.speakfree.com/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T10:30:00.000Z",
  "database": "connected",
  "uptime": 12345
}
```

**Stats des conteneurs :**
```bash
docker stats
```

---

## 🔥 Commandes utiles

### Déploiement manuel

```powershell
# Forcer un déploiement
git commit --allow-empty -m "chore: Trigger deployment"
git push origin main
```

### Rollback rapide

```bash
# Sur le serveur
cd /opt/speakfree
docker-compose pull backend:previous-tag
docker-compose up -d backend
```

### Vérifier les secrets GitHub

```powershell
gh secret list
```

### Backup de la base de données

```bash
# Sur le serveur
docker exec speakfree-mysql-prod mysqldump -u root -p speakfree > backup_$(date +%Y%m%d).sql
```

---

## 📝 Checklist finale

Avant de déployer en production :

- [ ] Repository GitHub créé (public ou private)
- [ ] Code poussé sur `main` et `develop`
- [ ] Tous les secrets GitHub configurés
- [ ] Docker Hub configuré et image pushée
- [ ] Serveur de production préparé (Docker + Docker Compose)
- [ ] Fichier `.env` de production créé sur le serveur
- [ ] Nginx configuré avec SSL (Let's Encrypt)
- [ ] Backend accessible via `https://api.speakfree.com`
- [ ] Health check répond : `/api/health`
- [ ] Compte Expo créé et token configuré
- [ ] URL de l'API modifiée dans le mobile (production)
- [ ] Build Expo réussi (Android/iOS)
- [ ] Application testée en production

---

## 🎯 URLs importantes

**Développement :**
- Backend : http://localhost:3000
- Prisma Studio : http://localhost:5555

**Production :**
- Backend API : https://api.speakfree.com
- Documentation API : https://api.speakfree.com/api/docs
- Health Check : https://api.speakfree.com/api/health

**Outils :**
- GitHub Actions : https://github.com/YOUR_USERNAME/speakfree-mobile/actions
- Docker Hub : https://hub.docker.com/r/YOUR_USERNAME/speakfree-backend
- Expo Dashboard : https://expo.dev

---

## 🆘 Support

En cas de problème :

1. Vérifier les logs GitHub Actions
2. Vérifier les logs Docker sur le serveur
3. Tester le health check de l'API
4. Vérifier la configuration Nginx
5. Consulter la documentation Expo

**Bon déploiement ! 🚀**
