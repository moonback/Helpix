#!/bin/bash

# Script de déploiement pour le backend admin
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="entraide-admin-backend"
DOCKER_IMAGE="$PROJECT_NAME:$ENVIRONMENT"

echo "🚀 Déploiement du backend admin - Environnement: $ENVIRONMENT"

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier que Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Vérifier les variables d'environnement
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant"
    echo "Copiez env.example vers .env et configurez vos variables"
    exit 1
fi

echo "📋 Vérification des variables d'environnement..."
source .env

required_vars=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "JWT_SECRET"
    "ADMIN_EMAIL"
    "ADMIN_PASSWORD"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Variable d'environnement manquante: $var"
        exit 1
    fi
done

echo "✅ Variables d'environnement vérifiées"

# Construire l'image Docker
echo "🔨 Construction de l'image Docker..."
docker build -t $DOCKER_IMAGE .

if [ $? -ne 0 ]; then
    echo "❌ Échec de la construction de l'image Docker"
    exit 1
fi

echo "✅ Image Docker construite: $DOCKER_IMAGE"

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
cd docker
docker-compose down

# Démarrer les nouveaux conteneurs
echo "🚀 Démarrage des nouveaux conteneurs..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier la santé de l'application
echo "🏥 Vérification de la santé de l'application..."
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Application en bonne santé"
        break
    else
        echo "⏳ Tentative $attempt/$max_attempts - Attente..."
        sleep 10
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ L'application n'est pas en bonne santé après $max_attempts tentatives"
    echo "📋 Logs des conteneurs:"
    docker-compose logs --tail=50
    exit 1
fi

# Exécuter les migrations si nécessaire
echo "📋 Vérification des migrations..."
docker-compose exec admin-backend npm run migrate

if [ $? -ne 0 ]; then
    echo "⚠️  Erreur lors des migrations, mais le déploiement continue"
fi

# Vérifier les logs
echo "📋 Vérification des logs récents..."
docker-compose logs --tail=20 admin-backend

echo "🎉 Déploiement terminé avec succès!"
echo "🌐 Application accessible sur: http://localhost:3000"
echo "❤️  Santé: http://localhost:3000/health"
echo "📊 API: http://localhost:3000/api/admin"

# Afficher les informations de connexion
echo ""
echo "🔐 Informations de connexion admin:"
echo "Email: $ADMIN_EMAIL"
echo "Mot de passe: $ADMIN_PASSWORD"
echo ""
echo "⚠️  Changez le mot de passe par défaut après la première connexion!"

# Nettoyage des images inutilisées
echo "🧹 Nettoyage des images Docker inutilisées..."
docker image prune -f

echo "✅ Déploiement et nettoyage terminés"
