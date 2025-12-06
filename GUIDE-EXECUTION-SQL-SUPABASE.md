# 🗄️ GUIDE : EXÉCUTER LE SQL DANS SUPABASE

**French Connexion™ - Instructions complètes pour créer les tables d'affiliation**

---

## 📋 FICHIER À EXÉCUTER

Le fichier SQL se trouve ici :
```
SUPABASE-AFFILIATION-SQL.sql
```

Ce fichier contient :
- ✅ 3 tables (affiliates, affiliate_sales, affiliate_clicks)
- ✅ Triggers automatiques pour mettre à jour les stats
- ✅ Fonction RPC generate_affiliate_code()
- ✅ Row Level Security (RLS) policies

---

## 🚀 MÉTHODE 1 : INTERFACE SUPABASE (RECOMMANDÉ)

### Étape 1 : Se connecter à Supabase

1. Aller sur https://supabase.com/
2. Se connecter avec votre compte
3. Sélectionner le projet **French Connexion**

### Étape 2 : Ouvrir l'éditeur SQL

1. Dans le menu de gauche, cliquer sur **SQL Editor**
2. Cliquer sur **New query** (bouton vert en haut à droite)

### Étape 3 : Copier-coller le SQL

1. Ouvrir le fichier `SUPABASE-AFFILIATION-SQL.sql`
2. **Tout sélectionner** (Ctrl+A)
3. **Copier** (Ctrl+C)
4. **Coller** dans l'éditeur SQL de Supabase (Ctrl+V)

### Étape 4 : Exécuter

1. Cliquer sur **Run** (bouton vert en bas à droite)
2. Attendre l'exécution (5-10 secondes)
3. Vérifier le message de succès en bas de la page

### Étape 5 : Vérifier la création des tables

1. Aller dans **Table Editor** (menu de gauche)
2. Vous devriez voir les nouvelles tables :
   - ✅ `affiliates`
   - ✅ `affiliate_sales`
   - ✅ `affiliate_clicks`

---

## 🔧 MÉTHODE 2 : LIGNE DE COMMANDE (AVANCÉ)

### Prérequis

Installer Supabase CLI :
```bash
npm install -g supabase
```

### Étape 1 : Login

```bash
supabase login
```

### Étape 2 : Lier le projet

```bash
supabase link --project-ref skiacrdysyzrjezpadvx
```

### Étape 3 : Exécuter le SQL

```bash
supabase db execute < SUPABASE-AFFILIATION-SQL.sql
```

---

## ✅ VÉRIFICATIONS APRÈS EXÉCUTION

### 1. Vérifier les tables

Dans Supabase → **Table Editor** :

**Table `affiliates`** doit contenir :
- id (bigint, primary key)
- user_id (uuid)
- affiliate_code (varchar, unique)
- total_clicks (int)
- total_sales (int)
- total_commission (numeric)
- commission_rate (numeric)
- is_active (boolean)
- created_at (timestamp)

**Table `affiliate_sales`** doit contenir :
- id (bigint, primary key)
- affiliate_id (bigint)
- buyer_email (varchar)
- amount (numeric)
- commission (numeric)
- stripe_payment_id (varchar)
- status (varchar)
- created_at (timestamp)

**Table `affiliate_clicks`** doit contenir :
- id (bigint, primary key)
- affiliate_id (bigint)
- ip_address (varchar)
- user_agent (text)
- referrer (text)
- clicked_at (timestamp)

### 2. Vérifier les triggers

Dans Supabase → **Database** → **Triggers** :

Vous devriez voir :
- ✅ `update_affiliate_stats_on_click`
- ✅ `update_affiliate_stats_on_sale`

### 3. Vérifier la fonction RPC

Dans Supabase → **Database** → **Functions** :

Vous devriez voir :
- ✅ `generate_affiliate_code()`

### 4. Tester la fonction RPC

Dans SQL Editor, exécuter :

```sql
SELECT generate_affiliate_code();
```

Résultat attendu :
```
FC5A8B9C
```

(Un code aléatoire de 8 caractères commençant par "FC")

---

## 🧪 TESTS MANUELS

### Test 1 : Créer un affilié

```sql
-- Remplacer USER_ID par un vrai UUID d'utilisateur
INSERT INTO affiliates (user_id, affiliate_code, commission_rate)
VALUES (
    'VOTRE-USER-UUID-ICI',
    'FCTEST01',
    50.00
);
```

