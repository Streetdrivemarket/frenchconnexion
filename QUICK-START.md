# ⚡ Quick Start - French Connexion

Guide ultra-rapide pour démarrer ton projet.

## 🎯 Ce que tu as

Une plateforme complète pour vendre ton ebook "French Connexion™" :

✅ **Frontend** : Pages web magnifiques et responsive
- Landing page avec ton message
- Inscription / Connexion
- Page de paiement Stripe
- Lecteur d'ebook sécurisé

✅ **Backend** : API Node.js complète
- Authentification JWT
- Gestion des utilisateurs
- Intégration Stripe
- Protection des sessions
- Limite d'appareils

✅ **Sécurité** :
- Impossible de copier le texte
- Filigrane personnalisé (email de l'utilisateur)
- Sessions expirables
- Limite de 3 appareils par compte
- Protection contre l'impression

✅ **Base de données** : SQLite
- Utilisateurs
- Paiements
- Sessions actives
- Logs de connexion

---

## 🚀 Démarrage Rapide (5 minutes)

### 1. Installation

```bash
cd french-connexion-ebook/backend
npm install
```

### 2. Configuration

```bash
cp .env.example .env
```

Édite `.env` et ajoute au minimum :
- `JWT_SECRET` (génère-le avec : `openssl rand -base64 32`)
- Tes clés Stripe TEST

### 3. Initialiser la BDD

```bash
npm run init-db
```

### 4. Lancer le backend

```bash
npm start
```

### 5. Lancer le frontend

Dans un autre terminal :
```bash
cd ../frontend
python -m http.server 8080
```

### 6. Tester

Ouvre : `http://localhost:8080`

---

## 📁 Structure du Projet

```
french-connexion-ebook/
├── frontend/              # Interface utilisateur
│   ├── index.html         # Landing page
│   ├── register.html      # Inscription
│   ├── login.html         # Connexion
│   ├── payment.html       # Paiement Stripe
│   ├── reader.html        # Lecteur d'ebook
│   ├── css/
│   │   ├── style.css      # Styles landing
│   │   ├── auth.css       # Styles auth
│   │   └── reader.css     # Styles lecteur
│   └── js/
│       ├── config.js      # Configuration API
│       ├── main.js        # Scripts landing
│       ├── register.js    # Scripts inscription
│       ├── login.js       # Scripts connexion
│       ├── payment.js     # Scripts paiement
│       └── reader.js      # Scripts lecteur
│
├── backend/               # API Node.js
│   ├── server.js          # Serveur Express
│   ├── routes/            # Routes API
│   │   ├── auth.js        # Authentification
│   │   ├── payment.js     # Paiements
│   │   └── reader.js      # Accès lecteur
│   ├── middleware/
│   │   └── auth.js        # Middleware JWT
│   ├── config/
│   │   └── database.js    # Connexion BDD
│   └── package.json
│
├── database/              # Base de données
│   ├── schema.sql         # Structure BDD
│   └── init.js            # Script d'initialisation
│
├── README.md              # Documentation complète
├── SETUP-LOCAL.md         # Guide installation locale
├── DEPLOYMENT.md          # Guide déploiement production
└── QUICK-START.md         # Ce fichier
```

---

## 🔑 Fonctionnalités Clés

### Pour les Utilisateurs

1. **Inscription** : Créer un compte avec email/mot de passe
2. **Paiement** : 19,99€ via Stripe (carte bancaire)
3. **Accès Immédiat** : Lecture instantanée après paiement
4. **Multi-Appareils** : Connexion sur 3 appareils max
5. **Sécurisé** : Contenu protégé contre le partage

### Pour Toi (Admin)

1. **Dashboard Stripe** : Voir toutes les ventes
2. **Base de données** : Liste des utilisateurs et paiements
3. **Logs** : Surveiller les connexions et erreurs
4. **Analytiques** : Tracker le trafic et conversions

---

## 💰 Coûts Estimés

### Développement (Gratuit)
- Node.js : Gratuit
- VS Code : Gratuit
- Stripe (mode test) : Gratuit

### Production (5-15€/mois)

**Option Économique** :
- Frontend (Vercel) : Gratuit
- Backend (Railway) : 5$/mois
- Domaine (optionnel) : 10€/an
- **Total** : ~5-6€/mois

**Option Pro** :
- DigitalOcean Droplet : 6€/mois
- Domaine : 10€/an
- **Total** : ~6-7€/mois

**Frais Stripe** :
- 2,9% + 0,25€ par transaction
- Sur 19,99€ → ~0,83€ de frais
- Tu reçois ~19,16€ net

---

## 📊 Potentiel de Revenus

Si tu vends l'ebook à **19,99€** :

| Ventes/mois | Revenu brut | Frais Stripe | Hébergement | Net |
|-------------|-------------|--------------|-------------|-----|
| 10          | 199,90€     | ~8,30€       | 5€          | ~186€ |
| 50          | 999,50€     | ~41,50€      | 5€          | ~953€ |
| 100         | 1.999€      | ~83€         | 5€          | ~1.911€ |
| 500         | 9.995€      | ~415€        | 10€         | ~9.570€ |

**ROI** : Rentable dès la 1ère vente ! 🎉

---

## 🎨 Personnalisation

### Changer les Couleurs

Édite `frontend/css/style.css` :
```css
:root {
    --primary-color: #1a1a2e;     /* Couleur principale */
    --gold-color: #d4af37;        /* Couleur accent */
    --text-light: #ffffff;        /* Texte clair */
}
```

### Modifier le Contenu

Édite `frontend/reader.html` pour changer le texte de l'ebook.

### Changer le Prix

Dans `backend/.env` :
```env
EBOOK_PRICE=29.99
```

---

## 🎓 Prochaines Étapes

### Phase 1 : Test Local (Aujourd'hui)
- [ ] Installer les dépendances
- [ ] Lancer en local
- [ ] Tester l'inscription
- [ ] Tester le paiement (mode test)
- [ ] Vérifier le lecteur

### Phase 2 : Configuration Stripe (Cette semaine)
- [ ] Créer compte Stripe
- [ ] Activer le compte (vérification)
- [ ] Configurer les webhooks
- [ ] Tester en mode test

### Phase 3 : Déploiement (Ce mois)
- [ ] Créer compte Railway/Vercel
- [ ] Déployer le backend
- [ ] Déployer le frontend
- [ ] Acheter un domaine (optionnel)
- [ ] Passer Stripe en mode live

### Phase 4 : Lancement (Mois suivant)
- [ ] Créer du contenu promo
- [ ] Lancer sur les réseaux sociaux
- [ ] Publicité payante (optionnel)
- [ ] Collecter les premiers retours

---

## 🆘 Support Rapide

### Le backend ne démarre pas ?
```bash
cd backend
rm -rf node_modules
npm install
npm start
```

### Erreur de base de données ?
```bash
rm database/*.db
cd backend
npm run init-db
```

### Problème Stripe ?
1. Vérifie que tu utilises les clés TEST
2. Vérifie que le compte Stripe est activé
3. Lis la console pour les erreurs

### Frontend ne charge pas ?
1. Utilise un serveur web local (pas `file://`)
2. Vérifie la console du navigateur (F12)
3. Vérifie que l'API_URL dans `config.js` est correct

---

## 📚 Documentation Complète

- **README.md** : Vue d'ensemble et introduction
- **SETUP-LOCAL.md** : Guide détaillé pour tester en local
- **DEPLOYMENT.md** : Guide complet de déploiement en production

---

## ✨ Rappel : Ton Mindset

Tu as maintenant entre les mains une plateforme complète.

**19,99€ ce n'est pas juste un prix. C'est un choix.**

Pour tes clients : investir en eux.
Pour toi : commencer à devenir entrepreneur.

**Les hésitants restent sur place.**
**Les entrepreneurs agissent.**

Tu as la plateforme. Maintenant, lance-la. 🚀

---

⚜️ **By FRENCH CONNEXION**

*La clé de la réussite... c'est toi.*
