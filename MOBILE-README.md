# Application Mobile SpeakFree - React Native

## 📱 Structure de l'application

Cette application mobile utilise **React Native avec Expo** pour permettre aux élèves de signaler anonymement des situations de harcèlement, violence ou discrimination.

## 🏗️ Architecture

### Écrans (screens/)
- ✅ **SplashScreen** - Écran de démarrage avec vérification d'authentification
- ✅ **HomeScreen** - Page d'accueil avec présentation des fonctionnalités
- ✅ **SchoolSelectionScreen** - Recherche et sélection d'établissement
- ✅ **ReportFormScreen** - Formulaire de signalement en 4 étapes
- ✅ **ReportConfirmationScreen** - Confirmation avec codes RPT/DSC
- ✅ **TrackReportScreen** - Suivi du signalement avec code RPT
- ✅ **DiscussionScreen** - Chat anonyme en temps réel (WebSocket)
- ✅ **LoginScreen** - Connexion établissement
- ✅ **SchoolDashboardScreen** - Tableau de bord établissement

### Composants (components/)
- ✅ **Button** - Boutons réutilisables (primary, secondary, outline)
- ✅ **Input** - Champs de saisie avec validation
- ✅ **Card** - Cartes avec variantes
- ✅ **Badge** - Badges de statut
- ✅ **Loading** - Indicateur de chargement
- ✅ **EmptyState** - État vide

### Services (services/)
- ✅ **api.service.js** - Client Axios avec intercepteurs (auto-refresh JWT)
- ✅ **auth.service.js** - Authentification, inscription, logout
- ✅ **report.service.js** - Création, suivi, gestion signalements
- ✅ **discussion.service.js** - WebSocket + REST pour chat
- ✅ **school.service.js** - Gestion établissements

### Navigation (navigation/)
- ✅ **AppNavigator.js** - Configuration React Navigation Stack

### Thème (constants/)
- ✅ **theme.js** - Couleurs, tailles, typographie

## 🚀 Installation

### Prérequis
```powershell
# Node.js 16+ requis
node --version

# Installer Expo CLI globalement
npm install -g expo-cli
```

### 1. Installer les dépendances
```powershell
cd mobile
npm install
```

### 2. Configurer l'API
Modifiez `services/api.service.js` pour pointer vers votre backend :
```javascript
const API_URL = 'http://192.168.1.X:3000/api'; // Remplacez par l'IP de votre machine
const SOCKET_URL = 'http://192.168.1.X:3000';
```

⚠️ **Important** : N'utilisez PAS `localhost` sur mobile, utilisez l'IP locale de votre machine.

### 3. Lancer l'application

#### Sur téléphone physique (recommandé)
```powershell
npm start
```
- Installez **Expo Go** sur votre téléphone
- Scannez le QR code affiché
- L'app se lancera automatiquement

#### Sur émulateur Android
```powershell
npm run android
```

#### Sur simulateur iOS (Mac uniquement)
```powershell
npm run ios
```

## 📦 Dépendances principales

- **expo** ~49.0.0 - Framework React Native
- **@react-navigation/native** ^6.1.7 - Navigation
- **@react-navigation/stack** ^6.3.17 - Stack Navigator
- **axios** ^1.4.0 - Client HTTP
- **socket.io-client** ^4.7.2 - WebSocket temps réel
- **@react-native-async-storage/async-storage** - Stockage local
- **expo-image-picker** - Sélection photos
- **@react-native-community/datetimepicker** - Sélecteur de date

## 🔧 Configuration

### Permissions Android (app.json)
```json
"permissions": [
  "READ_EXTERNAL_STORAGE",
  "WRITE_EXTERNAL_STORAGE",
  "CAMERA"
]
```

### Permissions iOS (app.json)
```json
"infoPlist": {
  "NSPhotoLibraryUsageDescription": "L'application a besoin d'accéder à vos photos pour joindre des fichiers.",
  "NSCameraUsageDescription": "L'application a besoin d'accéder à votre caméra pour prendre des photos."
}
```

## 🎨 Thème personnalisable

Modifiez `constants/theme.js` pour personnaliser :
- Couleurs (primary, secondary, success, warning, error)
- Tailles (padding, radius, fonts)
- Typographie (h1, h2, h3, body1, body2, etc.)

## 🔐 Fonctionnalités implémentées

### Pour les élèves (flux anonyme)
- ✅ Sélection d'établissement avec recherche
- ✅ Création de signalement en 4 étapes
- ✅ Upload de photos (max 5, 5MB, JPEG/PNG)
- ✅ Génération codes RPT-XXXXX et DSC-XXXXX
- ✅ Sauvegarde locale des codes
- ✅ Suivi du signalement avec code RPT
- ✅ Discussion anonyme temps réel avec WebSocket
- ✅ Indicateurs "en train d'écrire"
- ✅ Messages lus/non lus

