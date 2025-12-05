# 🚀 COMMENCE ICI - French Connexion

## ⚡ LANCEMENT EN 3 ÉTAPES

### 📋 **Option 1 : Automatique (Recommandé)**

Ouvre un terminal et exécute :

```bash
cd /home/streetdrive/EBOOK/french-connexion-ebook/backend
bash install-and-start.sh
```

Ce script va :
✅ Installer toutes les dépendances
✅ Créer la configuration .env
✅ Générer un JWT_SECRET sécurisé
✅ Initialiser la base de données
✅ Démarrer le serveur backend

---

### 📋 **Option 2 : Manuel (Étape par étape)**

#### **Terminal 1 - Backend**

```bash
# 1. Aller dans le dossier backend
cd /home/streetdrive/EBOOK/french-connexion-ebook/backend

# 2. Installer les dépendances
npm install

# 3. Créer la configuration
cp .env.example .env

# 4. Générer un JWT_SECRET sécurisé
openssl rand -base64 32
# Copie le résultat dans .env à la ligne JWT_SECRET=...

# 5. Éditer .env et ajouter tes clés Stripe TEST
nano .env
# ou
code .env

# 6. Initialiser la base de données
npm run init-db

# 7. Démarrer le serveur
npm start
```

**✅ Tu devrais voir :**
```
⚜️  FRENCH CONNEXION API
🚀 Serveur démarré sur le port 3000
✅ Connecté à la base de données
```

---

#### **Terminal 2 - Frontend**

Ouvre un **NOUVEAU** terminal :

```bash
# 1. Aller dans le dossier frontend
cd /home/streetdrive/EBOOK/french-connexion-ebook/frontend

# 2. Démarrer le serveur web
python3 -m http.server 8080
```

**✅ Tu devrais voir :**
```
Serving HTTP on 0.0.0.0 port 8080 ...
```

---

## 🔑 Configuration Stripe (OBLIGATOIRE)

Avant de pouvoir tester les paiements :

### 1. Créer un compte Stripe
- Va sur : https://stripe.com
- Inscris-toi (gratuit)

### 2. Activer le mode TEST
- Dashboard Stripe → Toggle "Mode Test" (en haut à droite)

### 3. Récupérer les clés TEST
- Va dans **Developers** → **API Keys**
- Copie :
  - **Publishable key** : `pk_test_...`
  - **Secret key** : `sk_test_...`

### 4. Ajouter les clés

**Fichier 1 : `backend/.env`**
```env
STRIPE_SECRET_KEY=sk_test_ta_cle_secrete_ici
STRIPE_PUBLISHABLE_KEY=pk_test_ta_cle_publique_ici
```

**Fichier 2 : `frontend/js/config.js`**
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_ta_cle_publique_ici';
```

### 5. Redémarrer le backend
Dans Terminal 1 :
- Appuie sur `Ctrl+C`
- Relance : `npm start`

---

## 🌐 Ouvrir la Plateforme

Dans ton navigateur, va sur :

### **http://localhost:8080**

Tu devrais voir la magnifique landing page French Connexion ! ⚜️

---

## ✅ Tester la Plateforme

### 1. **Créer un compte**
- Clique sur "Créer mon compte"
- Remplis le formulaire
- Mot de passe : min 8 caractères, 1 majuscule, 1 chiffre

### 2. **Page de paiement**
Tu seras redirigé vers la page de paiement Stripe

**Carte de test :**
```
Numéro : 4242 4242 4242 4242
Date   : 12/34
CVC    : 123
```

### 3. **Marquer comme payé (mode local)**

⚠️ En local, le webhook Stripe ne fonctionne pas automatiquement.

**Solution temporaire :** Marque ton compte manuellement dans la BDD.

Ouvre un **Terminal 3** :
```bash
cd /home/streetdrive/EBOOK/french-connexion-ebook
sqlite3 database/french-connexion.db

# Dans SQLite :
UPDATE users SET has_paid = 1 WHERE email = 'ton@email.com';
.exit
```

### 4. **Accéder au lecteur**
- Déconnecte-toi
- Reconnecte-toi
- **BOOM !** Tu accèdes au lecteur 📖

### 5. **Tester les protections**
- ❌ Impossible de copier le texte
- ❌ Clic droit désactivé
- ✅ Filigrane avec ton email
- ✅ Navigation entre chapitres
- ✅ Design magnifique

---

## 🎯 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Site** | http://localhost:8080 | Landing page |
| **Inscription** | http://localhost:8080/register.html | Créer un compte |
| **Connexion** | http://localhost:8080/login.html | Se connecter |
| **Lecteur** | http://localhost:8080/reader.html | Lire l'ebook |
| **API Health** | http://localhost:3000/api/health | Test backend |

---

## 🆘 Problèmes ?

### Le backend ne démarre pas

**Erreur : "Cannot find module 'express'"**
```bash
cd backend
npm install
```

**Erreur : "Port 3000 already in use"**
```bash
lsof -i :3000
kill -9 [PID]
```

### Le frontend ne charge pas

**Utilise bien un serveur web, pas `file://`**
```bash
cd frontend
python3 -m http.server 8080
```

### Stripe ne fonctionne pas

1. Vérifie que les clés commencent par `pk_test_` et `sk_test_`
2. Vérifie qu'elles sont dans `.env` ET `config.js`
3. Redémarre le backend (Ctrl+C puis `npm start`)

---

## 📚 Documentation Complète

Tous les détails dans ces fichiers :

- **LANCEMENT.md** - Instructions détaillées
- **QUICK-START.md** - Démarrage rapide
- **COMMANDS.md** - Toutes les commandes
- **DEPLOYMENT.md** - Déploiement production
- **CHECKLIST.md** - Checklists complètes

---

## 🎉 Succès !

Si tu vois :
- ✅ Backend démarré (port 3000)
- ✅ Frontend démarré (port 8080)
- ✅ Landing page magnifique
- ✅ Inscription fonctionne
- ✅ Lecteur accessible

**FÉLICITATIONS ! Ta plateforme fonctionne ! 🚀**

---

## 🚀 Prochaines Étapes

1. ✅ **Teste tout** (inscription, paiement, lecteur)
2. 📝 **Personnalise** le contenu de l'ebook
3. 🎨 **Modifie** les couleurs si tu veux
4. 🌐 **Déploie** en production (voir DEPLOYMENT.md)
5. 💰 **Lance** et commence à vendre !

---

**Bon lancement ! 🎯**

⚜️ **FRENCH CONNEXION**

*Les hésitants restent sur place. Les entrepreneurs agissent.*
