# 🚀 LANCEMENT DE LA PLATEFORME

## ⚡ Démarrage Ultra-Rapide

### Prérequis
Vérifie que Node.js est installé :
```bash
node --version
npm --version
```

Si pas installé, télécharge : https://nodejs.org

---

## 📋 Instructions de Lancement

### **Terminal 1 : Backend**

```bash
# 1. Aller dans le dossier backend
cd /home/streetdrive/EBOOK/french-connexion-ebook/backend

# 2. Installer les dépendances (première fois seulement)
npm install

# 3. Créer le fichier .env (première fois seulement)
cp .env.example .env

# 4. IMPORTANT : Éditer .env et ajouter au minimum :
# - JWT_SECRET (générer avec : openssl rand -base64 32)
# - Clés Stripe TEST de stripe.com
nano .env  # ou vim, ou code .env

# 5. Initialiser la base de données (première fois seulement)
npm run init-db

# 6. Démarrer le serveur backend
npm start
```

**✅ Backend démarré** : http://localhost:3000

---

### **Terminal 2 : Frontend**

Ouvre un NOUVEAU terminal et lance :

```bash
# 1. Aller dans le dossier frontend
cd /home/streetdrive/EBOOK/french-connexion-ebook/frontend

# 2. Démarrer le serveur web (choisir une méthode)

# Méthode A : Python 3
python3 -m http.server 8080

# Méthode B : Python 2
python -m SimpleHTTPServer 8080

# Méthode C : Node.js http-server
npx http-server -p 8080
```

**✅ Frontend démarré** : http://localhost:8080

---

## 🧪 Tester la Plateforme

### 1. Ouvre ton navigateur
Va sur : **http://localhost:8080**

### 2. Crée un compte
- Clique sur "Créer mon compte"
- Remplis le formulaire
- Mot de passe : au moins 8 caractères, 1 majuscule, 1 chiffre

### 3. Page de paiement
Tu seras redirigé vers la page de paiement Stripe.

**⚠️ IMPORTANT** : En mode développement local, le webhook Stripe ne fonctionnera pas automatiquement.

**Solution temporaire** : Marque ton compte comme payé manuellement dans la BDD.

### 4. Marquer le compte comme payé (mode test)

Ouvre un TROISIÈME terminal :

```bash
# Accéder à la base de données
cd /home/streetdrive/EBOOK/french-connexion-ebook
sqlite3 database/french-connexion.db

# Dans SQLite, exécute :
UPDATE users SET has_paid = 1 WHERE email = 'ton@email.com';
.exit
```

### 5. Accéder au lecteur
- Déconnecte-toi
- Reconnecte-toi
- Tu seras redirigé vers le lecteur 📖

---

## 🎯 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:8080 | Site principal |
| **Backend** | http://localhost:3000 | API |
| **Health Check** | http://localhost:3000/api/health | Test API |

---

## 🔑 Configuration Stripe (Obligatoire)

### 1. Créer un compte Stripe
Va sur : https://stripe.com et inscris-toi (gratuit)

### 2. Activer le mode TEST
Dans le dashboard Stripe, active le **mode Test** (toggle en haut à droite)

### 3. Récupérer les clés TEST
- Va dans **Developers** → **API Keys**
- Copie :
  - **Publishable key** : `pk_test_...`
  - **Secret key** : `sk_test_...`

### 4. Ajouter les clés dans le projet

**Backend** (`backend/.env`) :
```env
STRIPE_SECRET_KEY=sk_test_ta_cle_ici
STRIPE_PUBLISHABLE_KEY=pk_test_ta_cle_ici
```

