# SpeakFree Backend API

Backend NestJS pour l'application SpeakFree de signalement anonyme.

## 🚀 Technologies

- **Framework**: NestJS 10
- **Database**: MySQL 8 + Prisma ORM
- **Cache**: Redis
- **Authentication**: JWT + Argon2
- **WebSocket**: Socket.io
- **File Storage**: AWS S3
- **Validation**: class-validator
- **Security**: Helmet, Rate Limiting, CORS

## 📦 Installation

### Prérequis

- Node.js >= 18
- MySQL 8
- Redis 7
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

### Configuration

1. Copier `.env.example` vers `.env` à la racine du projet
2. Configurer les variables d'environnement :

```env
DATABASE_URL=mysql://user:password@localhost:3306/speakfree
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

### Migration de la base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Exécuter les migrations
npm run prisma:migrate

# Seed la base avec des données de test
npm run prisma:seed
```

## 🏃 Démarrage

### Mode développement

```bash
npm run start:dev
```

Le serveur démarre sur `http://localhost:3000`

### Mode production

```bash
npm run build
npm run start:prod
```

### Avec Docker

```bash
# Démarrer tous les services (MySQL + Redis + Backend)
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter
docker-compose down
```

## 📚 API Endpoints

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/superadmin/login` | Connexion super admin (email + code) |
| POST | `/api/auth/school/login` | Connexion établissement |
| POST | `/api/auth/school/register` | Inscription établissement |
| POST | `/api/auth/refresh` | Rafraîchir le token |

### Écoles (Super Admin uniquement)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/schools` | Liste des écoles |
| GET | `/api/schools/pending` | Écoles en attente |
| GET | `/api/schools/:id` | Détails d'une école |
| PATCH | `/api/schools/:id/status` | Approuver/Rejeter école |

### Signalements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/reports` | Créer un signalement (anonyme) |
| GET | `/api/reports/:code` | Suivi avec code RPT |
| GET | `/api/schools/:id/reports` | Signalements d'une école |
| PATCH | `/api/reports/:id/status` | Changer le statut |

### Discussions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/discussions/:code` | Récupérer la discussion (code DSC) |
| GET | `/api/discussions/:code/messages` | Messages de la discussion |
| POST | `/api/discussions/:code/messages` | Envoyer un message |

### WebSocket (Chat temps réel)

```javascript
// Connection
socket.connect('ws://localhost:3000');

// Rejoindre une discussion
socket.emit('join_discussion', { discussionCode: 'DSC-XXXXX' });

// Envoyer un message
socket.emit('send_message', {
  discussionCode: 'DSC-XXXXX',
  content: 'Message...',
  sender: 'STUDENT' // ou 'SCHOOL'
});

// Recevoir un message
socket.on('new_message', (message) => {
  console.log(message);
});
```

### Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/stats/superadmin` | Stats globales (super admin) |
| GET | `/api/stats/schools/:id` | Stats d'une école |

## 🗄️ Structure de la base de données

### Tables principales

- **super_admins** : Super administrateurs
- **schools** : Établissements scolaires
- **reports** : Signalements
- **messages** : Messages de discussion
- **files** : Fichiers joints
- **audit_logs** : Logs d'audit
- **password_reset_tokens** : Tokens de réinitialisation

### Schéma Prisma

Voir `prisma/schema.prisma` pour le schéma complet.

## 🔐 Sécurité

### Authentification

- JWT avec access token (15min) + refresh token (7j)
- Hashage des mots de passe avec Argon2
- Code spécial pour super admin (200700)

### Protection

- Rate limiting (100 req/min par IP)
- Helmet (headers de sécurité)
- CORS configuré
- Validation des inputs
- Logs d'audit pour toutes les actions

### Codes de signalement

- **RPT-XXXXX** : Code de suivi du signalement (5 caractères aléatoires)
- **DSC-XXXXX** : Code de discussion anonyme (5 caractères aléatoires)

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📊 Monitoring

### Prisma Studio (Interface DB)

```bash
npm run prisma:studio
```

Ouvre une interface web sur `http://localhost:5555`

### Logs

Les logs sont automatiquement enregistrés dans la table `audit_logs`.

## 🐳 Docker

### Build l'image

```bash
docker build -t speakfree-backend .
```

### Run le container

```bash
docker run -p 3000:3000 --env-file ../.env speakfree-backend
```

## 📝 Scripts disponibles

```bash
npm run start:dev      # Dev avec hot-reload
npm run build          # Build production
npm run start:prod     # Run production
npm run lint           # ESLint
npm run format         # Prettier
npm run prisma:generate # Générer client Prisma
npm run prisma:migrate  # Migrations
npm run prisma:studio   # Interface DB
npm run prisma:seed     # Seed données de test
npm run test           # Tests
```

## 🔄 Workflow Git

```bash
# Créer une branche
git checkout -b feature/nom-feature

# Commit
git add .
git commit -m "feat: description"

# Push
git push origin feature/nom-feature
```

## 📱 Comptes de test

Après avoir exécuté `npm run prisma:seed` :

### Super Admin
- Email: `superadmin@speakfree.com`
- Code: `200700`

### École de test (Active)
- Email: `college.demo@example.com`
- Password: `EcoleDemo123!`

### École de test (En attente)
- Email: `lycee.demo@example.com`
- Password: `LyceeDemo123!`

### Signalement de test
- Code suivi: `RPT-DEMO1`
- Code discussion: `DSC-DEMO1`

## 🚀 Déploiement

### Variables d'environnement à configurer

```env
NODE_ENV=production
DATABASE_URL=mysql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

### Avec Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Support

Pour toute question, contactez l'équipe SpeakFree.

## 📄 Licence

Propriétaire - Tous droits réservés
