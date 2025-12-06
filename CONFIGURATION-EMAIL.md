# 📧 CONFIGURATION SERVICE EMAIL

**French Connexion™ - Guide complet pour configurer l'envoi d'emails**

---

## 🎯 OPTIONS DISPONIBLES

Vous avez 3 options pour envoyer des emails :

1. **SendGrid** (Recommandé) - Gratuit jusqu'à 100 emails/jour
2. **Mailgun** - Gratuit jusqu'à 5000 emails/mois
3. **SMTP personnalisé** - Votre propre serveur email

---

## ✅ OPTION 1 : SendGrid (RECOMMANDÉ)

### Étape 1 : Créer un compte SendGrid

1. Aller sur https://sendgrid.com/
2. S'inscrire gratuitement (100 emails/jour)
3. Vérifier votre email

### Étape 2 : Créer une API Key

1. Aller dans **Settings → API Keys**
2. Cliquer sur **Create API Key**
3. Nom : `French-Connexion-Production`
4. Permissions : **Full Access**
5. Copier la clé API (elle ne sera affichée qu'une seule fois)

### Étape 3 : Configurer le .env

Ajouter dans `backend/.env` :

```env
# EMAIL SERVICE (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=contact@votre-domaine.fr
FROM_NAME=French Connexion™
```

### Étape 4 : Installer le module

```bash
cd backend
npm install @sendgrid/mail
```

### Étape 5 : Vérifier le domaine (IMPORTANT)

1. Dans SendGrid : **Settings → Sender Authentication**
2. Cliquer sur **Verify a Single Sender**
3. Remplir les informations :
   - From Email : `contact@votre-domaine.fr`
   - From Name : `French Connexion™`
   - Adresse, etc.
4. Vérifier l'email de confirmation

**OU** (recommandé pour production) :

1. **Authenticate Your Domain** (DNS)
2. Suivre les instructions pour ajouter les enregistrements DNS
3. Attendre la validation (24-48h)

---

## ✅ OPTION 2 : Mailgun

### Étape 1 : Créer un compte Mailgun

1. Aller sur https://www.mailgun.com/
2. S'inscrire (gratuit 5000 emails/mois)
3. Vérifier votre email

### Étape 2 : Récupérer les identifiants

1. Aller dans **Sending → Overview**
2. Copier :
   - **Domain** (ex: `sandboxXXXX.mailgun.org` ou votre domaine)
   - **API Key** (dans **Settings → API Keys**)

### Étape 3 : Configurer le .env

```env
# EMAIL SERVICE (Mailgun)
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=sandboxXXXX.mailgun.org
FROM_EMAIL=contact@sandboxXXXX.mailgun.org
FROM_NAME=French Connexion™
```

### Étape 4 : Installer les modules

```bash
cd backend
npm install mailgun.js form-data
```

---

## ✅ OPTION 3 : SMTP Personnalisé

### Avec Gmail (pour tests uniquement)

```env
# EMAIL SERVICE (SMTP Gmail)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-application
FROM_EMAIL=votre-email@gmail.com
FROM_NAME=French Connexion™
```

**⚠️ Gmail nécessite un mot de passe d'application :**
1. Activer 2FA sur Gmail
2. Générer un mot de passe d'application : https://myaccount.google.com/apppasswords

### Avec un serveur SMTP professionnel

```env
# EMAIL SERVICE (SMTP Pro)
EMAIL_PROVIDER=smtp
SMTP_HOST=mail.votre-domaine.fr
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@votre-domaine.fr
SMTP_PASS=votre-mot-de-passe
FROM_EMAIL=contact@votre-domaine.fr
FROM_NAME=French Connexion™
```

### Installer Nodemailer

```bash
cd backend
npm install nodemailer
```

---

## 🔧 INTÉGRATION DANS LE CODE

Le service email est déjà créé dans `backend/services/emailService.js`.

### Utiliser dans le webhook Stripe

Modifier `backend/routes/payment.js` pour envoyer les emails :

```javascript
const emailService = require('../services/emailService');

// Dans handleCheckoutCompleted()
async function handleCheckoutCompleted(session) {
    // ... code existant ...

    // Envoyer email de confirmation
    await emailService.sendPurchaseConfirmation(
        session.customer_email,
        session.metadata.user_name || 'Utilisateur',
        session.amount_total / 100,
        session.payment_intent
    );

    // Envoyer email de bienvenue (avec délai de 10 min)
    setTimeout(async () => {
        await emailService.sendWelcomeEmail(
            session.customer_email,
            session.metadata.user_name || 'Utilisateur'
        );
    }, 10 * 60 * 1000); // 10 minutes
}
```

---

## 📧 EMAILS DISPONIBLES

Les 5 templates email sont créés et prêts à l'emploi :

1. **purchase-confirmation.html** - Confirmation d'achat immédiate
2. **welcome.html** - Bienvenue dans French Connexion (10 min après)
3. **onboarding.html** - Motivation / Onboarding (48h après)
4. **affiliate-program.html** - Programme d'affiliation (5j après)
5. **follow-up.html** - Suivi / État d'esprit (7j après)

---

## 🤖 AUTOMATISATION DES SÉQUENCES D'EMAILS

Pour envoyer automatiquement les emails 48h, 5j, 7j après l'achat, vous avez 3 options :

### Option 1 : Supabase Edge Functions (Recommandé)

Créer une Edge Function qui s'exécute tous les jours et vérifie les achats :

```sql
-- Créer une table pour tracker les emails envoyés
CREATE TABLE email_sent (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id),
    email_type VARCHAR(50),
    sent_at TIMESTAMP DEFAULT NOW()
);
```

### Option 2 : Node-cron (Backend)

Installer et configurer node-cron :

```bash
npm install node-cron
```

```javascript
const cron = require('node-cron');

// Exécuter tous les jours à 10h
cron.schedule('0 10 * * *', async () => {
    // Récupérer les users qui ont acheté il y a 2 jours
    // Envoyer email onboarding
});
```

### Option 3 : Service externe (Zapier, Make)

1. Webhook Stripe → Zapier
2. Zapier → Delay (48h, 5j, 7j)
3. Zapier → SendGrid

---

## ✅ CHECKLIST DE CONFIGURATION

- [ ] Compte SendGrid/Mailgun/SMTP créé
- [ ] API Key récupérée
- [ ] Variables `.env` configurées
- [ ] Modules npm installés (`@sendgrid/mail` ou `mailgun.js` ou `nodemailer`)
- [ ] Domaine email vérifié (SendGrid/Mailgun)
- [ ] Test d'envoi réussi
- [ ] Intégration dans `payment.js` effectuée
- [ ] Séquence automatique configurée (optionnel)

---

## 🧪 TESTER L'ENVOI D'EMAIL

Créer un fichier de test `backend/test-email.js` :

```javascript
const emailService = require('./services/emailService');

async function test() {
    const result = await emailService.sendWelcomeEmail(
        'votre-email@gmail.com',
        'Test User'
    );

    if (result.success) {
        console.log('✅ Email envoyé avec succès !');
    } else {
        console.log('❌ Erreur:', result.error);
    }
}

test();
```

Exécuter :

```bash
cd backend
node test-email.js
```

---

## 📊 SUIVI DES EMAILS

### SendGrid

Dashboard → **Activity** → Voir tous les emails envoyés, ouverts, cliqués

### Mailgun

Dashboard → **Logs** → Historique complet des emails

---

## 💡 RECOMMANDATIONS

1. **Production** : Utiliser SendGrid ou Mailgun (jamais Gmail)
2. **Taux d'ouverture** : Personnaliser les sujets avec `{{PRENOM}}`
3. **Spam** : Toujours inclure un lien de désinscription
4. **RGPD** : Demander le consentement pour les emails marketing
5. **Test** : Toujours tester les emails avant le lancement

---

## 🚨 DÉPANNAGE

### Erreur : "API Key invalide"
- Vérifier que l'API Key est correcte dans `.env`
- Vérifier les permissions (Full Access)

### Erreur : "Unverified sender"
- Vérifier le domaine dans SendGrid/Mailgun
- Utiliser l'email vérifié dans `FROM_EMAIL`

### Emails non reçus
- Vérifier les spams
- Vérifier les logs du provider (SendGrid/Mailgun)
- Tester avec un autre email

### Module introuvable
- Vérifier que le module est installé : `npm list @sendgrid/mail`
- Réinstaller : `npm install @sendgrid/mail`

---

**⚜️ French Connexion™**
**Date de création :** 6 décembre 2025
