# SpeakFree - Application de Signalement Anonyme

Application mobile permettant aux élèves d'envoyer des signalements anonymes à leur établissement, avec suivi et discussion sécurisée.

## 🎯 Objectif

Application mobile professionnelle (Android + iOS) avec backend scalable, système d'administration web, base MySQL, chat temps réel, et processus de validation d'établissements supervisé par un super-admin.

## 📱 Plateformes

- **Mobile**: Android & iOS (Flutter)
- **Backend**: NestJS + MySQL + Redis + WebSocket
- **Admin Web**: Panel super-admin + panel établissement
- **Stockage**: AWS S3
- **Notifications**: Firebase Cloud Messaging

## 🏗️ Architecture

```
speakfree/
├── backend/          # API NestJS + MySQL + Redis + WebSocket
├── mobile/           # Application Flutter (Android + iOS)
├── admin-web/        # Panel d'administration web
├── docker/           # Configuration Docker
└── docs/            # Documentation complète
```

## 🚀 Fonctionnalités

### Élève
- Signalement anonyme
- 2 codes (RPT-XXXXX suivi + DSC-XXXXX discussion)
- Suivi d'état en temps réel
- Discussion anonyme avec l'établissement
- Notifications optionnelles

### Établissement
- Inscription + validation super-admin
- Réception des signalements
- Discussion avec élèves (anonyme)
- Gestion des états
- Statistiques internes

### Super Admin
- Validation/rejet des écoles
- Activation/désactivation des admins
- Statistiques globales
- Gestion des signalements abusifs
- Dashboard temps réel

## 🔐 Sécurité

- HTTPS obligatoire
- JWT + refresh tokens
- Hashage Argon2
- Anti-spam & rate limiting
- Logs d'audit
- Protection DDOS (Cloudflare)

## 📊 Base de données

MySQL 8 avec tables :
- schools
- super_admins
- reports
- messages
- audit_logs
- files
- password_reset_tokens

## 🛠️ Technologies

- **Mobile**: Flutter
- **Backend**: Node.js + NestJS + Prisma ORM
- **Database**: MySQL 8
- **Cache**: Redis
- **WebSocket**: Socket.io
- **Storage**: AWS S3
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Prometheus + Grafana

## 📦 Installation

Voir les README spécifiques dans chaque dossier :
- [Backend](./backend/README.md)
- [Mobile](./mobile/README.md)
- [Admin Web](./admin-web/README.md)

## 🚢 Déploiement

- Backend: Docker + Render/DigitalOcean/AWS ECS
- MySQL: Amazon RDS/PlanetScale/DigitalOcean
- Mobile: Google Play Store + Apple App Store

## 📅 Roadmap (7 semaines)

- **S1**: Conception + design + DB + API
- **S2**: Backend base (auth + schools)
- **S3**: Signalements + codes + statistics
- **S4**: Chat WebSocket
- **S5**: Mobile complet
- **S6**: Admin web + super-admin
- **S7**: Tests + Optimisation + Stores

## 📄 Licence

Propriétaire - Tous droits réservés

## 👥 Équipe

Développement: SpeakFree Team
