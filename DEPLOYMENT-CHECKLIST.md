# 📋 Checklist de Déploiement - SpeakFree

## ✅ Étape 1 : Préparation Locale

- [ ] Tous les fichiers CI/CD créés
  - [ ] `.github/workflows/backend-ci.yml`
  - [ ] `.github/workflows/mobile-ci.yml`
  - [ ] `backend/Dockerfile.prod`
  - [ ] `docker-compose.prod.yml`
  - [ ] `eas.json`
- [ ] Documentation complète
  - [ ] `DEPLOYMENT.md`
  - [ ] `DATABASE-SETUP.md`
- [ ] Scripts de déploiement
  - [ ] `deploy-to-github.ps1`
  - [ ] `deploy-to-github.sh`

---

## 🐙 Étape 2 : Configuration GitHub

### 2.1 Créer le Repository

- [ ] Aller sur https://github.com/new
- [ ] Nom : `speakfree-mobile`
- [ ] Description : "Application mobile de signalement anonyme"
- [ ] Visibilité : **Private** (recommandé)
- [ ] Ne pas créer README, .gitignore, ou LICENSE (déjà présents)
- [ ] Cliquer "Create repository"

### 2.2 Pousser le Code

**Option A : Script automatique (recommandé)**
```powershell
.\deploy-to-github.ps1
```

**Option B : Commandes manuelles**
```powershell
git add .
git commit -m "feat: Add CI/CD and deployment configuration"
git remote add origin https://github.com/VOTRE_USERNAME/speakfree-mobile.git
git push -u origin main
```

### 2.3 Créer la branche develop

```powershell
git checkout -b develop
git push -u origin develop
git checkout main
```

---

## 🔐 Étape 3 : Configurer les Secrets GitHub

Aller sur : `https://github.com/VOTRE_USERNAME/speakfree-mobile/settings/secrets/actions`

### Backend Secrets

| Nom du Secret | Valeur | Comment l'obtenir |
|---------------|--------|-------------------|
| `DOCKER_USERNAME` | votre-username-dockerhub | https://hub.docker.com |
| `DOCKER_PASSWORD` | votre-password-dockerhub | Compte Docker Hub |
| `JWT_SECRET` | 32+ caractères aléatoires | Voir commande ci-dessous |
| `JWT_REFRESH_SECRET` | 32+ caractères aléatoires | Voir commande ci-dessous |

**Générer les JWT secrets :**
```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Secrets pour Déploiement (optionnel - si vous avez un serveur)

| Nom du Secret | Valeur | Description |
|---------------|--------|-------------|
| `PRODUCTION_HOST` | `api.speakfree.com` | IP ou domaine du serveur |
| `PRODUCTION_USER` | `ubuntu` | Utilisateur SSH |
| `SSH_PRIVATE_KEY` | Contenu de `~/.ssh/id_rsa` | Clé privée SSH |
| `SSH_PORT` | `22` | Port SSH (optionnel) |

### Mobile Secrets

| Nom du Secret | Valeur | Comment l'obtenir |
|---------------|--------|-------------------|
| `EXPO_TOKEN` | Token Expo | https://expo.dev/accounts/[account]/settings/access-tokens |

**Pour créer le token Expo :**
1. Aller sur https://expo.dev
2. Se connecter ou créer un compte
3. Settings → Access Tokens → Create Token
4. Nom : `GitHub Actions`
5. Copier le token (une seule fois !)

---

## 🐳 Étape 4 : Configuration Docker Hub (Backend)

### 4.1 Créer un Compte Docker Hub

- [ ] Aller sur https://hub.docker.com
- [ ] Créer un compte (gratuit)
- [ ] Vérifier l'email

### 4.2 Créer le Repository Docker

- [ ] Se connecter à Docker Hub
- [ ] Cliquer "Create Repository"
- [ ] Nom : `speakfree-backend`
- [ ] Visibilité : Public ou Private
- [ ] Cliquer "Create"

### 4.3 Tester le Build Local (optionnel)

```powershell
cd backend
docker build -f Dockerfile.prod -t VOTRE_USERNAME/speakfree-backend:latest .
docker login
docker push VOTRE_USERNAME/speakfree-backend:latest
```

---

## 📱 Étape 5 : Configuration Expo (Mobile)

### 5.1 Créer un Compte Expo

- [ ] Aller sur https://expo.dev
- [ ] Créer un compte
- [ ] Vérifier l'email

### 5.2 Installer EAS CLI

```powershell
npm install -g eas-cli
eas login
```

### 5.3 Configurer le Projet

```powershell
# Dans le dossier racine
eas build:configure
```

Cela va :
- ✅ Créer/mettre à jour `eas.json` (déjà fait)
- ✅ Lier le projet à votre compte Expo

### 5.4 Modifier l'URL de Production

Dans `services/api.service.js`, vérifier que l'URL est correcte :
```javascript
const API_URL = 'https://api.speakfree.com/api'; // Production
// ou
const API_URL = 'http://192.168.1.100:3000/api'; // Développement
```

---

## 🚀 Étape 6 : Premier Déploiement

### 6.1 Vérifier que les Workflows Fonctionnent

- [ ] Aller sur `https://github.com/VOTRE_USERNAME/speakfree-mobile/actions`
- [ ] Vérifier qu'il n'y a pas d'erreurs
- [ ] Les workflows devraient se déclencher automatiquement au push

