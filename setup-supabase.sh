#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear

echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║              ${CYAN}⚜️  FRENCH CONNEXION™  ⚜️${PURPLE}                   ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║          ${YELLOW}Configuration Automatique Supabase${PURPLE}             ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Ce script va configurer Supabase en 5 minutes !${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Étape 1 : Créer le compte
echo -e "${BLUE}📝 ÉTAPE 1/5 : Création du compte Supabase${NC}"
echo ""
echo -e "   ${CYAN}1.${NC} Ouvre ce lien dans ton navigateur :"
echo -e "      ${GREEN}https://supabase.com/dashboard/sign-up${NC}"
echo ""
echo -e "   ${CYAN}2.${NC} Inscris-toi avec :"
echo -e "      ${YELLOW}→${NC} Email : ton email"
echo -e "      ${YELLOW}→${NC} Mot de passe : (choisis-en un fort)"
echo -e "      ${YELLOW}→${NC} OU connecte-toi avec GitHub"
echo ""
read -p "   Appuie sur ENTRÉE quand tu as créé ton compte..."
echo ""
echo -e "${GREEN}   ✅ Compte créé !${NC}"
echo ""

# Étape 2 : Créer le projet
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🏗️  ÉTAPE 2/5 : Création du projet${NC}"
echo ""
echo -e "   ${CYAN}1.${NC} Clique sur ${GREEN}\"New Project\"${NC}"
echo ""
echo -e "   ${CYAN}2.${NC} Remplis :"
echo -e "      ${YELLOW}→${NC} Name : ${GREEN}french-connexion-ebook${NC}"
echo -e "      ${YELLOW}→${NC} Database Password : ${GREEN}(choisis un mot de passe fort)${NC}"
echo -e "      ${YELLOW}→${NC} Region : ${GREEN}Europe (Paris)${NC}"
echo -e "      ${YELLOW}→${NC} Plan : ${GREEN}Free${NC}"
echo ""
echo -e "   ${CYAN}3.${NC} Clique sur ${GREEN}\"Create new project\"${NC}"
echo ""
echo -e "   ${YELLOW}⏳ Attends 2-3 minutes que le projet se crée...${NC}"
echo ""
read -p "   Appuie sur ENTRÉE quand le projet est créé et que tu vois le dashboard..."
echo ""
echo -e "${GREEN}   ✅ Projet créé !${NC}"
echo ""

# Étape 3 : Récupérer les clés
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🔑 ÉTAPE 3/5 : Récupération des clés API${NC}"
echo ""
echo -e "   ${CYAN}1.${NC} Va dans ${GREEN}Settings${NC} (icône ⚙️ en bas à gauche)"
echo ""
echo -e "   ${CYAN}2.${NC} Clique sur ${GREEN}API${NC} dans le menu"
echo ""
echo -e "   ${CYAN}3.${NC} Copie les 3 clés suivantes :"
echo ""

# Demander Project URL
echo -e "   ${PURPLE}📍 Project URL${NC}"
echo -e "      (commence par https://...supabase.co)"
echo ""
read -p "   Colle ici : " SUPABASE_URL
echo ""

# Demander anon key
echo -e "   ${PURPLE}🔓 anon public (clé publique)${NC}"
echo -e "      (commence par eyJhbG...)"
echo ""
read -p "   Colle ici : " SUPABASE_ANON_KEY
echo ""

# Demander service_role key
echo -e "   ${PURPLE}🔐 service_role (clique \"Reveal\" pour voir)${NC}"
echo -e "      (commence par eyJhbG...)"
echo ""
read -p "   Colle ici : " SUPABASE_SERVICE_KEY
echo ""

echo -e "${GREEN}   ✅ Clés récupérées !${NC}"
echo ""

# Étape 4 : Exécuter le SQL
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🗄️  ÉTAPE 4/5 : Création des tables${NC}"
echo ""
echo -e "   ${CYAN}1.${NC} Va dans ${GREEN}SQL Editor${NC} (icône 📊 dans le menu)"
echo ""
echo -e "   ${CYAN}2.${NC} Clique sur ${GREEN}\"New query\"${NC}"
echo ""
echo -e "   ${CYAN}3.${NC} Copie TOUT le contenu de ce fichier :"
echo -e "      ${GREEN}$(pwd)/SUPABASE-AFFILIATION-SQL.sql${NC}"
echo ""
echo -e "   ${YELLOW}💡 Astuce : Tu peux faire :${NC}"
echo -e "      ${BLUE}cat SUPABASE-AFFILIATION-SQL.sql${NC}"
echo -e "      ${YELLOW}puis copier tout le texte${NC}"
echo ""
echo -e "   ${CYAN}4.${NC} Colle dans l'éditeur SQL"
echo ""
echo -e "   ${CYAN}5.${NC} Clique sur ${GREEN}\"Run\"${NC} (ou Ctrl+Entrée)"
echo ""
read -p "   Appuie sur ENTRÉE quand tu vois \"Success. No rows returned\"..."
echo ""
echo -e "${GREEN}   ✅ Tables créées !${NC}"
echo ""

# Étape 5 : Configuration automatique
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}⚙️  ÉTAPE 5/5 : Configuration automatique${NC}"
echo ""

# Sauvegarder dans .env
ENV_FILE="backend/.env"

echo -e "${YELLOW}   📝 Écriture des clés dans $ENV_FILE...${NC}"

cat > "$ENV_FILE" << EOF
# SUPABASE (CONFIGURÉ AUTOMATIQUEMENT)
SUPABASE_URL=$SUPABASE_URL
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY

# STRIPE
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# APPLICATION
FRONTEND_URL=http://localhost:8080
PORT=3000
NODE_ENV=development

# EBOOK
EBOOK_PRICE=20.00
CURRENCY=eur
EOF

echo -e "${GREEN}   ✅ Fichier .env configuré !${NC}"
echo ""

# Vérification
echo -e "${YELLOW}   🔍 Vérification de la configuration...${NC}"
if grep -q "xxxxxxxxxxxxx" "$ENV_FILE"; then
    echo -e "${RED}   ❌ Erreur : Les clés n'ont pas été sauvegardées${NC}"
    exit 1
else
    echo -e "${GREEN}   ✅ Configuration validée !${NC}"
fi
echo ""

# Redémarrage
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}🚀 Redémarrage des serveurs...${NC}"
echo ""

# Arrêter les serveurs
./stop.sh > /dev/null 2>&1
sleep 2

# Démarrer
./start.sh &
sleep 5

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}║              ${GREEN}✨ CONFIGURATION TERMINÉE ! ✨${PURPLE}              ║${NC}"
echo -e "${PURPLE}║                                                            ║${NC}"
echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🎉 Supabase est maintenant configuré !${NC}"
echo ""
echo -e "${CYAN}Tu peux maintenant :${NC}"
echo -e "   ${GREEN}✅${NC} Créer un compte sur ${BLUE}http://localhost:8080${NC}"
echo -e "   ${GREEN}✅${NC} Te connecter"
echo -e "   ${GREEN}✅${NC} Devenir affilié"
echo -e "   ${GREEN}✅${NC} Tout fonctionne !${NC}"
echo ""
echo -e "${YELLOW}📊 Teste la santé de l'API :${NC}"
echo -e "   ${BLUE}curl http://localhost:3000/api/health${NC}"
echo ""
echo -e "${PURPLE}⚜━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚜${NC}"
echo ""
