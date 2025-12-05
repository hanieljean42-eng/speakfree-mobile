# 🚀 Guide de Démarrage Rapide - SpeakFree

## ⚡ Installation Express (5 minutes)

### Prérequis

Avant de commencer, installez :
- ✅ [Node.js 18+](https://nodejs.org/)
- ✅ [MySQL 8](https://dev.mysql.com/downloads/)
- ✅ [Redis](https://redis.io/download) (optionnel en dev)
- ✅ [Git](https://git-scm.com/)

### Étape 1 : Cloner le projet

```bash
git clone https://github.com/your-org/speakfree.git
cd speakfree
```

### Étape 2 : Configuration

```bash
# Copier le fichier d'environnement
copy .env.example .env

# Éditer .env avec vos paramètres
notepad .env
```

**Configuration minimale dans `.env`** :
```env
DATABASE_URL=mysql://root:password@localhost:3306/speakfree
JWT_SECRET=votre-secret-unique-ici
JWT_REFRESH_SECRET=votre-refresh-secret-unique
```

### Étape 3 : Installation Backend

```bash
cd backend
npm install
```

### Étape 4 : Initialiser la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer les tables
npm run prisma:migrate

# Ajouter les données de test
npm run prisma:seed
```

### Étape 5 : Démarrer le serveur

```bash
npm run start:dev
```

✅ Le serveur démarre sur **http://localhost:3000**

### Étape 6 : Tester l'API

Ouvrez un autre terminal :

```bash
# Test de santé
curl http://localhost:3000/api/health

# Login super admin
curl -X POST http://localhost:3000/api/auth/superadmin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"superadmin@speakfree.com\",\"code\":\"200700\"}"
```

## 🎉 C'est prêt !

### Comptes de test

| Rôle | Email | Mot de passe / Code |
|------|-------|---------------------|
| Super Admin | superadmin@speakfree.com | Code: **200700** |
| École (Active) | college.demo@example.com | EcoleDemo123! |
| École (Pending) | lycee.demo@example.com | LyceeDemo123! |

### Codes de test

| Code | Type | Description |
|------|------|-------------|
| RPT-DEMO1 | Suivi | Code de suivi du signalement |
| DSC-DEMO1 | Discussion | Code de discussion |

## 🐳 Alternative : Docker (Encore plus rapide !)

Si vous avez Docker installé :

```bash
# Dans le dossier racine
docker-compose up -d

# Attendre 30 secondes pour l'initialisation
# L'API est prête sur http://localhost:3000
```

## 📱 Prochaines étapes

1. **Installer l'application mobile** : Voir [mobile/README.md](../mobile/README.md)
2. **Installer le panel admin** : Voir [admin-web/README.md](../admin-web/README.md)
3. **Lire la documentation** : Voir [docs/DOCUMENTATION-COMPLETE.md](./DOCUMENTATION-COMPLETE.md)

## 🔧 Commandes utiles

```bash
# Voir la base de données (interface web)
npm run prisma:studio

# Relancer les migrations
npm run prisma:migrate

# Rebuild et redémarrer
npm run build
npm run start:prod

# Voir les logs
docker-compose logs -f backend
```

## ❓ Problèmes courants

### Erreur de connexion MySQL

```
Error: Can't connect to MySQL server
```

**Solution** :
1. Vérifier que MySQL est démarré
2. Vérifier les identifiants dans `.env`
3. Créer la base si elle n'existe pas :
   ```sql
   CREATE DATABASE speakfree;
   ```

### Port 3000 déjà utilisé

```
Error: Port 3000 is already in use
```

**Solution** :
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Prisma : command not found

**Solution** :
```bash
npm install -g prisma
# ou
npx prisma <command>
```

## 📞 Besoin d'aide ?

- 📚 [Documentation complète](./DOCUMENTATION-COMPLETE.md)
- 🐛 [Signaler un bug](https://github.com/your-org/speakfree/issues)
- 💬 [Discord communauté](https://discord.gg/speakfree)
- ✉️ support@speakfree.app

## ✅ Checklist de vérification

Avant de commencer le développement :

- [ ] Backend démarre sans erreur
- [ ] Connexion MySQL OK
- [ ] Données de test chargées
- [ ] Super admin peut se connecter
- [ ] École peut se connecter
- [ ] API répond sur /api/health
- [ ] Prisma Studio fonctionne

**Tout est vert ? Parfait, vous êtes prêt à développer ! 🚀**
