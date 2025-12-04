#!/bin/bash

echo "🚀 Démarrage du Système de Gestion Blockchain..."
echo ""

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

echo "✅ Docker et Docker Compose sont installés"
echo ""

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

echo ""
echo "🏗️  Construction et démarrage des conteneurs..."
docker-compose up --build -d

echo ""
echo "⏳ Attente du démarrage des services..."
sleep 5

echo ""
echo "✅ Application démarrée avec succès!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 Documentation API: http://localhost:8000/docs"
echo ""
echo "📊 Pour voir les logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Pour arrêter l'application:"
echo "   docker-compose down"
echo ""