### Pour les établissements
- ✅ Connexion avec email/mot de passe
- ✅ Tableau de bord avec statistiques
- ✅ Liste des signalements avec filtres
- ✅ Changement de statut (En attente → En cours → Résolu)
- ✅ Discussion avec l'élève anonyme
- ✅ Déconnexion

## 🧪 Tests

### Comptes de test
```
Super Admin:
- Email: superadmin@speakfree.com
- Code: 200700

École Demo:
- Email: college.demo@example.com
- Mot de passe: EcoleDemo123!
```

### Test du flux complet
1. **Élève** : Créer un signalement → Noter les codes RPT/DSC
2. **Établissement** : Se connecter → Voir le signalement → Changer statut
3. **Élève** : Suivre avec code RPT → Ouvrir discussion
4. **Les deux** : Échanger des messages en temps réel

## 📱 Écrans et flux

```
Splash → Home
         ├─→ SchoolSelection → ReportForm (4 étapes) → ReportConfirmation
         │                                               └─→ Discussion
         ├─→ TrackReport → Discussion
         └─→ Login → SchoolDashboard → ReportDetail → Discussion
```

## 🐛 Résolution de problèmes

### Erreur "Unable to resolve module"
```powershell
npm install
expo start -c  # Clear cache
```

### WebSocket ne se connecte pas
- Vérifiez que le backend est démarré
- Utilisez l'IP locale au lieu de localhost
- Vérifiez le firewall Windows

### Photos ne s'uploadent pas
- Vérifiez les permissions dans app.json
- Testez d'abord avec expo-image-picker seul
- Vérifiez la taille (max 5MB) et le format (JPEG/PNG)

### Erreur JWT/Auth
- Vérifiez que les tokens sont bien stockés (AsyncStorage)
- Testez le refresh token automatique
- Vérifiez les dates d'expiration

## 📂 Structure des fichiers

```
mobile/
├── App.js                      # Point d'entrée principal
├── app.json                    # Configuration Expo
├── babel.config.js             # Configuration Babel
├── package.json                # Dépendances
├── assets/                     # Images, icônes
├── components/                 # Composants réutilisables
│   ├── Button.js
│   ├── Input.js
│   ├── Card.js
│   ├── Badge.js
│   ├── Loading.js
│   └── EmptyState.js
├── constants/                  # Constantes (thème)
│   └── theme.js
├── navigation/                 # Configuration navigation
│   └── AppNavigator.js
├── screens/                    # Écrans de l'app
│   ├── SplashScreen.js
│   ├── HomeScreen.js
│   ├── SchoolSelectionScreen.js
│   ├── ReportFormScreen.js
│   ├── ReportConfirmationScreen.js
│   ├── TrackReportScreen.js
│   ├── DiscussionScreen.js
│   ├── LoginScreen.js
│   └── SchoolDashboardScreen.js
└── services/                   # Services API
    ├── api.service.js
    ├── auth.service.js
    ├── report.service.js
    ├── discussion.service.js
    └── school.service.js
```

## 🔄 Intégration avec le backend

### API REST utilisées
- `POST /auth/school/login` - Connexion établissement
- `POST /reports` - Créer signalement
- `GET /reports/track/:code` - Suivre signalement
- `GET /reports/school/:schoolId` - Liste signalements école
- `PATCH /reports/:id/status` - Changer statut
- `GET /discussions/:code/messages` - Obtenir messages
- `POST /discussions/:code/messages` - Envoyer message
- `POST /files/upload/:reportId` - Upload fichier
- `GET /schools?status=ACTIVE` - Liste établissements

### WebSocket (Socket.io)
- **Événements émis** : `join_discussion`, `send_message`, `typing`, `stop_typing`
- **Événements reçus** : `new_message`, `user_typing`, `user_stopped_typing`, `status_changed`

## 📈 Prochaines étapes

- [ ] Tests unitaires avec Jest
- [ ] Tests E2E avec Detox
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Mode sombre
- [ ] Localisation (i18n)
- [ ] Analytics (Firebase Analytics)
- [ ] Crash reporting (Sentry)
- [ ] Build production (EAS Build)
- [ ] Publication stores (App Store, Google Play)

## 📝 Notes importantes

- **Anonymat** : Aucune donnée personnelle n'est collectée pour les signalements élèves
- **Sécurité** : JWT avec refresh automatique, HTTPS en production
- **Performance** : WebSocket pour temps réel, AsyncStorage pour cache local
- **UX** : Indicateurs de chargement, gestion d'erreurs, feedback utilisateur

## 🤝 Contribution

1. Créer une branche : `git checkout -b feature/nouvelle-fonctionnalite`
2. Commit : `git commit -am 'Ajout nouvelle fonctionnalité'`
3. Push : `git push origin feature/nouvelle-fonctionnalite`
4. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.
