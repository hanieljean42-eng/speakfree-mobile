# Guide de test de l'intégration Backend ↔ Mobile

## 🎯 Objectif
Tester l'intégration complète entre le backend NestJS et l'application mobile React Native.

## ⚙️ Configuration préalable

### 1. Démarrer le backend
```powershell
cd backend
npm run start:dev
```
Le backend devrait être accessible sur `http://localhost:3000`

### 2. Obtenir l'IP locale de votre machine
```powershell
ipconfig
```
Notez l'adresse IPv4 (ex: `192.168.1.10`)

### 3. Configurer l'URL de l'API dans le mobile

**Fichier: `services/api.service.js`**
```javascript
const API_URL = 'http://192.168.1.10:3000/api'; // Remplacez par VOTRE IP
const TIMEOUT = 30000;
```

**Fichier: `services/discussion.service.js`**
```javascript
const SOCKET_URL = 'http://192.168.1.10:3000'; // Remplacez par VOTRE IP
```

## 🧪 Tests fonctionnels

### Test 1: Connexion backend depuis le mobile

#### A. Tester la connexion de base
```powershell
# Depuis PowerShell, vérifier que le backend répond
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
```

Résultat attendu:
```json
{
  "status": "ok",
  "timestamp": "2024-12-05T...",
  "database": "connected",
  "uptime": 123.45
}
```

#### B. Tester depuis le mobile
1. Lancer l'app mobile: `npm start`
2. Scanner le QR code avec Expo Go
3. L'app devrait charger sans erreur

### Test 2: Flux élève - Création de signalement

#### Étape 1: Sélection d'établissement
1. Sur l'écran d'accueil, cliquer "Faire un signalement"
2. Vérifier que la liste des établissements se charge
3. Rechercher "College Demo"
4. Sélectionner l'établissement

**Requête attendue:**
```
GET http://192.168.1.10:3000/api/schools?status=ACTIVE
```

**Vérifier dans les logs backend:**
```
[SchoolsController] GET /schools?status=ACTIVE
```

#### Étape 2: Remplir le formulaire (4 étapes)
1. **Étape 1** - Sélectionner "Harcèlement"
2. **Étape 2** - Choisir date et lieu (optionnel)
3. **Étape 3** - Écrire description (min 20 caractères)
4. **Étape 4** - Ajouter photos (optionnel, max 5)

#### Étape 3: Soumettre le signalement
1. Cliquer "Envoyer le signalement"
2. Vérifier que les codes RPT et DSC s'affichent

**Requête attendue:**
```
POST http://192.168.1.10:3000/api/reports
Body: {
  "schoolId": 1,
  "type": "HARASSMENT",
  "description": "...",
  "incidentDate": "2024-12-05T...",
  "place": "...",
  "witnesses": "..."
}
```

**Réponse attendue:**
```json
{
  "success": true,
  "report": {
    "id": 1,
    "reportCode": "RPT-XXXXX",
    "discussionCode": "DSC-XXXXX",
    "type": "HARASSMENT",
    "status": "PENDING"
  }
}
```

**Vérifier dans les logs backend:**
```
[ReportsController] POST /reports
[ReportsService] Creating report for school 1
[AuditService] Report created: RPT-XXXXX
```

#### Étape 4: Noter les codes
⚠️ **IMPORTANT** : Noter quelque part le code RPT-XXXXX et DSC-XXXXX

### Test 3: Suivi du signalement

1. Retour à l'accueil → "Suivre mon signalement"
2. Entrer le code RPT-XXXXX noté précédemment
3. Cliquer "Rechercher"
4. Vérifier que les détails du signalement s'affichent

**Requête attendue:**
```
GET http://192.168.1.10:3000/api/reports/track/RPT-XXXXX
```

**Réponse attendue:**
```json
{
  "success": true,
  "report": {
    "reportCode": "RPT-XXXXX",
    "discussionCode": "DSC-XXXXX",
    "type": "HARASSMENT",
    "status": "PENDING",
    "school": {
      "name": "Collège Démo"
    },
    "createdAt": "..."
  }
}
```

### Test 4: Discussion anonyme (WebSocket)

#### A. Connexion WebSocket

1. Depuis l'écran de suivi, cliquer "Ouvrir la discussion"
2. Observer les logs backend pour la connexion WebSocket

**Logs backend attendus:**
```
[DiscussionsGateway] Client connected
[DiscussionsGateway] Client joined discussion: DSC-XXXXX
```

**Logs console mobile attendus:**
```
WebSocket connected
Joined discussion: { discussionCode: 'DSC-XXXXX' }
```

