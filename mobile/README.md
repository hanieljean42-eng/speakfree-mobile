# SpeakFree Mobile

Application mobile Flutter pour le signalement anonyme.

## 📱 Plateformes supportées

- ✅ Android (API 21+)
- ✅ iOS (iOS 12+)

## 🚀 Installation

### Prérequis

- Flutter SDK 3.16+
- Dart 3.2+
- Android Studio (pour Android)
- Xcode (pour iOS, Mac uniquement)

### Installation des dépendances

```bash
flutter pub get
```

### Configuration

Créer le fichier `lib/config/config.dart` :

```dart
class AppConfig {
  static const String apiBaseUrl = 'http://localhost:3000/api';
  static const String wsUrl = 'ws://localhost:3000';
  static const bool isProduction = false;
}
```

## 🏃 Lancer l'application

### Mode développement

```bash
# Android
flutter run

# iOS
flutter run -d ios

# Web (pour tests)
flutter run -d chrome
```

### Build production

```bash
# Android (AAB pour Play Store)
flutter build appbundle --release

# Android (APK pour distribution)
flutter build apk --release

# iOS (IPA pour App Store)
flutter build ipa --release
```

## 📁 Structure du projet

```
lib/
├── main.dart                 # Point d'entrée
├── config/                   # Configuration
│   ├── config.dart
│   ├── theme.dart
│   └── routes.dart
├── models/                   # Modèles de données
│   ├── school.dart
│   ├── report.dart
│   └── message.dart
├── services/                 # Services API
│   ├── api_service.dart
│   ├── auth_service.dart
│   ├── report_service.dart
│   └── websocket_service.dart
├── providers/                # State management
│   ├── school_provider.dart
│   └── report_provider.dart
├── screens/                  # Écrans
│   ├── home_screen.dart
│   ├── school_selection_screen.dart
│   ├── report_form_screen.dart
│   ├── report_confirmation_screen.dart
│   ├── track_screen.dart
│   └── discussion_screen.dart
├── widgets/                  # Composants réutilisables
│   ├── app_button.dart
│   ├── app_text_field.dart
│   └── loading_indicator.dart
└── utils/                    # Utilitaires
    ├── validators.dart
    └── constants.dart
```

## 🎨 Design

L'application utilise Material Design 3 avec un thème personnalisé :

- **Couleur principale** : #2563EB (Bleu)
- **Couleur secondaire** : #10B981 (Vert)
- **Couleur d'erreur** : #EF4444 (Rouge)

## 🔐 Fonctionnalités

### Élève

1. **Sélection établissement**
   - Liste des écoles disponibles
   - Recherche par nom ou ville

2. **Formulaire de signalement**
   - Type d'incident
   - Date et lieu
   - Description détaillée
   - Témoins (optionnel)
   - Photos (optionnel)

3. **Confirmation**
   - Code RPT (suivi)
   - Code DSC (discussion)
   - Sauvegarde locale sécurisée

4. **Suivi du signalement**
   - État actuel
   - Historique
   - Notifications

5. **Discussion anonyme**
   - Chat temps réel
   - Messages élève ↔ école
   - Indicateur de frappe

### École (via mobile)

- Connexion sécurisée
- Vue des signalements
- Réponse dans les discussions
- Changement de statut

## 📦 Packages utilisés

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # Networking
  http: ^1.1.2
  dio: ^5.4.0
  
  # WebSocket
  socket_io_client: ^2.0.3+1
  
  # Local Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # UI
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  cached_network_image: ^3.3.1
  
  # Utils
  intl: ^0.18.1
  uuid: ^4.2.2
  image_picker: ^1.0.7
  
  # Notifications
  firebase_messaging: ^14.7.10
  flutter_local_notifications: ^16.3.0
```

## 🧪 Tests

```bash
# Tests unitaires
flutter test

# Tests d'intégration
flutter test integration_test/

# Coverage
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
```

## 🚀 Publication

### Android

1. Configurer le keystore :
```bash
keytool -genkey -v -keystore android/app/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias upload
```

2. Créer `android/key.properties` :
```properties
storePassword=<password>
keyPassword=<password>
keyAlias=upload
storeFile=upload-keystore.jks
```

3. Build :
```bash
flutter build appbundle --release
```

4. Upload sur Google Play Console

### iOS

1. Ouvrir Xcode :
```bash
open ios/Runner.xcworkspace
```

2. Configurer le signing
3. Archive → Distribute
4. Upload sur App Store Connect

## 📱 Screenshots

(À ajouter après développement)

## 🐛 Debug

### Logs

```bash
# Afficher les logs
flutter logs

# Logs Android spécifiques
adb logcat

# Logs iOS spécifiques
tail -f ~/Library/Logs/CoreSimulator/...
```

### Problèmes courants

**Build Android échoue** :
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

**Erreur de signature iOS** :
- Vérifier le provisioning profile
- Nettoyer : `flutter clean`
- Reconstruire

## 📄 Licence

Propriétaire - Tous droits réservés