**Frontend** (`frontend/js/config.js`) :
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_ta_cle_ici';
```

### 5. Redémarrer le backend
Arrête (Ctrl+C) et relance `npm start`

---

## 🧪 Carte de Test Stripe

Pour tester les paiements :

```
Numéro : 4242 4242 4242 4242
Date   : 12/34 (n'importe quelle date future)
CVC    : 123 (n'importe quels 3 chiffres)
ZIP    : 12345
```

---

## ✅ Checklist de Vérification

Avant de dire que tout fonctionne :

- [ ] Node.js installé
- [ ] Backend : `npm install` terminé
- [ ] Backend : `.env` créé et configuré avec JWT_SECRET
- [ ] Backend : BDD initialisée (`npm run init-db`)
- [ ] Backend : Serveur démarré (port 3000)
- [ ] Frontend : Serveur web démarré (port 8080)
- [ ] Stripe : Clés TEST récupérées
- [ ] Stripe : Clés ajoutées dans `.env` et `config.js`
- [ ] Test : Page d'accueil se charge
- [ ] Test : Inscription fonctionne
- [ ] Test : Connexion fonctionne
- [ ] Test : Compte marqué comme payé en BDD
- [ ] Test : Lecteur accessible

---

## 🆘 Problèmes Courants

### Port déjà utilisé
```bash
# Backend (port 3000)
lsof -i :3000
kill -9 [PID]

# Frontend (port 8080)
lsof -i :8080
kill -9 [PID]
```

### npm install échoue
```bash
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Base de données corrompue
```bash
rm database/french-connexion.db
cd backend
npm run init-db
```

### Cannot find module 'express'
```bash
cd backend
npm install
```

### Stripe ne fonctionne pas
1. Vérifie que les clés commencent par `pk_test_` et `sk_test_`
2. Vérifie qu'elles sont dans `.env` ET `config.js`
3. Redémarre le backend

---

## 📊 Commandes Utiles

### Voir les utilisateurs
```bash
cd /home/streetdrive/EBOOK/french-connexion-ebook
sqlite3 database/french-connexion.db "SELECT * FROM users;"
```

### Voir les paiements
```bash
sqlite3 database/french-connexion.db "SELECT * FROM payments;"
```

### Compter les utilisateurs
```bash
sqlite3 database/french-connexion.db "SELECT COUNT(*) FROM users;"
```

### Réinitialiser tout
```bash
cd /home/streetdrive/EBOOK/french-connexion-ebook
rm -rf backend/node_modules
rm database/french-connexion.db
cd backend
npm install
npm run init-db
```

---

## 🎉 Succès !

Si tu vois ça dans les terminaux :

**Terminal 1 (Backend)** :
```
⚜️  FRENCH CONNEXION API
🚀 Serveur démarré sur le port 3000
🌍 Environnement: development
📍 http://localhost:3000/api/health
✅ Connecté à la base de données
```

**Terminal 2 (Frontend)** :
```
Serving HTTP on 0.0.0.0 port 8080 ...
```

**Et dans ton navigateur sur http://localhost:8080** :
- La landing page s'affiche avec ton message
- Design doré et professionnel
- Navigation fluide

**🎉 FÉLICITATIONS ! La plateforme fonctionne ! 🎉**

---

## 📚 Prochaines Étapes

1. ✅ **Teste toutes les fonctionnalités**
   - Inscription
   - Connexion
   - Marque comme payé
   - Accès au lecteur
   - Protections (pas de copie)

2. 📝 **Personnalise le contenu**
   - Modifie `frontend/reader.html` pour ton ebook
   - Change les couleurs dans `frontend/css/style.css`
   - Ajoute ton contenu personnel

3. 🚀 **Déploie en production**
   - Lis `DEPLOYMENT.md`
   - Configure Railway + Vercel
   - Achète un domaine (optionnel)
   - Passe Stripe en mode LIVE

4. 💰 **Lance et vends !**
   - Promo sur les réseaux sociaux
   - Publicités (optionnel)
   - Collecte des témoignages
   - Itère et améliore

---

## 💡 Astuce

**Laisser tourner en arrière-plan** (Linux/Mac) :
```bash
cd backend
nohup npm start > server.log 2>&1 &

cd ../frontend
nohup python3 -m http.server 8080 > frontend.log 2>&1 &
```

**Arrêter les serveurs** :
```bash
pkill -f "node.*server.js"
pkill -f "http.server"
```

---

**Bon lancement ! 🚀**

⚜️ **By FRENCH CONNEXION**

*La clé de la réussite... c'est toi.*