#### B. Envoi de message (élève → école)

1. Écrire "Bonjour, j'ai besoin d'aide" dans le champ
2. Cliquer envoyer
3. Le message devrait apparaître immédiatement

**Événement WebSocket émis:**
```javascript
{
  event: 'send_message',
  data: {
    discussionCode: 'DSC-XXXXX',
    content: 'Bonjour, j\'ai besoin d\'aide',
    sender: 'STUDENT'
  }
}
```

**Logs backend:**
```
[DiscussionsGateway] Message received in DSC-XXXXX
[DiscussionsService] Saving message from STUDENT
[NotificationsService] Notifying new message to school
```

#### C. Indicateur "en train d'écrire"

1. Commencer à taper un message
2. Attendre 1 seconde
3. Le backend devrait recevoir l'événement `typing`

**Événement WebSocket:**
```javascript
{
  event: 'typing',
  data: {
    discussionCode: 'DSC-XXXXX',
    sender: 'STUDENT'
  }
}
```

### Test 5: Connexion établissement

#### A. Login établissement

1. Revenir à l'écran d'accueil → "Espace établissement"
2. Entrer les identifiants de test:
   - Email: `college.demo@example.com`
   - Mot de passe: `EcoleDemo123!`
3. Cliquer "Se connecter"

**Requête attendue:**
```
POST http://192.168.1.10:3000/api/auth/school/login
Body: {
  "email": "college.demo@example.com",
  "password": "EcoleDemo123!"
}
```

**Réponse attendue:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "school": {
    "id": 1,
    "name": "Collège Démo",
    "email": "college.demo@example.com",
    "status": "ACTIVE"
  }
}
```

**Vérifier:**
- Le token est stocké dans AsyncStorage
- Redirection vers SchoolDashboard
- Le nom de l'école s'affiche dans le header

#### B. Tableau de bord établissement

1. Vérifier que le signalement créé apparaît dans la liste
2. Vérifier les statistiques:
   - Total signalements: 1
   - En attente: 1
   - En cours: 0

**Requête attendue:**
```
GET http://192.168.1.10:3000/api/reports/school/1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### C. Changement de statut

1. Cliquer sur le signalement
2. Changer le statut de "En attente" → "En cours"
3. Ajouter un message: "Nous avons pris en compte votre signalement"

**Requête attendue:**
```
PATCH http://192.168.1.10:3000/api/reports/1/status
Authorization: Bearer ...
Body: {
  "status": "IN_PROGRESS",
  "message": "Nous avons pris en compte votre signalement"
}
```

**Vérifier:**
- Le badge de statut change de couleur
- Le message est envoyé dans la discussion

#### D. Discussion côté école

1. Ouvrir la discussion depuis le signalement
2. Voir les messages de l'élève
3. Envoyer une réponse: "Bonjour, nous allons enquêter"

**Événement WebSocket:**
```javascript
{
  event: 'send_message',
  data: {
    discussionCode: 'DSC-XXXXX',
    content: 'Bonjour, nous allons enquêter',
    sender: 'SCHOOL'
  }
}
```

### Test 6: Communication bidirectionnelle temps réel

#### Configuration:
- 2 appareils ou 1 appareil + navigateur web

#### Scénario:
1. **Appareil 1 (Élève)** : Ouvrir discussion avec DSC-XXXXX
2. **Appareil 2 (École)** : Se connecter et ouvrir même discussion
3. **Élève** : Envoyer "Test message 1"
4. **École** : Devrait recevoir le message instantanément
5. **École** : Envoyer "Test message 2"
6. **Élève** : Devrait recevoir le message instantanément

**Vérifier:**
- Messages apparaissent sans rafraîchir
- Indicateurs "en train d'écrire" fonctionnent
- Messages sont marqués comme lus

### Test 7: Upload de photos

1. Créer un nouveau signalement
2. À l'étape 4, cliquer "Ajouter" photo
3. Sélectionner une photo de la galerie
4. Vérifier que la miniature s'affiche
5. Soumettre le signalement

**Requête attendue:**
```
POST http://192.168.1.10:3000/api/files/upload/1
Content-Type: multipart/form-data
Authorization: Bearer ...
```

**Vérifier dans les logs:**
```
[FilesController] Uploading file for report 1
[FilesService] File uploaded to S3: reports/1/xxxxx.jpg
```

### Test 8: Gestion d'erreurs

#### A. Backend indisponible
1. Arrêter le backend: `Ctrl+C`
2. Dans l'app mobile, tenter de charger les écoles
3. Vérifier le message d'erreur: "Impossible de contacter le serveur"

