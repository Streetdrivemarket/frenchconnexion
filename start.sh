#!/bin/bash

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo ""
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo -e "${PURPLE}⚜           FRENCH CONNEXION                  ⚜${NC}"
echo -e "${PURPLE}⚜          Lancement du projet                ⚜${NC}"
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo ""

# Fonction pour tuer les processus à la sortie
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Arrêt des serveurs...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Serveurs arrêtés${NC}"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# 1. Vérifier Node.js
echo -e "${BLUE}🔍 Vérification de Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
echo ""

# 2. Vérifier les dépendances backend
echo -e "${BLUE}📦 Vérification des dépendances backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⏳ Installation des dépendances...${NC}"
    npm install
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${GREEN}✅ Dépendances déjà installées${NC}"
fi
echo ""

# 3. Vérifier la configuration Supabase
echo -e "${BLUE}🗄️  Vérification de la configuration Supabase...${NC}"
if ! grep -q "xxxxxxxxxxxxx" .env 2>/dev/null; then
    echo -e "${GREEN}✅ Supabase configuré${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase n'est pas encore configuré${NC}"
    echo -e "${YELLOW}   → Consulte DEMARRAGE-RAPIDE.md pour la configuration${NC}"
    echo -e "${YELLOW}   Le serveur démarrera mais la création de compte ne fonctionnera pas.${NC}"
fi
echo ""

# 4. Lancer le backend
echo -e "${BLUE}🚀 Démarrage du backend...${NC}"
node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# Vérifier si le backend a démarré
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend démarré (PID: $BACKEND_PID)${NC}"
    echo -e "${GREEN}   📍 http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Erreur lors du démarrage du backend${NC}"
    cat ../backend.log
    exit 1
fi
echo ""

# 5. Retour à la racine et lancer le frontend
cd ..
echo -e "${BLUE}🌐 Démarrage du frontend...${NC}"

# Vérifier quel serveur HTTP est disponible
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}   Utilisation de Python3${NC}"
    cd frontend
    python3 -m http.server 8080 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
elif command -v python &> /dev/null; then
    echo -e "${GREEN}   Utilisation de Python${NC}"
    cd frontend
    python -m SimpleHTTPServer 8080 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
elif command -v php &> /dev/null; then
    echo -e "${GREEN}   Utilisation de PHP${NC}"
    cd frontend
    php -S localhost:8080 > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
else
    echo -e "${YELLOW}   Installation de http-server via npx${NC}"
    cd frontend
    npx http-server -p 8080 --silent > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
fi

sleep 2

# Vérifier si le frontend a démarré
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend démarré (PID: $FRONTEND_PID)${NC}"
    echo -e "${GREEN}   📍 http://localhost:8080${NC}"
else
    echo -e "${RED}❌ Erreur lors du démarrage du frontend${NC}"
    cat frontend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo -e "${GREEN}✨ FRENCH CONNEXION EST EN LIGNE ! ✨${NC}"
echo ""
echo -e "${GREEN}🌍 Frontend : ${BLUE}http://localhost:8080${NC}"
echo -e "${GREEN}🔧 Backend  : ${BLUE}http://localhost:3000${NC}"
echo -e "${GREEN}💚 Health   : ${BLUE}http://localhost:3000/api/health${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Backend  : ${BLUE}tail -f backend.log${NC}"
echo -e "   Frontend : ${BLUE}tail -f frontend.log${NC}"
echo ""
echo -e "${RED}🛑 Pour arrêter : Appuie sur ${YELLOW}Ctrl+C${NC}"
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo ""

# Attendre indéfiniment (les processus tournent en arrière-plan)
wait
