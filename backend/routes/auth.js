const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { supabase, supabaseAdmin } = require('../config/supabase');

// ==========================================
// INSCRIPTION
// ==========================================
router.post('/register',
    [
        body('name').trim().isLength({ min: 2 }).withMessage('Le nom doit contenir au moins 2 caractères'),
        body('email').isEmail().withMessage('Email invalide'),
        body('password')
            .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, password } = req.body;

            // Inscription avec Supabase Auth
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: false, // L'utilisateur doit confirmer son email
                user_metadata: {
                    name: name
                }
            });

            if (error) {
                console.error('❌ Erreur Supabase register:', error);

                if (error.message.includes('already registered')) {
                    return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
                }

                return res.status(400).json({ error: error.message });
            }

            console.log('✅ Utilisateur créé:', data.user.id);

            res.status(201).json({
                message: 'Compte créé avec succès !',
                userId: data.user.id,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    name: name
                }
            });

        } catch (error) {
            console.error('❌ Erreur inscription:', error);
            res.status(500).json({ error: 'Erreur lors de la création du compte.' });
        }
    }
);

// ==========================================
// CONNEXION
// ==========================================
router.post('/login',
    [
        body('email').isEmail().withMessage('Email invalide'),
        body('password').notEmpty().withMessage('Mot de passe requis')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Connexion avec Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ Erreur Supabase login:', error);
                return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
            }

            // Récupérer le profil
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            console.log('✅ Connexion réussie:', data.user.email);

            res.json({
                message: 'Connexion réussie !',
                token: data.session.access_token,
                session: data.session,
                user: {
                    id: data.user.id,
                    name: profile?.name || data.user.user_metadata.name,
                    email: data.user.email,
                    has_paid: profile?.has_paid || false
                }
            });

        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            res.status(500).json({ error: 'Erreur lors de la connexion.' });
        }
    }
);

// ==========================================
// DÉCONNEXION
// ==========================================
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (token) {
            // Déconnexion avec Supabase
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error('❌ Erreur déconnexion:', error);
            }
        }

        res.json({ message: 'Déconnexion réussie.' });

    } catch (error) {
        console.error('❌ Erreur déconnexion:', error);
        res.status(500).json({ error: 'Erreur lors de la déconnexion.' });
    }
});

// ==========================================
// MOT DE PASSE OUBLIÉ
// ==========================================
router.post('/forgot-password',
    [
        body('email').isEmail().withMessage('Email invalide')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email } = req.body;

            // Envoyer email de réinitialisation avec Supabase
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.FRONTEND_URL}/reset-password.html`
            });

            if (error) {
                console.error('❌ Erreur forgot password:', error);
            }

            // Toujours retourner succès (sécurité - ne pas révéler si l'email existe)
            res.json({
                message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
            });

        } catch (error) {
            console.error('❌ Erreur mot de passe oublié:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    }
);

// ==========================================
// RÉINITIALISER LE MOT DE PASSE
// ==========================================
router.post('/reset-password',
    [
        body('password')
            .isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { password } = req.body;
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({ error: 'Token manquant.' });
            }

            // Mettre à jour le mot de passe avec Supabase
            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                console.error('❌ Erreur reset password:', error);
                return res.status(401).json({ error: 'Token invalide ou expiré.' });
            }

            console.log('✅ Mot de passe réinitialisé');

            res.json({ message: 'Mot de passe réinitialisé avec succès !' });

        } catch (error) {
            console.error('❌ Erreur réinitialisation:', error);
            res.status(500).json({ error: 'Erreur serveur.' });
        }
    }
);

// ==========================================
// VÉRIFIER LA SESSION (nouveau)
// ==========================================
const sessionHandler = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Non authentifié.' });
        }

        // Vérifier le token avec Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Session invalide.' });
        }

        // Récupérer le profil
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: profile?.name || user.user_metadata.name,
                has_paid: profile?.has_paid || false
            }
        });

    } catch (error) {
        console.error('❌ Erreur vérification session:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

router.get('/session', sessionHandler);
router.get('/me', sessionHandler); // Alias pour compatibilité

module.exports = router;