### 6.2 Tester le Backend CI

```powershell
# Créer un petit changement
echo "# Test" >> backend/README.md
git add backend/README.md
git commit -m "test: Trigger CI"
git push origin main
```

- [ ] Aller sur Actions
- [ ] Le workflow "Backend CI/CD" devrait démarrer
- [ ] Vérifier que tous les tests passent ✅

### 6.3 Tester le Mobile CI

```powershell
# Créer un petit changement
echo "# Test" >> README.md
git add README.md
git commit -m "test: Trigger mobile CI"
git push origin main
```

- [ ] Aller sur Actions
- [ ] Le workflow "Mobile CI/CD" devrait démarrer
- [ ] Vérifier que le lint passe ✅

---

## 🖥️ Étape 7 : Configuration Serveur (Production)

### 7.1 Prérequis Serveur

- [ ] VPS/Cloud (AWS, DigitalOcean, OVH, etc.)
- [ ] Ubuntu 20.04+ ou Debian 11+
- [ ] Au moins 2GB RAM, 20GB disque
- [ ] Accès SSH root ou sudo

### 7.2 Installation Docker sur le Serveur

```bash
# Se connecter au serveur
ssh votre-user@votre-serveur-ip

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Vérifier
docker --version
docker-compose --version
```

### 7.3 Créer le Dossier Application

```bash
sudo mkdir -p /opt/speakfree
sudo chown $USER:$USER /opt/speakfree
cd /opt/speakfree
```

### 7.4 Créer .env de Production

```bash
nano /opt/speakfree/.env
```

Contenu (à adapter) :
```env
# Database
DB_ROOT_PASSWORD=VotreMotDePasseRootTresSecurise
DB_NAME=speakfree
DB_USER=speakfree_user
DB_PASSWORD=VotreMotDePasseDBTresSecurise
DB_PORT=3306

# Redis
REDIS_PASSWORD=VotreMotDePasseRedisTresSecurise
REDIS_PORT=6379

# Backend
NODE_ENV=production
BACKEND_PORT=3000
API_URL=https://api.speakfree.com

# JWT (utiliser les mêmes que dans GitHub Secrets)
JWT_SECRET=votre-jwt-secret-32-caracteres-minimum
JWT_REFRESH_SECRET=votre-refresh-secret-32-caracteres-minimum
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://speakfree.com,https://www.speakfree.com

# Docker Hub
DOCKER_USERNAME=votre-docker-username
```

### 7.5 Copier docker-compose.prod.yml

```bash
nano /opt/speakfree/docker-compose.yml
```

Copier le contenu de `docker-compose.prod.yml` du projet.

### 7.6 Démarrer les Services

```bash
cd /opt/speakfree
docker-compose pull
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend

# Vérifier que tout fonctionne
curl http://localhost:3000/api/health
```

### 7.7 Configurer Nginx + SSL

