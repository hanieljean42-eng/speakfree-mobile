# 🚀 Script de déploiement automatique - SpeakFree
# Ce script configure et déploie l'application sur GitHub

Write-Host "🚀 Déploiement de SpeakFree sur GitHub" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Git est configuré
try {
    $gitUser = git config user.name
    if (-not $gitUser) {
        throw "Git non configuré"
    }
} catch {
    Write-Host "❌ Git n'est pas configuré. Configurez-le avec:" -ForegroundColor Red
    Write-Host "   git config --global user.name `"Votre Nom`"" -ForegroundColor Yellow
    Write-Host "   git config --global user.email `"votre@email.com`"" -ForegroundColor Yellow
    exit 1
}

# Variables
$REPO_NAME = "speakfree-mobile"

# Demander le nom d'utilisateur GitHub
$GITHUB_USERNAME = Read-Host "📝 Entrez votre nom d'utilisateur GitHub"

if ([string]::IsNullOrWhiteSpace($GITHUB_USERNAME)) {
    Write-Host "❌ Le nom d'utilisateur est requis" -ForegroundColor Red
    exit 1
}

# Vérifier si le remote existe déjà
try {
    $existingRemote = git remote get-url origin 2>$null
    if ($existingRemote) {
        Write-Host "ℹ️  Remote 'origin' existe déjà" -ForegroundColor Yellow
        Write-Host "   URL actuelle: $existingRemote" -ForegroundColor Gray
        $replace = Read-Host "   Voulez-vous le remplacer? (y/n)"
        if ($replace -eq "y") {
            git remote remove origin
            git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
            Write-Host "✅ Remote mis à jour" -ForegroundColor Green
        }
    }
} catch {
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    Write-Host "✅ Remote ajouté: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" -ForegroundColor Green
}

# Vérifier le statut Git
Write-Host ""
Write-Host "📊 Vérification du statut Git..." -ForegroundColor Cyan
git status

# Ajouter les nouveaux fichiers
Write-Host ""
Write-Host "📦 Ajout des fichiers CI/CD..." -ForegroundColor Cyan
git add .github/workflows/
git add backend/Dockerfile.prod
git add backend/.dockerignore
git add docker-compose.prod.yml
git add eas.json
git add DEPLOYMENT.md
git add DATABASE-SETUP.md
git add deploy-to-github.sh
git add deploy-to-github.ps1

# Afficher ce qui va être commité
Write-Host ""
Write-Host "📋 Fichiers à commiter:" -ForegroundColor Cyan
git status --short

# Demander confirmation
$commit = Read-Host "✅ Voulez-vous commiter ces changements? (y/n)"

if ($commit -eq "y") {
    git commit -m "feat: Add CI/CD workflows and deployment configuration

- Add GitHub Actions workflows for backend and mobile
- Add production Dockerfile with multi-stage build
- Add docker-compose.prod.yml for production deployment
- Add EAS configuration for Expo builds
- Add comprehensive deployment documentation
- Add database setup guide
- Add automated deployment scripts"
    
    Write-Host "✅ Commit créé" -ForegroundColor Green
    
    # Demander si on push
    $push = Read-Host "🚀 Voulez-vous pousser vers GitHub? (y/n)"
    
    if ($push -eq "y") {
        Write-Host ""
        Write-Host "🔄 Push vers GitHub..." -ForegroundColor Cyan
        
        try {
            git push -u origin main
            
            Write-Host ""
            Write-Host "✅ Déploiement terminé!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
            Write-Host "1. Aller sur https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/secrets/actions" -ForegroundColor White
            Write-Host "2. Configurer les secrets (voir DEPLOYMENT.md)" -ForegroundColor White
            Write-Host "3. Créer une branche develop:" -ForegroundColor White
            Write-Host "   git checkout -b develop" -ForegroundColor Gray
            Write-Host "   git push -u origin develop" -ForegroundColor Gray
            Write-Host "4. Les workflows CI/CD sont maintenant actifs!" -ForegroundColor White
            Write-Host ""
            Write-Host "📚 Documentation complète: DEPLOYMENT.md" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "🌐 Votre repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME" -ForegroundColor Magenta
        } catch {
            Write-Host ""
            Write-Host "❌ Erreur lors du push. Vérifiez que:" -ForegroundColor Red
            Write-Host "   - Le repository existe sur GitHub" -ForegroundColor Yellow
            Write-Host "   - Vous avez les droits d'accès" -ForegroundColor Yellow
            Write-Host "   - Vous êtes authentifié (utilisez 'gh auth login')" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Pour créer le repository, allez sur:" -ForegroundColor Yellow
            Write-Host "https://github.com/new" -ForegroundColor Cyan
            exit 1
        }
    } else {
        Write-Host "ℹ️  Push annulé. Pour pousser plus tard:" -ForegroundColor Yellow
        Write-Host "   git push -u origin main" -ForegroundColor Gray
    }
} else {
    Write-Host "ℹ️  Commit annulé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Script terminé!" -ForegroundColor Green