#### B. Token expiré
1. Se connecter en tant qu'école
2. Attendre 15 minutes (expiration du token)
3. Tenter une action (ex: charger signalements)
4. Le refresh token devrait être automatiquement utilisé
5. L'action devrait réussir sans que l'utilisateur s'en aperçoive

**Vérifier dans les logs:**
```
[ApiService] Token expired, refreshing...
[ApiService] Token refreshed successfully
[ApiService] Retrying original request
```

#### C. Mauvais identifiants
1. Tenter de se connecter avec:
   - Email: `test@test.com`
   - Mot de passe: `wrongpassword`
2. Vérifier le message: "Email ou mot de passe incorrect"

## 📊 Checklist de validation

### Connexion & Authentification
- [ ] Backend accessible depuis le mobile
- [ ] Health check répond
- [ ] Login établissement fonctionne
- [ ] Token JWT stocké
- [ ] Refresh token automatique fonctionne
- [ ] Logout supprime les tokens

### Signalements
- [ ] Liste des écoles se charge
- [ ] Recherche d'école fonctionne
- [ ] Formulaire en 4 étapes valide les données
- [ ] Upload de photos fonctionne
- [ ] Codes RPT/DSC générés
- [ ] Codes sauvegardés localement
- [ ] Suivi avec code RPT fonctionne

### Discussion
- [ ] WebSocket se connecte
- [ ] Messages envoyés instantanément
- [ ] Messages reçus instantanément
- [ ] Indicateur "en train d'écrire" fonctionne
- [ ] Messages marqués comme lus
- [ ] Séparation par dates affichée

### Dashboard École
- [ ] Statistiques affichées correctement
- [ ] Liste des signalements chargée
- [ ] Filtres fonctionnent
- [ ] Changement de statut fonctionne
- [ ] Pull-to-refresh fonctionne

### Gestion d'erreurs
- [ ] Backend indisponible géré
- [ ] Token expiré géré automatiquement
- [ ] Mauvais identifiants affichés
- [ ] Validation des formulaires
- [ ] Messages d'erreur clairs

## 🐛 Problèmes courants

### Le mobile ne peut pas se connecter au backend

**Symptôme:** Erreur "Network request failed"

**Solutions:**
1. Vérifier que backend est démarré
2. Utiliser l'IP locale (pas localhost)
3. Vérifier le firewall Windows:
   ```powershell
   New-NetFirewallRule -DisplayName "Node.js" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
   ```
4. Tester avec curl:
   ```powershell
   curl http://192.168.1.10:3000/api/health
   ```

### WebSocket ne se connecte pas

**Symptôme:** "WebSocket disconnected" dans les logs

**Solutions:**
1. Vérifier CORS dans `backend/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: true, // Permet toutes les origines en dev
     credentials: true,
   });
   ```
2. Vérifier Socket.io gateway:
   ```typescript
   @WebSocketGateway({
     cors: { origin: '*' }, // Dev uniquement
   })
   ```

### Photos ne s'uploadent pas

**Symptôme:** Erreur 413 "Payload too large"

**Solutions:**
1. Réduire la qualité dans `ReportFormScreen.js`:
   ```javascript
   quality: 0.5, // Au lieu de 0.8
   maxWidth: 1280,
   maxHeight: 1280,
   ```

### Token refresh en boucle

**Symptôme:** Logs répétés de refresh token

**Solutions:**
1. Vérifier que les tokens sont bien sauvegardés:
   ```javascript
   await AsyncStorage.getItem('access_token')
   await AsyncStorage.getItem('refresh_token')
   ```
2. Vérifier les dates d'expiration dans le backend

## 📈 Métriques de performance

### Temps de réponse acceptable
- Health check: < 100ms
- Login: < 500ms
- Liste écoles: < 1s
- Création signalement: < 2s
- Upload photo: < 5s
- Message WebSocket: < 100ms

### Utilisation mémoire
- Au démarrage: ~100MB
- Avec 50 signalements: ~150MB
- Avec 100 messages: ~180MB

## ✅ Résultat attendu

Si tous les tests passent, vous devriez pouvoir:
1. ✅ Créer un signalement anonyme depuis le mobile
2. ✅ Recevoir les codes RPT/DSC
3. ✅ Suivre le signalement avec le code
4. ✅ Discuter en temps réel avec l'établissement
5. ✅ Se connecter en tant qu'établissement
6. ✅ Voir et gérer les signalements
7. ✅ Répondre dans la discussion
8. ✅ Changer les statuts

**Félicitations ! L'intégration backend ↔ mobile fonctionne parfaitement ! 🎉**
