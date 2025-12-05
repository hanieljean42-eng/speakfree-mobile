# 📘 Documentation Complète - SpeakFree

## Vue d'ensemble du projet

SpeakFree est une application mobile professionnelle permettant aux élèves de signaler anonymement des incidents (harcèlement, violence, discrimination) à leur établissement scolaire, avec suivi en temps réel et discussion sécurisée.

## 🏗️ Architecture globale

```
┌─────────────────┐
│  Mobile App     │ ← Flutter (Android + iOS)
│  (Student UI)   │
└────────┬────────┘
         │
         │ HTTPS/WSS
         ▼
┌─────────────────┐
│   API Gateway   │ ← NestJS Backend
│   + WebSocket   │
└────────┬────────┘
         │
    ┌────┴────┬───────────┬──────────┐
    ▼         ▼           ▼          ▼
┌───────┐ ┌───────┐ ┌─────────┐ ┌───────┐
│ MySQL │ │ Redis │ │  AWS S3 │ │  FCM  │
└───────┘ └───────┘ └─────────┘ └───────┘

┌─────────────────┐
│  Admin Panel    │ ← React/Vue (Web)
│  (School + SA)  │
└─────────────────┘
```

## 📱 Composants du système

### 1. Application Mobile (Flutter)

**Rôle** : Interface utilisateur pour les élèves

**Fonctionnalités** :
- Sélection de l'établissement
- Formulaire de signalement anonyme
- Génération de codes RPT + DSC
- Suivi du signalement
- Discussion anonyme
- Notifications push

**Technologies** :
- Flutter 3.x
- Dart
- Firebase Cloud Messaging
- WebSocket client
- Secure Storage

**Écrans** :
1. Onboarding
2. Sélection établissement
3. Formulaire signalement
4. Confirmation (codes)
5. Suivi (RPT-XXXXX)
6. Discussion (DSC-XXXXX)
7. Paramètres

### 2. Backend API (NestJS)

**Rôle** : Serveur principal gérant la logique métier

**Modules** :
- **Auth** : Authentification JWT (super admin + écoles)
- **Schools** : Gestion des établissements
- **Reports** : Signalements
- **Discussions** : Chat temps réel
- **Stats** : Statistiques
- **Files** : Upload fichiers S3
- **Notifications** : Push FCM
- **Audit** : Logs de sécurité

**Technologies** :
- NestJS 10
- Prisma ORM
- MySQL 8
- Redis (cache + sessions)
- Socket.io (WebSocket)
- AWS SDK (S3)
- Argon2 (hash passwords)
- JWT

### 3. Base de données MySQL

**Tables** :
- `super_admins` : Super administrateurs
- `schools` : Établissements
- `reports` : Signalements
- `messages` : Messages chat
- `files` : Fichiers joints
- `audit_logs` : Logs d'audit
- `password_reset_tokens` : Reset password

**Indexation** :
- Index sur `email`, `status`, `codes`
- Index composites pour performance
- Foreign keys avec CASCADE

### 4. Panel d'administration (React/Vue)

**Deux interfaces** :

**Super Admin** :
- Dashboard global
- Validation des écoles
- Liste de tous les signalements
- Statistiques globales
- Gestion des comptes
- Logs d'audit

**École** :
- Dashboard école
- Signalements reçus
- Discussion avec élèves
- Statistiques internes
- Changement de statut

## 🔐 Sécurité

### Authentification

**Super Admin** :
- Email + Code secret (200700)
- Pas de mot de passe classique
- Accès complet au système

**École** :
- Email + Mot de passe (Argon2)
- Status : PENDING → ACTIVE (après validation SA)
- Accès limité à leurs signalements

**Élève** :
- Aucune authentification requise
- Totalement anonyme
- Utilisation des codes seulement

### Codes de sécurité

**Format** :
- RPT-XXXXX : Suivi signalement (5 char alphanumériques)
- DSC-XXXXX : Discussion (5 char alphanumériques)

**Génération** :
```typescript
import { nanoid } from 'nanoid';

const reportCode = `RPT-${nanoid(5).toUpperCase()}`;
const discussionCode = `DSC-${nanoid(5).toUpperCase()}`;
```

### Protection

- **Rate Limiting** : 100 req/min par IP
- **Helmet** : Headers de sécurité HTTP
- **CORS** : Origines autorisées uniquement
- **JWT** : Tokens avec expiration courte
- **Argon2** : Hash sécurisé des passwords
- **Validation** : class-validator sur tous les inputs
- **Audit** : Logs de toutes les actions sensibles

## 📊 Flux de données

### 1. Création d'un signalement

```
┌────────┐     POST /api/reports     ┌─────────┐
│ Élève  │ ────────────────────────> │   API   │
└────────┘         (anonyme)          └────┬────┘
                                           │
                                           │ 1. Valide données
                                           │ 2. Génère RPT + DSC
                                           │ 3. Crée report + discussion
                                           │ 4. Envoie notification école
                                           │
                                           ▼
                                      ┌─────────┐
                                      │  MySQL  │
                                      └─────────┘
┌────────┐                            ┌─────────┐
│ Élève  │ <──────── RPT + DSC ────── │   API   │
└────────┘                            └─────────┘
```

### 2. Discussion temps réel

