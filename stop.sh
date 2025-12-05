#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo -e "${PURPLE}⚜           FRENCH CONNEXION                  ⚜${NC}"
echo -e "${PURPLE}⚜          Arrêt du projet                    ⚜${NC}"
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo ""

# Arrêter le backend
echo -e "${YELLOW}🛑 Arrêt du backend...${NC}"
pkill -f "node.*server.js" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend arrêté${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun backend en cours d'exécution${NC}"
fi

# Arrêter le frontend
echo -e "${YELLOW}🛑 Arrêt du frontend...${NC}"
pkill -f "python.*8080" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend arrêté${NC}"
else
    echo -e "${YELLOW}⚠️  Aucun frontend en cours d'exécution${NC}"
fi

echo ""
echo -e "${GREEN}✨ FRENCH CONNEXION ARRÊTÉ${NC}"
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo ""
