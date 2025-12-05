# 🚀 Guide de Déploiement - French Connexion

Ce guide explique comment déployer ta plateforme ebook sur Internet.

## 📋 Prérequis

Avant de commencer :
- [ ] Compte GitHub (gratuit)
- [ ] Compte Stripe (gratuit, mode test puis production)
- [ ] Nom de domaine (optionnel, ~10-15€/an)
- [ ] Carte bancaire pour l'hébergement (5-10€/mois)

## 🎯 Architecture de Déploiement Recommandée

### Option 1 : Simple et Abordable (Débutant)
- **Frontend** : Vercel (gratuit)
- **Backend** : Railway (5$/mois)
- **Base de données** : SQLite sur Railway
- **Total** : ~5-6€/mois

### Option 2 : Professionnelle
- **Frontend + Backend** : DigitalOcean Droplet (6€/mois)
- **Base de données** : SQLite ou PostgreSQL
- **Total** : ~6€/mois

---

## 📦 Étape 1 : Préparer le Projet

### 1.1 Créer un dépôt GitHub

```bash
cd french-connexion-ebook
git init
git add .
git commit -m "Initial commit - French Connexion Platform"

# Créer un repo sur GitHub, puis :
git remote add origin https://github.com/ton-username/french-connexion.git
git branch -M main
git push -u origin main
```

### 1.2 Configurer Stripe

