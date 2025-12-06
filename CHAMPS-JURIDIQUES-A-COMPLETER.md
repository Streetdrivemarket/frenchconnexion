# 📋 CHAMPS JURIDIQUES À COMPLÉTER

**⚠️ IMPORTANT : Les 18 champs suivants doivent être complétés avec les vraies informations de l'entreprise**

---

## 📄 CGV (Conditions Générales de Vente)

**Fichier :** `frontend/cgv.html`

### Champs à compléter :

1. **SIRET** (ligne ~50)
   - Actuellement : `[À COMPLÉTER - SIRET]`
   - Format attendu : 14 chiffres (ex: `123 456 789 00012`)

2. **Forme juridique** (ligne ~51)
   - Actuellement : `[À COMPLÉTER - ex: SASU, Auto-entrepreneur, etc.]`
   - Exemples : SASU, EURL, Auto-entrepreneur, SAS, SARL

3. **Adresse du siège social** (ligne ~52)
   - Actuellement : `[À COMPLÉTER - Adresse complète]`
   - Format : Numéro et rue, Code postal Ville, Pays

4. **Nom du directeur de publication** (ligne ~53)
   - Actuellement : `[À COMPLÉTER - Nom Prénom]`
   - Format : Prénom NOM (ex: Jean DUPONT)

5. **Hébergeur détails** (ligne ~54)
   - Actuellement : `[À COMPLÉTER - Si autre que Vercel]`
   - Si Vercel : Laisser "Vercel Inc."
   - Sinon : Nom complet de l'hébergeur + adresse

6. **Médiateur de la consommation** (ligne ~135)
   - Actuellement : `[À COMPLÉTER - Nom du médiateur]`
   - Exemples :
     - Médiateur de la consommation CNPM - MEDIATION
     - Association des Médiateurs Européens (AME CONSO)
   - Site web du médiateur requis

---

## 🔒 PRIVACY POLICY (Politique de Confidentialité)

**Fichier :** `frontend/privacy.html`

### Champs à compléter :

7. **Nom de l'entreprise** (ligne ~50)
   - Actuellement : `[À COMPLÉTER - Nom de l'entreprise]`
   - Nom officiel de l'entreprise

8. **Forme juridique** (ligne ~51)
   - Actuellement : `[À COMPLÉTER - Forme juridique]`
   - Exemples : SASU, Auto-entrepreneur, etc.

9. **SIRET** (ligne ~52)
   - Actuellement : `[À COMPLÉTER - SIRET]`
   - 14 chiffres

10. **Adresse** (ligne ~53)
    - Actuellement : `[À COMPLÉTER - Adresse]`
    - Adresse complète du siège social

11. **Email de contact** (ligne ~54)
    - Actuellement : `[À COMPLÉTER - Email]`
    - Email professionnel (ex: contact@french-connexion.fr)

12. **DPO (Délégué à la Protection des Données)** (ligne ~112)
    - Actuellement : `[À COMPLÉTER - Email DPO]`
    - Email du DPO ou mention "Pas de DPO désigné (TPE)"

13. **Hébergeur** (ligne ~205)
    - Actuellement : `[À COMPLÉTER - Si autre]`
    - Vercel Inc. (déjà rempli) ou autre

---

## ⚖️ MENTIONS LÉGALES

**Fichier :** `frontend/mentions-legales.html`

### Champs à compléter :

14. **Nom de l'éditeur** (ligne ~49)
    - Actuellement : `[À COMPLÉTER - Nom Prénom ou Raison Sociale]`
    - Format : Prénom NOM ou Raison sociale

15. **SIRET** (ligne ~50)
    - Actuellement : `[À COMPLÉTER - SIRET 14 chiffres]`
    - 14 chiffres

16. **Forme juridique** (ligne ~51)
    - Actuellement : `[À COMPLÉTER - SASU, Auto-entrepreneur, etc.]`
    - Forme juridique officielle

17. **Capital social** (ligne ~52)
    - Actuellement : `[À COMPLÉTER - Montant du capital ou "Sans capital" si auto-entrepreneur]`
    - Exemples : "1 000€" ou "Sans capital (auto-entrepreneur)"

18. **Adresse du siège** (ligne ~53)
    - Actuellement : `[À COMPLÉTER - Adresse complète]`
    - Adresse complète

19. **Email de contact** (ligne ~54)
    - Actuellement : `[À COMPLÉTER - Email]`
    - Email professionnel

20. **Numéro de téléphone** (ligne ~55)
    - Actuellement : `[À COMPLÉTER - Téléphone]`
    - Format : +33 X XX XX XX XX

---

## ✅ ACTIONS À EFFECTUER

### 1. Récupérer les informations réelles

- [ ] SIRET (sur le Kbis ou l'attestation URSSAF)
- [ ] Forme juridique (SASU, Auto-entrepreneur, etc.)
- [ ] Adresse du siège social
- [ ] Nom complet du directeur/gérant
- [ ] Email professionnel de contact
- [ ] Téléphone professionnel
- [ ] Capital social (si société) ou "Sans capital"
- [ ] Médiateur de consommation (inscription obligatoire pour e-commerce)

### 2. Remplacer les placeholders

**Commandes pour rechercher tous les placeholders :**

```bash
# Rechercher tous les [À COMPLÉTER]
grep -r "À COMPLÉTER" frontend/*.html

# Fichiers concernés :
# - frontend/cgv.html
# - frontend/privacy.html
# - frontend/mentions-legales.html
```

### 3. Valider la conformité

- [ ] RGPD : Privacy policy complète
- [ ] CGV : Toutes les mentions obligatoires
- [ ] Mentions légales : Identité complète de l'éditeur
- [ ] Médiateur de consommation : Coordonnées valides
- [ ] Hébergeur : Informations exactes

---

## 📝 NOTES IMPORTANTES

### Auto-entrepreneur (Micro-entreprise)
Si vous êtes auto-entrepreneur :
- Forme juridique : "Entreprise individuelle (auto-entrepreneur)"
- Capital social : "Sans capital"
- SIRET : 14 chiffres (sur l'attestation URSSAF)

### Société (SASU, EURL, SAS, SARL)
Si vous avez une société :
- Forme juridique : SASU, EURL, SAS ou SARL
- Capital social : Montant exact (ex: "1 000€")
- SIRET : 14 chiffres (sur le Kbis)
- Directeur de publication : Nom du gérant/président

### Médiateur de consommation
**OBLIGATOIRE pour e-commerce en France.**

Options recommandées :
1. **CNPM - MEDIATION**
   - Site : https://cnpm-mediation-consommation.eu
   - Coût : ~90€/an

2. **AME CONSO**
   - Site : https://www.mediationconso-ame.com
   - Coût : ~90€/an

3. **Médiateur de la FEVAD**
   - Site : https://www.mediateurfevad.fr
   - Coût : ~120€/an

---

## 🚨 SANCTIONS EN CAS DE NON-CONFORMITÉ

- Amende jusqu'à **75 000€** (RGPD)
- Amende jusqu'à **15 000€** (mentions légales manquantes)
- Amende jusqu'à **3 000€** (absence de médiateur de consommation)

**Il est IMPÉRATIF de compléter ces champs avant de lancer en production.**

---

**⚜️ French Connexion™**
**Date de création du document :** 6 décembre 2025
