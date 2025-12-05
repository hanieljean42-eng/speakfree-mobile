#!/bin/bash

# 🚀 Script de déploiement automatique - SpeakFree
# Ce script configure et déploie l'application sur GitHub

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de SpeakFree sur GitHub"
echo "======================================"

# Vérifier que Git est configuré
if ! git config user.name > /dev/null 2>&1; then
    echo "❌ Git n'est pas configuré. Configurez-le avec:"
    echo "   git config --global user.name \"Votre Nom\""
    echo "   git config --global user.email \"votre@email.com\""
    exit 1
fi

# Variables
GITHUB_USERNAME=""
REPO_NAME="speakfree-mobile"

# Demander le nom d'utilisateur GitHub
read -p "📝 Entrez votre nom d'utilisateur GitHub: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ Le nom d'utilisateur est requis"
    exit 1
fi

# Vérifier si le remote existe déjà
if git remote get-url origin > /dev/null 2>&1; then
    echo "ℹ️  Remote 'origin' existe déjà"
    EXISTING_REMOTE=$(git remote get-url origin)
    echo "   URL actuelle: $EXISTING_REMOTE"
    read -p "   Voulez-vous le remplacer? (y/n): " REPLACE
    if [ "$REPLACE" == "y" ]; then
        git remote remove origin
        git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        echo "✅ Remote mis à jour"
    fi
else
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "✅ Remote ajouté: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
fi

# Vérifier le statut Git
echo ""
echo "📊 Vérification du statut Git..."
git status

# Ajouter les nouveaux fichiers
echo ""
echo "📦 Ajout des fichiers CI/CD..."
git add .github/workflows/
git add backend/Dockerfile.prod
git add backend/.dockerignore
git add docker-compose.prod.yml
git add eas.json
git add DEPLOYMENT.md
git add DATABASE-SETUP.md

# Afficher ce qui va être commité
echo ""
echo "📋 Fichiers à commiter:"
git status --short

# Demander confirmation
read -p "✅ Voulez-vous commiter ces changements? (y/n): " COMMIT

if [ "$COMMIT" == "y" ]; then
    git commit -m "feat: Add CI/CD workflows and deployment configuration

- Add GitHub Actions workflows for backend and mobile
- Add production Dockerfile with multi-stage build
- Add docker-compose.prod.yml for production deployment
- Add EAS configuration for Expo builds
- Add comprehensive deployment documentation
- Add database setup guide"
    
    echo "✅ Commit créé"
    
    # Demander si on push
    read -p "🚀 Voulez-vous pousser vers GitHub? (y/n): " PUSH
    
    if [ "$PUSH" == "y" ]; then
        echo ""
        echo "🔄 Push vers GitHub..."
        git push -u origin main
        
        echo ""
        echo "✅ Déploiement terminé!"
        echo ""
        echo "🎯 Prochaines étapes:"
        echo "1. Aller sur https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings/secrets/actions"
        echo "2. Configurer les secrets (voir DEPLOYMENT.md)"
        echo "3. Créer une branche develop:"
        echo "   git checkout -b develop"
        echo "   git push -u origin develop"
        echo "4. Les workflows CI/CD sont maintenant actifs!"
        echo ""
        echo "📚 Documentation complète: DEPLOYMENT.md"
    else
        echo "ℹ️  Push annulé. Pour pousser plus tard:"
        echo "   git push -u origin main"
    fi
else
    echo "ℹ️  Commit annulé"
fi

echo ""
echo "✨ Script terminé!"
