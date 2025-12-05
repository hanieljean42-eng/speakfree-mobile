# 🧪 Guide de Test API - SpeakFree

## Prérequis

- Backend démarré sur `http://localhost:3000`
- Base de données initialisée avec `npm run prisma:seed`

## 📝 Comptes de Test

| Type | Email | Mot de passe/Code |
|------|-------|-------------------|
| Super Admin | superadmin@speakfree.com | **200700** |
| École (Active) | college.demo@example.com | EcoleDemo123! |
| École (Pending) | lycee.demo@example.com | LyceeDemo123! |

**Codes test** :
- RPT-DEMO1 (suivi)
- DSC-DEMO1 (discussion)

## 🔐 1. Authentification

### Login Super Admin

```powershell
$body = @{
    email = "superadmin@speakfree.com"
    code = "200700"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:3000/api/auth/superadmin/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$response.Content | ConvertFrom-Json

# Sauvegarder le token
$token = ($response.Content | ConvertFrom-Json).accessToken
