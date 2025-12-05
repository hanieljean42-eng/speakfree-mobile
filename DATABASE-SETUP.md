# 🗄️ Configuration Base de Données MySQL - SpeakFree

## ⚠️ ÉTAT ACTUEL

**Docker et MySQL ne sont PAS installés sur votre système.**

Vous avez 3 options pour configurer la base de données :

---

## Option 1 : Docker Desktop (RECOMMANDÉ) ⭐

### Avantages
- ✅ Le plus simple et rapide
- ✅ MySQL + Redis en 1 commande
- ✅ Pas de configuration manuelle
- ✅ Environnement isolé

### Installation

#### 1. Télécharger Docker Desktop
- Aller sur : https://www.docker.com/products/docker-desktop/
- Télécharger la version Windows
- Installer (redémarrage requis)

#### 2. Démarrer Docker Desktop
- Ouvrir Docker Desktop
- Attendre que "Docker Desktop is running" s'affiche

#### 3. Lancer la base de données
```powershell
# Dans le dossier du projet
cd C:\Users\davis\OneDrive\Documents\GitHub\speakfree-mobile

# Démarrer MySQL + Redis
docker-compose up -d

# Vérifier que ça tourne
docker ps
```

Vous devriez voir 2 conteneurs :
- `speakfree-mysql`
- `speakfree-redis`

#### 4. Créer la base de données avec Prisma
```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

#### 5. Tester
```powershell
npm run start:dev
```

Ouvrir : http://localhost:3000/api/health

---

## Option 2 : MySQL local (Installation manuelle)

### Avantages
- ✅ Pas besoin de Docker
- ✅ Contrôle total

### Installation

#### 1. Télécharger MySQL
- Aller sur : https://dev.mysql.com/downloads/installer/
- Télécharger "Windows (x86, 32-bit), MSI Installer" (~400 MB)
- Lancer l'installeur

#### 2. Configuration pendant l'installation
- **Setup Type** : Developer Default
- **MySQL Server Configuration** :
  - Port : `3306` (par défaut)
  - Root Password : `rootpassword` (ou votre choix)
  - Créer un utilisateur :
    - Username : `speakfree_user`
    - Password : `speakfree_pass`
    - Host : `localhost`
    - Role : `DB Admin`

#### 3. Créer la base de données
```powershell
# Se connecter à MySQL
mysql -u root -p
# Entrer le mot de passe root

# Dans MySQL :
CREATE DATABASE speakfree CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON speakfree.* TO 'speakfree_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4. Vérifier la connexion
```powershell
mysql -u speakfree_user -p speakfree
# Entrer le mot de passe : speakfree_pass
```

#### 5. Installer Redis (optionnel pour dev)
Redis est utilisé pour le cache mais pas critique en développement.

**Option A - Télécharger Redis pour Windows :**
- Aller sur : https://github.com/microsoftarchive/redis/releases
- Télécharger `Redis-x64-3.0.504.msi`
- Installer avec les paramètres par défaut

**Option B - Commenter Redis dans le code (temporaire) :**
Dans `backend/src/app.module.ts`, commenter les imports Redis

#### 6. Migrer avec Prisma
```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

#### 7. Tester
```powershell
npm run start:dev
```

---

## Option 3 : Base de données cloud (SQLite temporaire)

### Pour tester rapidement SANS installer MySQL

#### 1. Modifier Prisma pour utiliser SQLite
```powershell
cd backend
```

Ouvrir `prisma/schema.prisma` et modifier :

**AVANT :**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**APRÈS :**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

#### 2. Modifier les types de données
Dans `schema.prisma`, remplacer :
- `@db.VarChar(255)` → supprimer
- `@db.Text` → supprimer
- `@db.DateTime(6)` → supprimer

#### 3. Migrer
```powershell
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

Un fichier `dev.db` sera créé dans `backend/prisma/`

⚠️ **Attention** : SQLite est pour le développement uniquement, pas pour la production !

