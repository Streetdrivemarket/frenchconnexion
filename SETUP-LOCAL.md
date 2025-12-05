# 🔧 Installation Locale - French Connexion

Guide pour tester la plateforme sur ton ordinateur avant le déploiement.

## Prérequis

- **Node.js** v16 ou supérieur ([télécharger](https://nodejs.org))
- **npm** (inclus avec Node.js)
- Un éditeur de code (VS Code recommandé)
- Un navigateur moderne (Chrome, Firefox)

Vérifier l'installation :
```bash
node --version
npm --version
```

---

## 📦 Étape 1 : Installation

### 1.1 Cloner ou télécharger le projet

```bash
cd /home/streetdrive/EBOOK
cd french-connexion-ebook
```

### 1.2 Installer les dépendances backend

```bash
cd backend
npm install
```

Cela va installer toutes les dépendances listées dans `package.json` :
- express
- stripe
- bcryptjs
- jsonwebtoken
- sqlite3
- etc.

**Temps estimé** : 1-2 minutes

---

## 🔑 Étape 2 : Configuration

### 2.1 Créer le fichier `.env`

Dans le dossier `backend/`, copie `.env.example` vers `.env` :

```bash
cp .env.example .env
```

### 2.2 Éditer `.env`

Ouvre `backend/.env` et modifie les valeurs :

```env
PORT=3000
NODE_ENV=development

# Générer un secret : openssl rand -base64 32
JWT_SECRET=genere_un_secret_aleatoire_ici

# Clés Stripe TEST (commence par sk_test_ et pk_test_)
STRIPE_SECRET_KEY=sk_test_ta_cle_secrete_test
STRIPE_PUBLISHABLE_KEY=pk_test_ta_cle_publique_test
STRIPE_WEBHOOK_SECRET=whsec_ton_webhook_secret

DB_PATH=../database/french-connexion.db

SESSION_TIMEOUT=3600000
MAX_DEVICES_PER_USER=3

FRONTEND_URL=http://localhost:8080

EBOOK_PRICE=19.99
CURRENCY=eur
```

### 2.3 Obtenir les clés Stripe TEST

1. Crée un compte sur [stripe.com](https://stripe.com)
2. Va dans **Developers** → **API Keys**
3. Active le **mode Test** (toggle en haut à droite)
4. Copie :
   - **Publishable key** : `pk_test_...`
   - **Secret key** : `sk_test_...` (clique sur "Reveal test key")

**Important** : Utilise les clés TEST pour le développement local !

### 2.4 Configurer le frontend

Édite `frontend/js/config.js` :

```javascript
const API_URL = 'http://localhost:3000/api';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_ta_cle_publique_test';
```

---

## 💾 Étape 3 : Initialiser la Base de Données

```bash
cd backend
npm run init-db
```

Tu devrais voir :
```
✅ Connecté à la base de données SQLite
✅ Base de données initialisée avec succès !
📍 Emplacement: /path/to/database/french-connexion.db
✅ Connexion fermée
```

Cela crée la base de données SQLite avec toutes les tables nécessaires.

---

## 🚀 Étape 4 : Lancer le Serveur Backend

```bash
cd backend
npm start
```

Tu devrais voir :
```
⚜️  FRENCH CONNEXION API
🚀 Serveur démarré sur le port 3000
🌍 Environnement: development
📍 http://localhost:3000/api/health
✅ Connecté à la base de données
```

**Teste l'API** :
Ouvre ton navigateur et va sur : `http://localhost:3000/api/health`

Tu devrais voir :
```json
{
  "status": "ok",
  "message": "French Connexion API est en ligne ⚜️",
  "timestamp": "2024-12-04T15:30:00.000Z"
}
```

✅ Le backend fonctionne !

---

## 🌐 Étape 5 : Lancer le Frontend

Le frontend est du HTML/CSS/JS pur, il faut juste un serveur web local.

### Option 1 : Avec Live Server (VS Code)

1. Installe l'extension **Live Server** dans VS Code
2. Ouvre le dossier `frontend/`
3. Clic droit sur `index.html` → **Open with Live Server**
4. Le site s'ouvre sur `http://localhost:5500` (ou un autre port)

### Option 2 : Avec Python

Si tu as Python installé :

```bash
cd frontend
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Ouvre : `http://localhost:8080`

### Option 3 : Avec http-server (Node.js)

```bash
# Installer http-server globalement
npm install -g http-server

# Dans le dossier frontend
cd frontend
http-server -p 8080
```

Ouvre : `http://localhost:8080`

---

## ✅ Étape 6 : Tester la Plateforme

### 6.1 Page d'Accueil

Va sur `http://localhost:8080`

Vérifie :
- [ ] La page se charge correctement
- [ ] Le design s'affiche
- [ ] Les liens fonctionnent
- [ ] Le scroll est fluide

### 6.2 Créer un Compte

1. Clique sur **"Créer mon compte"**
2. Remplis le formulaire :
   - Nom : Test User
   - Email : test@example.com
   - Mot de passe : Test1234
3. Clique sur **"Créer mon compte"**

Tu devrais être redirigé vers la page de paiement.

### 6.3 Tester le Paiement

**ATTENTION** : Utilise les cartes de test Stripe !

**Carte de test valide** :
- Numéro : `4242 4242 4242 4242`
- Date : n'importe quelle date future (ex: 12/25)
- CVC : n'importe quels 3 chiffres (ex: 123)
- Code postal : n'importe lequel (ex: 12345)

**Note** : En mode développement local, le webhook Stripe ne fonctionnera pas automatiquement. Tu devras :

**Option A** : Simuler manuellement le paiement dans la BDD
```bash
sqlite3 database/french-connexion.db
UPDATE users SET has_paid = 1 WHERE email = 'test@example.com';
.exit
```

**Option B** : Utiliser Stripe CLI (avancé)
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:3000/api/payment/webhook
```

### 6.4 Accéder au Lecteur

Une fois marqué comme payé :
1. Déconnecte-toi
2. Reconnecte-toi avec test@example.com / Test1234
3. Tu devrais être redirigé vers le lecteur

Vérifie :
- [ ] Le contenu s'affiche
- [ ] Le filigrane avec l'email apparaît
- [ ] Impossible de copier le texte
- [ ] La navigation entre chapitres fonctionne
- [ ] Le clic droit est désactivé

---

## 🐛 Dépannage

### Le backend ne démarre pas

**Erreur** : `Error: Cannot find module 'express'`

**Solution** :
```bash
cd backend
rm -rf node_modules
npm install
```

### Le frontend ne se connecte pas au backend

**Erreur** : `CORS policy` dans la console

**Solution** : Vérifie que :
1. Le backend tourne sur `http://localhost:3000`
2. Le frontend accède via `http://localhost:8080` (pas `file://`)
3. `FRONTEND_URL` dans `.env` est bien `http://localhost:8080`

### La base de données ne se crée pas

**Erreur** : `Error: SQLITE_CANTOPEN`

**Solution** :
```bash
mkdir -p database
cd backend
npm run init-db
```

### Stripe ne fonctionne pas

**Vérifier** :
1. Les clés TEST sont bien utilisées (commencent par `pk_test_` et `sk_test_`)
2. Le compte Stripe est activé
3. La clé publique est dans `frontend/js/config.js`

---

## 📝 Commandes Utiles

### Redémarrer le backend
```bash
cd backend
npm start
```

### Voir la base de données
```bash
sqlite3 database/french-connexion.db
.tables
SELECT * FROM users;
.exit
```

### Réinitialiser la BDD
```bash
rm database/french-connexion.db
cd backend
npm run init-db
```

### Nettoyer et réinstaller
```bash
cd backend
rm -rf node_modules
npm install
```

---

## 🎓 Prochaines Étapes

Une fois que tout fonctionne en local :

1. **Personnalise** le contenu de l'ebook
2. **Modifie** les couleurs et le design
3. **Teste** tous les scénarios :
   - Inscription
   - Connexion
   - Paiement
   - Lecture
   - Déconnexion
4. **Prépare** le déploiement (voir `DEPLOYMENT.md`)

---

## 🆘 Besoin d'Aide ?

Problèmes courants :
- Lis les messages d'erreur dans la console
- Vérifie les logs du backend
- Inspecte la console du navigateur (F12)
- Vérifie que tous les fichiers `.env` sont corrects

---

**Bon développement ! 💻**

⚜️ By FRENCH CONNEXION
