# 🔧 Commandes Rapides - French Connexion

## 🚀 Installation & Démarrage

### Installation des dépendances
```bash
cd backend
npm install
```

### Initialiser la base de données
```bash
cd backend
npm run init-db
```

### Démarrer le backend
```bash
cd backend
npm start
# Serveur : http://localhost:3000
```

### Démarrer le frontend (choisir une option)

**Option 1 - Python 3:**
```bash
cd frontend
python -m http.server 8080
# Site : http://localhost:8080
```

**Option 2 - Python 2:**
```bash
cd frontend
python -m SimpleHTTPServer 8080
```

**Option 3 - Node.js (http-server):**
```bash
npm install -g http-server
cd frontend
http-server -p 8080
```

**Option 4 - VS Code Live Server:**
- Installer extension "Live Server"
- Clic droit sur index.html
- "Open with Live Server"

---

## 🗄️ Base de Données

### Accéder à la BDD
```bash
sqlite3 database/french-connexion.db
```

### Commandes SQLite utiles

**Voir les tables:**
```sql
.tables
```

**Voir tous les utilisateurs:**
```sql
SELECT * FROM users;
```

**Voir les paiements:**
```sql
SELECT * FROM payments;
```

**Voir les sessions actives:**
```sql
SELECT * FROM sessions WHERE expires_at > datetime('now');
```

**Marquer un utilisateur comme payé (TEST):**
```sql
UPDATE users SET has_paid = 1 WHERE email = 'test@example.com';
```

**Compter les utilisateurs:**
```sql
SELECT COUNT(*) FROM users;
```

**Nettoyer les sessions expirées:**
```sql
DELETE FROM sessions WHERE expires_at < datetime('now');
```

**Quitter SQLite:**
```sql
.exit
```

### Réinitialiser la BDD
```bash
rm database/french-connexion.db
cd backend
npm run init-db
```

---

## 🔑 Configuration

### Générer un JWT Secret
```bash
openssl rand -base64 32
```

### Créer le fichier .env
```bash
cd backend
cp .env.example .env
nano .env  # ou vim, code, etc.
```

---

## 📦 Git & GitHub

### Initialiser Git
```bash
git init
git add .
git commit -m "Initial commit"
```

### Pousser sur GitHub
```bash
git remote add origin https://github.com/ton-username/french-connexion.git
git branch -M main
git push -u origin main
```

### Mettre à jour
```bash
git add .
git commit -m "Description des changements"
git push
```

### Ignorer les fichiers sensibles
Déjà configuré dans `.gitignore` :
- `.env`
- `node_modules/`
- `*.db`

---

## 💳 Stripe

### Tester les webhooks en local (avancé)
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# ou télécharger sur stripe.com/docs/stripe-cli

# Se connecter
stripe login

# Écouter les webhooks
stripe listen --forward-to localhost:3000/api/payment/webhook

# Tester un paiement
stripe trigger checkout.session.completed
```

### Cartes de test Stripe
```
Succès : 4242 4242 4242 4242
Échec : 4000 0000 0000 0002
3D Secure : 4000 0027 6000 3184
```

---

## 🔍 Debug & Logs

### Voir les logs du backend
Le backend affiche les logs en temps réel dans la console.

### Nettoyer la console
```bash
clear  # ou Ctrl+L
```

### Tester l'API
```bash
# Health check
curl http://localhost:3000/api/health

# Avec formatage JSON
curl http://localhost:3000/api/health | json_pp
```

### Tester avec Postman
1. Télécharger Postman
2. Créer une requête POST vers `http://localhost:3000/api/auth/register`
3. Body → raw → JSON :
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test1234"
}
```

---

## 🧹 Nettoyage

### Nettoyer node_modules
```bash
cd backend
rm -rf node_modules
npm install
```

### Nettoyer tout
```bash
rm -rf backend/node_modules
rm database/french-connexion.db
cd backend
npm install
npm run init-db
```

---

## 📦 npm Scripts Disponibles

```bash
npm start       # Démarrer le serveur
npm run dev     # Démarrer avec nodemon (auto-restart)
npm run init-db # Initialiser la base de données
```

---

## 🌐 Déploiement

### Railway

**Déployer:**
- Connecter le repo GitHub
- Configurer les variables d'environnement
- Deploy automatique

**Accéder au shell:**
- Dashboard → Onglet "Shell"
- Exécuter : `npm run init-db`

**Voir les logs:**
- Dashboard → Onglet "Logs"

### Vercel

**Déployer:**
```bash
npm install -g vercel
cd frontend
vercel
```

**Configuration:**
- Root Directory: `frontend`
- Build Command: (vide)
- Output Directory: `./`

---

## 🔧 Troubleshooting

### Port déjà utilisé
```bash
# Trouver le process sur le port 3000
lsof -i :3000

# Tuer le process
kill -9 [PID]

# Ou utiliser un autre port
PORT=3001 npm start
```

### Réinstaller les dépendances
```bash
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Erreur SQLite
```bash
# Vérifier que le dossier database existe
mkdir -p database

# Réinitialiser
rm database/*.db
npm run init-db
```

---

## 📊 Monitoring Production

### Vérifier l'API
```bash
curl https://ton-backend.railway.app/api/health
```

### Télécharger la BDD (Railway)
Dans le shell Railway:
```bash
cp /app/database/french-connexion.db /tmp/backup-$(date +%Y%m%d).db
```

### Voir les utilisateurs actifs
```sql
SELECT COUNT(*) FROM sessions WHERE expires_at > datetime('now');
```

### Statistiques
```sql
-- Nombre total d'utilisateurs
SELECT COUNT(*) FROM users;

-- Nombre d'utilisateurs payants
SELECT COUNT(*) FROM users WHERE has_paid = 1;

-- Total des revenus
SELECT SUM(amount) FROM payments WHERE status = 'completed';

-- Ventes du mois
SELECT COUNT(*) FROM payments
WHERE status = 'completed'
AND created_at >= date('now', 'start of month');
```

---

## 🎯 Commandes One-Liners

**Tout démarrer:**
```bash
cd backend && npm start & cd ../frontend && python -m http.server 8080
```

**Setup complet:**
```bash
cd backend && npm install && npm run init-db && npm start
```

**Nettoyer et redémarrer:**
```bash
rm -rf backend/node_modules database/*.db && cd backend && npm install && npm run init-db && npm start
```

---

## 💡 Astuces

### Lancer en arrière-plan (Linux/Mac)
```bash
cd backend
nohup npm start > server.log 2>&1 &
```

### Voir le log en temps réel
```bash
tail -f server.log
```

### Arrêter le serveur en arrière-plan
```bash
pkill -f "node.*server.js"
```

### Auto-restart avec nodemon
```bash
npm install -g nodemon
cd backend
nodemon server.js
```

---

**Bon développement ! 💻**

⚜️ By FRENCH CONNEXION