---

## ✅ Vérification de la configuration

### 1. Tester la connexion Prisma
```powershell
cd backend
npx prisma studio
```

Cela ouvre une interface web sur http://localhost:5555 pour voir vos données.

### 2. Vérifier les tables créées
Vous devriez voir 8 tables :
- `super_admins`
- `schools`
- `reports`
- `messages`
- `files`
- `audit_logs`
- `password_reset_tokens`
- `_prisma_migrations`

### 3. Vérifier les données seed
Dans Prisma Studio, vérifier :
- **super_admins** : 1 entrée (superadmin@speakfree.com)
- **schools** : 2 entrées (Collège Démo, Lycée Saint-Martin)
- **reports** : 1 entrée de démo

### 4. Tester l'API
```powershell
# Démarrer le backend
cd backend
npm run start:dev

# Dans un autre terminal, tester :
curl http://localhost:3000/api/health
```

Résultat attendu :
```json
{
  "status": "ok",
  "timestamp": "2024-12-05T...",
  "database": "connected",
  "uptime": 1.234
}
```

---

## 🐛 Dépannage

### Erreur "Access denied for user"
```powershell
# Vérifier les credentials dans .env
cat .env | Select-String "DATABASE_URL"
```

Doit correspondre à vos credentials MySQL.

### Erreur "Can't connect to MySQL server"
```powershell
# Vérifier que MySQL est démarré
Get-Service MySQL* | Select-Object Name, Status

# Ou avec Docker :
docker ps | Select-String mysql
```

### Erreur "Table doesn't exist"
```powershell
# Relancer les migrations
cd backend
npx prisma migrate reset
# Confirmer avec 'y'
```

### Prisma Client out of sync
```powershell
npx prisma generate
```

---

## 📊 Comparaison des options

| Critère | Docker | MySQL Local | SQLite |
|---------|--------|-------------|--------|
| Installation | Facile | Moyenne | Aucune |
| Temps setup | 10 min | 30 min | 5 min |
| Production-ready | ✅ | ✅ | ❌ |
| Redis inclus | ✅ | ❌ | ❌ |
| Isolation | ✅ | ❌ | ❌ |
| Performance | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 Recommandation

**Pour développement :** Option 1 (Docker) 🐳

**Pour production :** MySQL local ou cloud (AWS RDS, Google Cloud SQL)

**Pour test rapide :** Option 3 (SQLite)

---

## 📞 Besoin d'aide ?

### Commandes utiles

**Docker :**
```powershell
docker-compose up -d          # Démarrer
docker-compose down           # Arrêter
docker-compose logs -f mysql  # Voir les logs
docker exec -it speakfree-mysql mysql -u root -p  # Se connecter
```

**MySQL local :**
```powershell
mysql -u speakfree_user -p speakfree  # Se connecter
SHOW DATABASES;                       # Liste des BDD
USE speakfree;                        # Sélectionner
SHOW TABLES;                          # Liste des tables
```

**Prisma :**
```powershell
npx prisma studio          # Interface web
npx prisma migrate reset   # Reset tout
npx prisma db seed        # Recharger les données
npx prisma format         # Formater schema.prisma
```

---

## ✅ Checklist finale

Avant de continuer avec le mobile :

- [ ] MySQL installé et démarré (Docker ou local)
- [ ] Base de données `speakfree` créée
- [ ] Prisma migrations exécutées (`npx prisma migrate dev`)
- [ ] Données seed chargées (`npx prisma db seed`)
- [ ] Backend démarre sans erreur (`npm run start:dev`)
- [ ] Health check répond (`curl http://localhost:3000/api/health`)
- [ ] Prisma Studio fonctionne (`npx prisma studio`)

Une fois cette checklist complétée, vous pouvez passer au mobile ! 🚀

---

**Quelle option choisissez-vous ?**
1. Docker Desktop (recommandé)
2. MySQL local
3. SQLite (test rapide)
