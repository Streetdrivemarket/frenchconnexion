# 💳 Guide de Test des Paiements Stripe

## 🎯 Objectif
Tester le système de paiement sans utiliser de vraie carte bancaire.

---

## 📝 Étape 1 : Créer un compte Stripe (GRATUIT)

1. **Va sur** : https://dashboard.stripe.com/register
2. **Inscris-toi** avec ton email
3. **Active le Mode TEST** (toggle en haut à droite du dashboard)
4. **Ne pas activer ton compte** (pas besoin pour les tests)

---

## 🔑 Étape 2 : Récupérer tes clés API de TEST

1. **Va dans** : Developers > API keys
2. **Tu verras 2 clés** :
   - **Publishable key** (commence par `pk_test_...`)
   - **Secret key** (commence par `sk_test_...` - clique sur "Reveal")

3. **Copie ces deux clés** (on va les utiliser juste après)

---

## ⚙️ Étape 3 : Configurer les clés dans le projet

### A. Backend (.env)

Ouvre le fichier : `/backend/.env`

Remplace les lignes :
```bash
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
```

Par tes vraies clés :
```bash
STRIPE_SECRET_KEY=sk_test_51Nxxx...
STRIPE_PUBLISHABLE_KEY=pk_test_51Nxxx...
```

### B. Frontend (config.js)

Ouvre le fichier : `/frontend/js/config.js`

Remplace la ligne :
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_votre_cle_publique';
```

Par ta vraie clé publique :
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Nxxx...';
```

### C. Redémarre le serveur

```bash
# Arrête le serveur (Ctrl+C)
# Relance-le
./start.sh
```

---

## 💳 Étape 4 : Cartes de TEST Stripe

Utilise ces numéros de carte pour tester (MODE TEST SEULEMENT) :

### ✅ Paiement Réussi
```
Numéro de carte : 4242 4242 4242 4242
Date d'expiration : n'importe quelle date future (ex: 12/25)
CVC : n'importe quel 3 chiffres (ex: 123)
Code postal : n'importe lequel (ex: 75001)
```

### ❌ Paiement Refusé (carte déclinée)
```
Numéro de carte : 4000 0000 0000 0002
Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres
```

### 🔐 Authentification 3D Secure (à tester)
```
Numéro de carte : 4000 0027 6000 3184
Date d'expiration : n'importe quelle date future
CVC : n'importe quel 3 chiffres
```

**Plus de cartes de test** : https://stripe.com/docs/testing#cards

---

## 🧪 Étape 5 : Tester le flux complet

### 1. Créer un compte
```
http://localhost:8080/register.html
```
- Entre ton nom, email, mot de passe
- Clique sur "Créer mon compte"

### 2. Tu seras redirigé vers le paiement
```
http://localhost:8080/payment.html
```

### 3. Entre les infos de carte de TEST
```
Numéro : 4242 4242 4242 4242
Date : 12/25
CVC : 123
```

### 4. Clique sur "Payer 19,99€"

### 5. Si tout est OK, tu seras redirigé vers
```
http://localhost:8080/payment-success.html
```

### 6. Clique sur "Accéder à mon Ebook"
```
http://localhost:8080/reader.html
```

---

## 📊 Étape 6 : Vérifier le paiement dans Stripe

1. **Va sur** : https://dashboard.stripe.com/test/payments
2. **Tu verras** : Le paiement de 19,99€ avec le statut "Succeeded"
3. **Clique dessus** : Tu verras tous les détails

---

## 📧 Email de Confirmation (À FAIRE)

Pour l'instant, les emails ne sont **pas encore configurés**.

Tu as 3 options :

### Option 1 : Stripe Email (Gratuit)
Stripe peut envoyer automatiquement les reçus de paiement.

**Activation** :
1. Va dans Stripe Dashboard > Settings > Emails
2. Active "Successful payments"

### Option 2 : Service d'Email (Recommandé)
Utilise un service comme :
- **SendGrid** (100 emails/jour gratuits)
- **Mailgun** (5000 emails/mois gratuits le premier mois)
- **Brevo** (ex-Sendinblue) (300 emails/jour gratuits)

### Option 3 : Gmail SMTP (Pour dev seulement)
Utilise ton propre Gmail pour envoyer des emails.

---

## ✅ Checklist de Test

- [ ] Compte Stripe créé (Mode TEST activé)
- [ ] Clés Stripe copiées dans `.env` et `config.js`
- [ ] Serveur redémarré
- [ ] Inscription réussie
- [ ] Redirection vers payment.html
- [ ] Paiement avec carte 4242... réussi
- [ ] Redirection vers payment-success.html
- [ ] Accès au reader.html
- [ ] Paiement visible dans Stripe Dashboard

---

## 🐛 Problèmes Courants

### "Erreur serveur" lors du paiement
- ✅ Vérifie que les clés Stripe sont bien configurées
- ✅ Vérifie que le backend est lancé
- ✅ Ouvre la console (F12) pour voir l'erreur exacte

### La carte n'est pas acceptée
- ✅ Vérifie que tu es bien en **Mode TEST** dans Stripe
- ✅ Utilise bien les cartes de **TEST** (4242...)
- ✅ Ne pas utiliser de vraies cartes en mode test !

### Le paiement ne se valide pas
- ✅ Ouvre la console backend pour voir les logs
- ✅ Vérifie que la base de données existe
- ✅ Vérifie que l'utilisateur est bien connecté

---

## 🚀 Passage en Production

Quand tu seras prêt à accepter de vrais paiements :

1. **Active ton compte Stripe** (fournir documents d'identité)
2. **Désactive le Mode TEST**
3. **Remplace les clés TEST par les clés LIVE** :
   - `pk_live_...`
   - `sk_live_...`
4. **Change** `NODE_ENV=production` dans `.env`
5. **Configure un vrai système d'email**

---

## 📞 Support

- **Stripe Docs** : https://stripe.com/docs
- **Cartes de test** : https://stripe.com/docs/testing
- **Support Stripe** : https://support.stripe.com

---

**⚜️ French Connexion - Guide créé le 4 décembre 2024**
