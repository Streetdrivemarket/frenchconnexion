# ⚜️ French Connexion - Plateforme Ebook

## 🎯 Description
Plateforme web sécurisée pour vendre et lire l'ebook "French Connexion™" - Un guide entrepreneurial pour transformer son mindset.

**Prix:** 19,99€

## 🚀 Lancement Ultra-Rapide

### Une seule commande pour tout lancer :

```bash
./start.sh
```

Le script lance automatiquement :
- ✅ Vérification de Node.js
- ✅ Installation des dépendances
- ✅ Initialisation de la base de données
- ✅ Serveur backend (http://localhost:3000)
- ✅ Serveur frontend (http://localhost:8080)

**Pour arrêter :** `Ctrl+C`

**URLs :**
- Frontend : http://localhost:8080
- Backend : http://localhost:3000/api/health

## 🚀 Fonctionnalités

### ✅ Authentification
- Inscription utilisateur
- Connexion sécurisée
- Gestion de session avec expiration

### 💳 Paiement
- Intégration Stripe
- Paiement unique de 19,99€
- Accès immédiat après paiement

### 📖 Lecteur d'Ebook
- Lecture en ligne uniquement (non téléchargeable)
- Protection copier/coller désactivée
- Filigrane personnalisé (email utilisateur)
- Limite d'appareils connectés
- Session expirable après inactivité

### 🔒 Sécurité
- JWT pour l'authentification
- Données cryptées
- Protection contre le partage de compte
- Tracking des sessions actives

## 📁 Structure du Projet

```
french-connexion-ebook/
├── frontend/          # Interface utilisateur (HTML/CSS/JS)
│   ├── index.html     # Page d'accueil/landing
│   ├── login.html     # Page de connexion
│   ├── register.html  # Page d'inscription
│   ├── payment.html   # Page de paiement
│   ├── reader.html    # Lecteur d'ebook
│   ├── css/
│   └── js/
├── backend/           # API Node.js/Express
│   ├── server.js      # Serveur principal
│   ├── routes/        # Routes API
│   ├── controllers/   # Logique métier
│   ├── middleware/    # Authentification, etc.
│   └── models/        # Modèles de données
├── database/          # Configuration BDD
│   └── schema.sql     # Structure de la base
└── README.md
```

## 🛠️ Technologies Utilisées

### Frontend
- HTML5, CSS3, JavaScript vanilla
- Responsive design
- Animations CSS

### Backend
- Node.js + Express
- JWT pour l'authentification
- Stripe API pour les paiements
- SQLite/PostgreSQL pour la BDD

### Sécurité
- Bcrypt pour le hashage des mots de passe
- CORS configuré
- Rate limiting
- Sessions sécurisées

## 📦 Installation

### Prérequis
- Node.js (v16+)
- npm ou yarn
- Compte Stripe (clés API)

### Installation locale

```bash
# Cloner le projet
cd french-connexion-ebook

# Installer les dépendances backend
cd backend
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés Stripe

# Initialiser la base de données
npm run init-db

# Lancer le serveur
npm start

# Le serveur tourne sur http://localhost:3000
```

## 🌐 Hébergement Recommandé

### Options pour débutants (facile)
1. **Vercel** (frontend) + **Railway** (backend + BDD)
   - Prix: ~5-10€/mois
   - Déploiement automatique
   - SSL gratuit

2. **Netlify** (frontend) + **Render** (backend)
   - Plan gratuit disponible
   - Montée en charge facile

### Options professionnelles
1. **DigitalOcean Droplet**
   - Prix: 6€/mois (droplet de base)
   - Contrôle total

2. **AWS Lightsail**
   - Prix: 5€/mois
   - Infrastructure Amazon

### Nom de domaine
- **Namecheap** ou **OVH**: 10-15€/an
- Exemple: french-connexion.com

## 🔑 Configuration Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Récupérer vos clés API (mode test puis production)
3. Configurer le webhook pour confirmer les paiements
4. Ajouter les clés dans `.env`

## 📝 Contenu de l'Ebook

L'ebook contient **9 étapes du processus French Connexion™** :
1. Une idée
2. L'écrire
3. Apprendre
4. Comprendre
5. Écrire tes objectifs
6. Pourquoi j'échouerai ?
7. Analyser
8. Créer
9. Développer

## 🚀 Déploiement

### Étape 1: Préparer le code
```bash
npm run build
```

### Étape 2: Déployer le backend
- Pousser sur GitHub
- Connecter à Railway/Render
- Configurer les variables d'environnement
- Déployer

### Étape 3: Déployer le frontend
- Pousser sur GitHub
- Connecter à Vercel/Netlify
- Configurer l'URL du backend
- Déployer

### Étape 4: Configurer le domaine
- Acheter le domaine
- Pointer vers les serveurs
- Activer SSL (automatique)

## 📊 Analytics & Suivi

- Google Analytics pour le trafic
- Stripe Dashboard pour les ventes
- Logs backend pour les sessions

## 🤝 Support

Pour toute question sur le déploiement ou la configuration, consulter la documentation dans `/docs`.

## 📄 Licence

© 2024 French Connexion. Tous droits réservés.

---

**By FRENCH CONNEXION** 🇫🇷