### Test 2 : Créer une vente

```sql
-- Récupérer l'ID de l'affilié créé
INSERT INTO affiliate_sales (affiliate_id, buyer_email, amount, commission, status)
VALUES (
    1, -- ID de l'affilié
    'test@example.com',
    20.00,
    10.00,
    'confirmed'
);
```

### Test 3 : Vérifier les stats

```sql
SELECT * FROM affiliates WHERE affiliate_code = 'FCTEST01';
```

Résultat attendu :
- `total_sales` devrait être à **1**
- `total_commission` devrait être à **10.00**

### Test 4 : Créer un clic

```sql
INSERT INTO affiliate_clicks (affiliate_id, ip_address)
VALUES (1, '192.168.1.1');
```

### Test 5 : Vérifier les stats de clics

```sql
SELECT * FROM affiliates WHERE affiliate_code = 'FCTEST01';
```

Résultat attendu :
- `total_clicks` devrait être à **1**

---

## 🔒 VÉRIFIER LES POLICIES RLS

Dans Supabase → **Authentication** → **Policies** :

### Table `affiliates` :

- ✅ **SELECT** : Utilisateur peut voir ses propres données
- ✅ **INSERT** : Utilisateur peut devenir affilié
- ✅ **UPDATE** : Utilisateur peut mettre à jour ses infos

### Table `affiliate_sales` :

- ✅ **SELECT** : Affilié peut voir ses propres ventes
- ✅ **INSERT** : Système peut créer des ventes

### Table `affiliate_clicks` :

- ✅ **SELECT** : Affilié peut voir ses propres clics
- ✅ **INSERT** : Tout le monde peut créer un clic (anonyme)

---

## 🚨 ERREURS COURANTES

### Erreur : "relation already exists"

**Problème** : Les tables existent déjà.

**Solution** :
1. Supprimer les tables existantes :
```sql
DROP TABLE IF EXISTS affiliate_clicks CASCADE;
DROP TABLE IF EXISTS affiliate_sales CASCADE;
DROP TABLE IF EXISTS affiliates CASCADE;
```
2. Réexécuter le SQL complet

### Erreur : "permission denied"

**Problème** : Vous n'avez pas les droits.

**Solution** :
- Utiliser le **SQL Editor** de Supabase (pas psql direct)
- Vérifier que vous êtes Owner du projet

### Erreur : "foreign key violation"

**Problème** : L'ordre de création est incorrect.

**Solution** :
- Exécuter le SQL dans l'ordre exact du fichier
- Ne pas exécuter ligne par ligne

---

## 📊 VÉRIFICATION FINALE

Liste de vérification complète :

- [ ] 3 tables créées (`affiliates`, `affiliate_sales`, `affiliate_clicks`)
- [ ] Colonnes correctes dans chaque table
- [ ] Triggers créés et actifs
- [ ] Fonction `generate_affiliate_code()` disponible
- [ ] RLS policies actives
- [ ] Test d'insertion réussi
- [ ] Stats automatiques fonctionnelles (total_clicks, total_sales)

**Si toutes les cases sont cochées, le système d'affiliation est prêt !**

---

## 🔗 INTÉGRATION BACKEND

Après avoir créé les tables, le backend est déjà configuré :

✅ `/api/affiliate/register` - S'inscrire comme affilié
✅ `/api/affiliate/stats` - Voir ses stats
✅ `/api/affiliate/track-click` - Tracker un clic
✅ Webhook Stripe - Créer une vente affiliée automatiquement

**Aucune modification du code n'est nécessaire.**

---

## 💡 PROCHAINES ÉTAPES

Après l'exécution SQL :

1. ✅ Tester l'inscription affilié dans l'interface frontend
2. ✅ Tester le tracking de clic avec `?ref=FCTEST01`
3. ✅ Faire un achat test pour vérifier la commission
4. ✅ Vérifier le dashboard affilié

---

**⚜️ French Connexion™**
**Date de création :** 6 décembre 2025

---

## 📞 SUPPORT

En cas de problème :
1. Vérifier les logs dans Supabase → **Logs**
2. Vérifier la syntaxe SQL
3. Contacter le support Supabase si besoin
