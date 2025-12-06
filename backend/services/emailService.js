const fs = require('fs');
const path = require('path');

/**
 * SERVICE EMAIL - FRENCH CONNEXION™
 *
 * Ce service gère l'envoi des emails marketing et transactionnels.
 * Compatible avec SendGrid, Mailgun, ou SMTP personnalisé.
 */

// Configuration email provider
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'sendgrid'; // 'sendgrid', 'mailgun', ou 'smtp'
const FROM_EMAIL = process.env.FROM_EMAIL || 'contact@french-connexion.fr';
const FROM_NAME = process.env.FROM_NAME || 'French Connexion™';

// SendGrid setup
let sgMail;
if (EMAIL_PROVIDER === 'sendgrid') {
    try {
        sgMail = require('@sendgrid/mail');
        if (process.env.SENDGRID_API_KEY) {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
            console.log('✅ SendGrid configuré');
        } else {
            console.warn('⚠️ SENDGRID_API_KEY manquante dans .env');
        }
    } catch (error) {
        console.warn('⚠️ Module @sendgrid/mail non installé. Installez avec: npm install @sendgrid/mail');
    }
}

// Mailgun setup
let mailgun;
if (EMAIL_PROVIDER === 'mailgun') {
    try {
        const Mailgun = require('mailgun.js');
        const formData = require('form-data');
        const mg = new Mailgun(formData);

        if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
            mailgun = mg.client({
                username: 'api',
                key: process.env.MAILGUN_API_KEY
            });
            console.log('✅ Mailgun configuré');
        } else {
            console.warn('⚠️ MAILGUN_API_KEY ou MAILGUN_DOMAIN manquantes dans .env');
        }
    } catch (error) {
        console.warn('⚠️ Module mailgun.js non installé. Installez avec: npm install mailgun.js form-data');
    }
}

// Nodemailer setup (SMTP)
let transporter;
if (EMAIL_PROVIDER === 'smtp') {
    try {
        const nodemailer = require('nodemailer');
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✅ SMTP configuré');
    } catch (error) {
        console.warn('⚠️ Module nodemailer non installé. Installez avec: npm install nodemailer');
    }
}

/**
 * Charger un template email HTML
 */
function loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '../emails', `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template introuvable: ${templateName}`);
        return null;
    }

    return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Remplacer les variables dans le template
 */
function replaceVariables(template, variables) {
    let html = template;

    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
    }

    return html;
}

/**
 * Envoyer un email via SendGrid
 */
async function sendWithSendGrid(to, subject, html) {
    if (!sgMail) {
        throw new Error('SendGrid non configuré');
    }

    const msg = {
        to: to,
        from: {
            email: FROM_EMAIL,
            name: FROM_NAME
        },
        subject: subject,
        html: html
    };

    await sgMail.send(msg);
}

/**
 * Envoyer un email via Mailgun
 */
async function sendWithMailgun(to, subject, html) {
    if (!mailgun) {
        throw new Error('Mailgun non configuré');
    }

    await mailgun.messages.create(process.env.MAILGUN_DOMAIN, {
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject: subject,
        html: html
    });
}

/**
 * Envoyer un email via SMTP
 */
async function sendWithSMTP(to, subject, html) {
    if (!transporter) {
        throw new Error('SMTP non configuré');
    }

    await transporter.sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: to,
        subject: subject,
        html: html
    });
}

/**
 * Fonction principale : envoyer un email
 */
async function sendEmail(to, subject, templateName, variables = {}) {
    try {
        // Charger le template
        let html = loadTemplate(templateName);

        if (!html) {
            throw new Error(`Template "${templateName}" introuvable`);
        }

        // Ajouter FRONTEND_URL par défaut
        const allVariables = {
            FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',
            ...variables
        };

        // Remplacer les variables
        html = replaceVariables(html, allVariables);

        // Envoyer selon le provider
        if (EMAIL_PROVIDER === 'sendgrid') {
            await sendWithSendGrid(to, subject, html);
        } else if (EMAIL_PROVIDER === 'mailgun') {
            await sendWithMailgun(to, subject, html);
        } else if (EMAIL_PROVIDER === 'smtp') {
            await sendWithSMTP(to, subject, html);
        } else {
            throw new Error(`Provider email inconnu: ${EMAIL_PROVIDER}`);
        }

        console.log(`✅ Email envoyé à ${to} (template: ${templateName})`);
        return { success: true };

    } catch (error) {
        console.error(`❌ Erreur envoi email à ${to}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * EMAILS MARKETING - French Connexion™
 */

// 1. Confirmation d'achat (envoyé immédiatement après paiement)
async function sendPurchaseConfirmation(userEmail, userName, amount, transactionId) {
    return await sendEmail(
        userEmail,
        '✅ Paiement confirmé - French Connexion™',
        'purchase-confirmation',
        {
            PRENOM: userName || 'Utilisateur',
            EMAIL: userEmail,
            MONTANT: amount,
            TRANSACTION_ID: transactionId
        }
    );
}

// 2. Email de bienvenue (envoyé 10 minutes après achat)
async function sendWelcomeEmail(userEmail, userName) {
    return await sendEmail(
        userEmail,
        '🔥 Bienvenue dans la French Connexion',
        'welcome',
        {
            PRENOM: userName || 'Utilisateur'
        }
    );
}

// 3. Email d'onboarding / motivation (envoyé 48h après achat)
async function sendOnboardingEmail(userEmail, userName) {
    return await sendEmail(
        userEmail,
        '🎯 Tu as l\'ebook. Et maintenant ?',
        'onboarding',
        {
            PRENOM: userName || 'Utilisateur'
        }
    );
}

// 4. Email programme d'affiliation (envoyé 5 jours après achat)
async function sendAffiliateEmail(userEmail, userName) {
    return await sendEmail(
        userEmail,
        '💰 Gagne 50% par vente - Programme d\'affiliation',
        'affiliate-program',
        {
            PRENOM: userName || 'Utilisateur'
        }
    );
}

// 5. Email de suivi / état d'esprit (envoyé 7 jours après achat)
async function sendFollowUpEmail(userEmail, userName) {
    return await sendEmail(
        userEmail,
        '🔥 Ça fait 7 jours - Tu as avancé ?',
        'follow-up',
        {
            PRENOM: userName || 'Utilisateur'
        }
    );
}

/**
 * SÉQUENCE AUTOMATIQUE D'EMAILS
 * (à implémenter avec un cron job ou Supabase Edge Functions)
 */
async function sendEmailSequence(userEmail, userName, purchaseDate) {
    // TODO: Implémenter avec un système de cron job
    // Exemple avec node-cron ou Supabase Edge Functions

    console.log(`📧 Séquence email planifiée pour ${userEmail}`);

    // Immédiat : Confirmation d'achat (géré par webhook Stripe)
    // +10 min : Bienvenue
    // +48h : Onboarding
    // +5j : Affiliation
    // +7j : Follow-up
}

module.exports = {
    sendEmail,
    sendPurchaseConfirmation,
    sendWelcomeEmail,
    sendOnboardingEmail,
    sendAffiliateEmail,
    sendFollowUpEmail,
    sendEmailSequence
};