```
┌────────┐  WSS connect  ┌──────────┐  Redis  ┌─────────┐
│ Élève  │ ←──────────→  │ Socket.io│ ←──────→│  Queue  │
└────────┘               └────┬─────┘          └─────────┘
                              │
                              │ join_discussion(DSC-XXXXX)
                              │ send_message(content)
                              │
┌────────┐                    │
│ École  │ ←──────────────────┘
└────────┘   new_message event
```

### 3. Validation d'une école

```
┌────────┐  POST /register  ┌─────────┐
│ École  │ ────────────────→ │   API   │
└────────┘                   └────┬────┘
                                  │
                                  │ Status: PENDING
                                  ▼
                             ┌─────────┐
                             │  MySQL  │
                             └─────────┘

┌───────────┐ GET /schools/pending ┌─────────┐
│ SuperAdmin│ ←────────────────────│   API   │
└─────┬─────┘                      └─────────┘
      │
      │ PATCH /schools/:id/status
      ▼
┌─────────┐                        ┌─────────┐
│   API   │ ───→ Status: ACTIVE ──→│  MySQL  │
└─────────┘                        └─────────┘
      │
      │ Envoi email confirmation
      ▼
┌────────┐
│ École  │
└────────┘
```

## 🚀 Déploiement

### Environnement de développement

**Prérequis** :
- Node.js 18+
- MySQL 8
- Redis 7
- Flutter SDK 3.x

**Installation** :
```bash
# Cloner le repo
git clone https://github.com/your-org/speakfree.git
cd speakfree

# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# Mobile
cd ../mobile
flutter pub get
flutter run

# Admin Web
cd ../admin-web
npm install
npm run dev
```

### Environnement de production

**Infrastructure** :
- **Backend** : DigitalOcean App Platform / AWS ECS
- **Database** : Amazon RDS MySQL 8
- **Cache** : Redis Cloud / AWS ElastiCache
- **Storage** : AWS S3
- **CDN** : Cloudflare
- **Monitoring** : Sentry + Grafana

**Docker Compose** :
```bash
# Production
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose logs -f backend

# Backup DB
docker exec speakfree-mysql mysqldump -u root -p speakfree > backup.sql
```

### CI/CD (GitHub Actions)

**Pipeline** :
1. Tests unitaires (Jest)
2. Tests E2E (SuperTest)
3. Build Docker image
4. Push vers Docker Hub
5. Deploy sur serveur
6. Tests de fumée
7. Notification Slack

**Fichier** : `.github/workflows/deploy.yml`

### Publication Mobile

**Android (Google Play)** :
```bash
cd mobile
flutter build appbundle --release
# Upload sur Google Play Console
```

**iOS (App Store)** :
```bash
cd mobile
flutter build ipa --release
# Upload via Xcode ou Transporter
```

## 📈 Monitoring & Logs

### Métriques à surveiller

**Backend** :
- Temps de réponse API (< 200ms)
- Taux d'erreur (< 1%)
- CPU/RAM usage
- Connexions DB actives
- Queue Redis

**Base de données** :
- Queries slow (> 1s)
- Connexions actives
- Espace disque
- Réplication lag

**Application** :
- Crash rate (< 0.1%)
- ANR (Android Not Responding)
- Taux de conversion signalements
- Temps moyen de résolution

### Alertes

**Critiques** :
- API down (> 1 min)
- DB down
- Erreur rate > 5%
- Disk full > 90%

**Warnings** :
- Response time > 500ms
- Error rate > 1%
- Memory > 80%

### Logs

**Structure** :
```json
{
  "timestamp": "2024-12-05T10:30:00Z",
  "level": "info",
  "actor": "SCHOOL",
  "actorId": "uuid",
  "action": "REPORT_STATUS_CHANGED",
  "resource": "REPORT",
  "resourceId": "uuid",
  "metadata": {
    "oldStatus": "PENDING",
    "newStatus": "IN_PROGRESS"
  },
  "ip": "192.168.1.1"
}
```

**Rétention** :
- Logs applicatifs : 30 jours
- Logs audit : 1 an
- Logs sécurité : 2 ans

## 🔄 Maintenance

### Backup base de données

**Automatique** (cron daily) :
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u user -p speakfree | gzip > /backups/speakfree_$DATE.sql.gz
# Garder 30 derniers backups
find /backups -name "speakfree_*.sql.gz" -mtime +30 -delete
```

### Mises à jour

**Dépendances** :
```bash
# Backend
npm audit
npm update

# Mobile
flutter pub outdated
flutter pub upgrade
```

**Base de données** :
```bash
# Nouvelle migration
npx prisma migrate dev --name add_new_field

# Production
npx prisma migrate deploy
```

### Nettoyage

**Données obsolètes** :
```sql
-- Supprimer logs > 90 jours
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Supprimer tokens expirés
DELETE FROM password_reset_tokens WHERE expires_at < NOW();

-- Archiver signalements résolus > 1 an
INSERT INTO reports_archive SELECT * FROM reports 
WHERE status = 'RESOLVED' AND resolved_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## 📞 Support & Contact

**Documentation** : https://docs.speakfree.app
**Support** : support@speakfree.app
**Bugs** : https://github.com/your-org/speakfree/issues

## 📄 Licence

Propriétaire - Tous droits réservés © 2024 SpeakFree