```bash
# Installer Nginx et Certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y

# Créer la configuration
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

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/speakfree /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Obtenir SSL gratuit
sudo certbot --nginx -d api.speakfree.com
```

### 7.8 Configurer le DNS

- [ ] Aller chez votre hébergeur de domaine
- [ ] Ajouter un enregistrement A :
  - Nom : `api`
  - Type : `A`
  - Valeur : `IP_DE_VOTRE_SERVEUR`
  - TTL : `3600`
- [ ] Attendre propagation (5-30 minutes)

---

## 🧪 Étape 8 : Tests de Vérification

### Backend

- [ ] Health check répond : `curl https://api.speakfree.com/api/health`
- [ ] Swagger accessible : https://api.speakfree.com/api/docs
- [ ] Login super admin fonctionne
- [ ] WebSocket fonctionne

### Mobile

- [ ] Build Android réussit : `eas build --platform android --profile preview`
- [ ] L'app se connecte au backend de production
- [ ] Login fonctionne
- [ ] Création de rapport fonctionne
- [ ] Chat fonctionne

### CI/CD

- [ ] Push sur `main` déclenche les workflows
- [ ] Tests backend passent
- [ ] Lint mobile passe
- [ ] Build Docker réussit
- [ ] Déploiement automatique fonctionne

---

## 📊 Étape 9 : Monitoring

### Configuration de Base

```bash
# Voir les logs en temps réel
cd /opt/speakfree
docker-compose logs -f

# Voir les stats des conteneurs
docker stats

# Redémarrer un service
docker-compose restart backend
```

### Outils Recommandés (optionnel)

- [ ] **Uptime monitoring** : UptimeRobot (gratuit)
- [ ] **Error tracking** : Sentry
- [ ] **Logs** : LogTail ou Papertrail
- [ ] **Metrics** : Prometheus + Grafana

---

## 🎯 Checklist Finale

### Développement

- [ ] Repository GitHub créé et configuré
- [ ] Branches `main` et `develop` créées
- [ ] Secrets GitHub configurés
- [ ] Workflows CI/CD actifs et fonctionnels

### Backend

- [ ] Docker Hub configuré
- [ ] Image backend buildée et pushée
- [ ] Serveur de production configuré
- [ ] Base de données MySQL créée
- [ ] Redis configuré
- [ ] Nginx + SSL configurés
- [ ] Backend accessible via HTTPS
- [ ] Health check OK

### Mobile

- [ ] Compte Expo créé
- [ ] EAS configuré
- [ ] URL de production configurée
- [ ] Build Android réussit
- [ ] L'app fonctionne en production

### Documentation

- [ ] README.md à jour
- [ ] DEPLOYMENT.md lu et compris
- [ ] DATABASE-SETUP.md disponible
- [ ] Équipe formée sur le déploiement

---

## 🆘 Dépannage

### Workflow GitHub échoue

1. Vérifier les logs dans Actions
2. Vérifier que tous les secrets sont configurés
3. Vérifier la syntaxe des fichiers YAML

### Docker build échoue

1. Tester le build localement
2. Vérifier les credentials Docker Hub
3. Vérifier que le Dockerfile.prod est correct

### Serveur ne répond pas

1. Vérifier que Docker tourne : `docker ps`
2. Vérifier les logs : `docker-compose logs backend`
3. Vérifier la configuration Nginx : `sudo nginx -t`
4. Vérifier le DNS : `nslookup api.speakfree.com`

### SSL ne fonctionne pas

1. Vérifier que le port 80 est ouvert
2. Vérifier le DNS (doit pointer vers votre serveur)
3. Relancer certbot : `sudo certbot --nginx -d api.speakfree.com`

---

## 🎉 Félicitations !

Une fois toutes ces étapes complétées, votre application SpeakFree est :

✅ **Versionée** sur GitHub avec historique complet
✅ **Testée** automatiquement à chaque commit
✅ **Déployée** automatiquement en production
✅ **Sécurisée** avec HTTPS et authentification
✅ **Scalable** avec Docker et orchestration
✅ **Monitorée** pour détecter les problèmes

**Bon déploiement ! 🚀**