1. Va sur [stripe.com](https://stripe.com) et crée un compte
2. Active ton compte (vérification d'identité)
3. Récupère tes clés API :
   - Dashboard → Developers → API Keys
   - Note la `Publishable key` (pk_live_...)
   - Note la `Secret key` (sk_live_...)

4. Configure le webhook :
   - Dashboard → Developers → Webhooks
   - Ajouter un endpoint : `https://ton-domaine.com/api/payment/webhook`
   - Sélectionner l'événement : `checkout.session.completed`
   - Note le `Signing secret` (whsec_...)

---

## 🌐 Étape 2 : Déployer le Backend (Railway)

### 2.1 Créer un compte Railway

1. Va sur [railway.app](https://railway.app)
2. Connecte-toi avec GitHub
3. Clique sur "New Project"
4. Sélectionne "Deploy from GitHub repo"
5. Choisis ton repo `french-connexion`

### 2.2 Configurer les Variables d'Environnement

Dans Railway, va dans l'onglet "Variables" et ajoute :

```env
PORT=3000
NODE_ENV=production

JWT_SECRET=ton_secret_jwt_super_long_et_securise_ici_genere_avec_openssl
STRIPE_SECRET_KEY=sk_live_ta_cle_secrete_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_ta_cle_publique_stripe
STRIPE_WEBHOOK_SECRET=whsec_ton_webhook_secret

DB_PATH=/app/database/french-connexion.db

SESSION_TIMEOUT=3600000
MAX_DEVICES_PER_USER=3

FRONTEND_URL=https://ton-site.vercel.app

EBOOK_PRICE=19.99
CURRENCY=eur
```

**Générer un JWT_SECRET sécurisé :**
```bash
openssl rand -base64 32
```

### 2.3 Configurer le déploiement

Railway va automatiquement :
- Détecter Node.js
- Installer les dépendances (`npm install`)
- Démarrer le serveur (`npm start`)

**Important** : Ajoute un fichier `.railwayignore` :
```
frontend/
*.md
.git/
```

### 2.4 Initialiser la base de données

Une fois déployé, va dans l'onglet "Shell" de Railway et exécute :
```bash
npm run init-db
```

### 2.5 Noter l'URL du backend

Railway va te donner une URL comme : `https://french-connexion-production.up.railway.app`

---

## 🎨 Étape 3 : Déployer le Frontend (Vercel)

### 3.1 Créer un compte Vercel

1. Va sur [vercel.com](https://vercel.com)
2. Connecte-toi avec GitHub
3. Clique sur "Add New" → "Project"
4. Importe ton repo `french-connexion`

### 3.2 Configurer le projet

Dans les paramètres du projet :

**Root Directory** : `frontend`

**Build & Development Settings** :
- Framework Preset : Other
- Build Command : (laisser vide)
- Output Directory : `./`

### 3.3 Configurer les Variables d'Environnement

Dans Vercel, ajoute ces variables :

```env
NEXT_PUBLIC_API_URL=https://ton-backend.railway.app/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_ta_cle_publique
```

### 3.4 Modifier le fichier de configuration frontend

Édite `frontend/js/config.js` :

```javascript
const API_URL = 'https://ton-backend.railway.app/api';
const STRIPE_PUBLISHABLE_KEY = 'pk_live_ta_cle_publique';
```

**OU** utilise des variables d'environnement dynamiques.

### 3.5 Déployer

Vercel va automatiquement déployer ton frontend et te donner une URL comme :
`https://french-connexion.vercel.app`

---

## 🔗 Étape 4 : Configurer le Nom de Domaine (Optionnel)

### 4.1 Acheter un nom de domaine

Recommandations :
- **Namecheap** : ~10€/an
- **OVH** : ~8€/an
- **Google Domains** : ~12€/an

Exemples de noms :
- `french-connexion.com`
- `frenchconnexion.io`
- `fc-ebook.com`

### 4.2 Configurer le DNS

#### Pour le Frontend (Vercel)

Dans Vercel :
1. Va dans Settings → Domains
2. Ajoute ton domaine (ex: `french-connexion.com`)
3. Vercel te donne des enregistrements DNS à configurer

Dans ton fournisseur de domaine :
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### Pour le Backend (Railway)

Dans Railway :
1. Va dans Settings → Domains
2. Ajoute un sous-domaine (ex: `api.french-connexion.com`)
3. Configure l'enregistrement CNAME chez ton fournisseur :

```
Type: CNAME
Name: api
Value: ton-projet.up.railway.app
```

### 4.3 Mettre à jour les URLs

**Backend (.env sur Railway)** :
```env
FRONTEND_URL=https://french-connexion.com
```

**Frontend (js/config.js)** :
```javascript
const API_URL = 'https://api.french-connexion.com/api';
```

**Stripe Webhook** :
Mettre à jour l'URL : `https://api.french-connexion.com/api/payment/webhook`

---

## 🔒 Étape 5 : Activer HTTPS/SSL

**Bonne nouvelle** : Vercel et Railway activent automatiquement HTTPS avec des certificats Let's Encrypt gratuits !

Rien à faire, c'est automatique. ✅

---

## ✅ Étape 6 : Tests de Production

### 6.1 Tester le Frontend

Visite : `https://ton-site.vercel.app` (ou ton domaine)

Vérifie :
- [ ] La page d'accueil se charge
- [ ] Les liens fonctionnent
- [ ] Le design s'affiche correctement

### 6.2 Tester l'Inscription

1. Va sur `/register.html`
2. Crée un compte test
3. Vérifie que tu es redirigé vers la page de paiement

### 6.3 Tester le Paiement

**Mode Test Stripe** :
Utilise ces cartes de test :
- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- Date : n'importe quelle date future
- CVC : n'importe quels 3 chiffres

Vérifie :
- [ ] La page de paiement se charge
- [ ] Le formulaire Stripe s'affiche
- [ ] Le paiement test fonctionne
- [ ] Tu es redirigé vers le lecteur

### 6.4 Tester le Lecteur

Après paiement :
- [ ] Le lecteur s'affiche
- [ ] Le contenu est lisible
- [ ] Les protections fonctionnent (pas de copier/coller)
- [ ] Le filigrane apparaît
- [ ] La navigation entre chapitres fonctionne

### 6.5 Tester la Déconnexion/Reconnexion

- [ ] Déconnexion fonctionne
- [ ] Reconnexion redirige vers le lecteur
- [ ] La session est maintenue

---

## 💰 Étape 7 : Passer en Mode Production

### 7.1 Activer le Mode Live sur Stripe

1. Dashboard Stripe → Passer en mode Live
2. Compléter les informations bancaires
3. Récupérer les nouvelles clés API (pk_live_... et sk_live_...)

### 7.2 Mettre à jour les Variables d'Environnement

**Railway** :
- `STRIPE_SECRET_KEY=sk_live_nouvelle_cle`
- `STRIPE_WEBHOOK_SECRET=whsec_nouveau_secret`

**Vercel (frontend/js/config.js)** :
- `STRIPE_PUBLISHABLE_KEY=pk_live_nouvelle_cle`

### 7.3 Tester avec de Vrais Paiements

**ATTENTION** : Utilise une vraie carte mais un petit montant pour tester.

Stripe prend une commission de ~2-3% + 0,25€ par transaction.

---

## 📊 Étape 8 : Monitoring & Analytics

### 8.1 Google Analytics (Gratuit)

1. Crée un compte sur [analytics.google.com](https://analytics.google.com)
2. Ajoute le code de suivi dans `frontend/index.html` :

```html
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
</head>
```

### 8.2 Stripe Dashboard

Surveille tes ventes sur le Dashboard Stripe :
- Nombre de transactions
- Montant total
- Taux de conversion

### 8.3 Logs Backend (Railway)

Dans Railway, onglet "Logs" :
- Surveille les erreurs
- Vérifie les paiements
- Détecte les problèmes

---

## 🛡️ Étape 9 : Sécurité & Maintenance

### 9.1 Sauvegardes de la Base de Données

**Railway** : Télécharge régulièrement la BDD :
```bash
# Dans le shell Railway
cp /app/database/french-connexion.db /tmp/backup.db
```

Ou configure des backups automatiques sur un service cloud.

### 9.2 Surveiller les Sessions

Nettoie les sessions expirées périodiquement :

Ajoute un cron job ou un script :
```sql
DELETE FROM sessions WHERE expires_at < datetime('now');
```

### 9.3 Mettre à jour les Dépendances

Tous les 2-3 mois :
```bash
npm outdated
npm update
```

---

## 💡 Conseils & Astuces

### Marketing

1. **Réseaux sociaux** : Partage ton ebook sur Instagram, TikTok, LinkedIn
2. **Publicité** : Meta Ads, Google Ads (budget ~50-100€ pour tester)
3. **Affiliation** : Propose aux gens de vendre ton ebook pour une commission

### Améliorer les Conversions

- Ajoute des témoignages clients
- Crée une vidéo de présentation
- Offre un extrait gratuit
- Ajoute un compte à rebours (urgence)

### Support Client

- Crée une adresse email : contact@french-connexion.com
- Ajoute une FAQ sur le site
- Réponds rapidement aux questions

---

## 🆘 Problèmes Courants

### Erreur CORS

**Symptôme** : Erreur "CORS policy" dans la console

**Solution** : Vérifie que `FRONTEND_URL` dans le backend correspond exactement à l'URL du frontend.

### Webhook Stripe ne fonctionne pas

**Symptôme** : Paiement réussi mais accès non débloqué

**Solution** :
1. Vérifie que l'URL du webhook est correcte
2. Teste le webhook avec Stripe CLI :
```bash
stripe listen --forward-to localhost:3000/api/payment/webhook
```

### Base de données disparue

**Symptôme** : Utilisateurs perdus après redéploiement

**Solution** : Configure un volume persistant sur Railway ou utilise PostgreSQL.

---

## 📈 Scaling (Monter en Charge)

Quand tu as beaucoup de trafic :

### 1. Passer à PostgreSQL

Au lieu de SQLite, utilise PostgreSQL (Railway offre une BDD PostgreSQL gratuite jusqu'à 1Go).

### 2. Ajouter un CDN

Pour accélérer le chargement :
- Cloudflare (gratuit)
- Serve les images/CSS via un CDN

### 3. Caching

Ajoute Redis pour cacher les sessions et réduire la charge sur la BDD.

---

## 🎉 C'est Terminé !

Ta plateforme est maintenant en ligne et prête à vendre ton ebook !

**Checklist Finale** :
- [ ] Frontend déployé
- [ ] Backend déployé
- [ ] Base de données initialisée
- [ ] Stripe configuré (mode live)
- [ ] Webhook testé
- [ ] Domaine configuré (optionnel)
- [ ] Tests de bout en bout réussis
- [ ] Analytics activé

**Prochaines Étapes** :
1. Promouvoir ton ebook
2. Collecter des témoignages
3. Itérer et améliorer
4. Répéter le processus avec d'autres produits

---

**Bon courage pour ton lancement ! 🚀**

⚜️ By FRENCH CONNEXION
