#!/bin/bash

echo "⚜️  FRENCH CONNEXION - Démarrage"
echo ""

# Vérifier si la base de données existe
if [ ! -f "./database/french-connexion.db" ]; then
    echo "📊 Initialisation de la base de données..."
    node database/init.js

    if [ $? -eq 0 ]; then
        echo "✅ Base de données créée avec succès"
    else
        echo "❌ Erreur lors de la création de la base de données"
        exit 1
    fi
else
    echo "✅ Base de données déjà existante"
fi

echo ""
echo "🚀 Démarrage du serveur..."
node server.js
