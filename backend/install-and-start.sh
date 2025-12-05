#!/bin/bash

# Script d'installation et lancement automatique
# French Connexion Platform

echo "⚜️  FRENCH CONNEXION - Installation & Lancement"
echo "================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Étape 1 : Installation des dépendances
echo -e "${BLUE}📦 Étape 1/4 : Installation des dépendances...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dépendances installées avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation${NC}"
    exit 1
fi
echo ""

# Étape 2 : Configuration
echo -e "${BLUE}🔑 Étape 2/4 : Configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Création du fichier .env...${NC}"
    cp .env.example .env

    # Générer JWT_SECRET
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
        sed -i "s|JWT_SECRET=votre_secret_jwt_super_securise_ici|JWT_SECRET=$JWT_SECRET|g" .env
        echo -e "${GREEN}✅ JWT_SECRET généré automatiquement${NC}"
    else
        echo -e "${YELLOW}⚠️  Génère un JWT_SECRET manuellement dans .env${NC}"
    fi

    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}⚠️  IMPORTANT : Configure tes clés Stripe TEST !${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. Va sur https://stripe.com et crée un compte"
    echo "2. Active le mode TEST"
    echo "3. Va dans Developers → API Keys"
    echo "4. Copie les clés TEST dans backend/.env :"
    echo "   - STRIPE_SECRET_KEY=sk_test_..."
    echo "   - STRIPE_PUBLISHABLE_KEY=pk_test_..."
    echo ""
    echo "5. Copie aussi la clé publique dans frontend/js/config.js"
    echo ""
    echo -e "${YELLOW}Appuie sur ENTRÉE quand c'est fait...${NC}"
    read
else
    echo -e "${GREEN}✅ Fichier .env déjà présent${NC}"
fi
echo ""

# Étape 3 : Base de données
echo -e "${BLUE}🗄️  Étape 3/4 : Initialisation de la base de données...${NC}"
if [ ! -f "../database/french-connexion.db" ]; then
    npm run init-db
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Base de données créée avec succès${NC}"
    else
        echo -e "${RED}❌ Erreur lors de la création de la BDD${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Base de données déjà existante${NC}"
fi
echo ""

# Étape 4 : Démarrage
echo -e "${BLUE}🚀 Étape 4/4 : Démarrage du serveur...${NC}"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ INSTALLATION TERMINÉE !${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📋 Maintenant :${NC}"
echo ""
echo -e "${YELLOW}1. Ce terminal - Backend va démarrer...${NC}"
echo ""
echo -e "${YELLOW}2. Ouvre un NOUVEAU terminal et lance :${NC}"
echo "   cd $(dirname $(pwd))/frontend"
echo "   python3 -m http.server 8080"
echo ""
echo -e "${GREEN}🌐 URLs :${NC}"
echo "   Frontend : http://localhost:8080"
echo "   Backend  : http://localhost:3000"
echo ""
echo -e "${YELLOW}Démarrage du backend dans 3 secondes...${NC}"
sleep 3
echo ""

# Démarrer le serveur
npm start
