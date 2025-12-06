const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Middleware pour vérifier l'authentification
const authMiddleware = async (req, res, next) => {
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

        req.user = user;
        next();

    } catch (error) {
        console.error('❌ Erreur auth middleware:', error);
        res.status(401).json({ error: 'Non authentifié.' });
    }
};

// Middleware pour vérifier que l'utilisateur a payé
const verifyPayment = async (req, res, next) => {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', req.user.id)
            .single();

        if (!profile || !profile.has_paid) {
            console.log(`⚠️ Tentative d'accès au contenu payant refusée pour ${req.user.email}`);
            return res.status(403).json({
                error: 'Accès refusé.',
                message: 'Tu dois acheter l\'ebook pour accéder à ce contenu.',
                redirect: '/payment.html'
            });
        }

        console.log(`✅ Accès au contenu payant autorisé pour ${req.user.email}`);
        next();
    } catch (error) {
        console.error('❌ Erreur vérification paiement:', error);
        res.status(403).json({ error: 'Accès refusé.' });
    }
};

// ==========================================
// VÉRIFIER L'ACCÈS AU CONTENU PAYANT
// ==========================================
router.get('/access', authMiddleware, verifyPayment, async (req, res) => {
    res.json({
        access: true,
        message: 'Accès autorisé.',
        user: {
            id: req.user.id,
            email: req.user.email
        }
    });
});

// ==========================================
// RÉCUPÉRER LA PROGRESSION
// ==========================================
router.get('/progress', authMiddleware, verifyPayment, async (req, res) => {
    try {
        // Récupérer la progression depuis Supabase
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', req.user.id)
            .order('chapter_number', { ascending: true });

        if (error) {
            console.error('❌ Erreur récupération progression:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération de la progression.' });
        }

        res.json({
            progress: data || []
        });

    } catch (error) {
        console.error('❌ Erreur progression:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// SAUVEGARDER LA PROGRESSION
// ==========================================
router.post('/progress', authMiddleware, verifyPayment, async (req, res) => {
    try {
        const { chapter_number, completed, notes } = req.body;

        if (!chapter_number) {
            return res.status(400).json({ error: 'Numéro de chapitre requis.' });
        }

        // Upsert (insert ou update) avec Supabase
        const { data, error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: req.user.id,
                chapter_number: chapter_number,
                completed: completed || false,
                notes: notes || null,
                completed_at: completed ? new Date().toISOString() : null
            }, {
                onConflict: 'user_id,chapter_number'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur sauvegarde progression:', error);
            return res.status(500).json({ error: 'Erreur lors de la sauvegarde.' });
        }

        console.log(`✅ Progression sauvegardée: chapitre ${chapter_number}`);

        res.json({
            message: 'Progression sauvegardée.',
            progress: data
        });

    } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// METTRE À JOUR UNE NOTE
// ==========================================
router.put('/progress/:chapter_number/notes', authMiddleware, verifyPayment, async (req, res) => {
    try {
        const { chapter_number } = req.params;
        const { notes } = req.body;

        // Mettre à jour les notes avec Supabase
        const { data, error } = await supabase
            .from('user_progress')
            .update({ notes: notes })
            .eq('user_id', req.user.id)
            .eq('chapter_number', chapter_number)
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur mise à jour notes:', error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
        }

        res.json({
            message: 'Notes mises à jour.',
            progress: data
        });

    } catch (error) {
        console.error('❌ Erreur mise à jour notes:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// RÉINITIALISER LA PROGRESSION
// ==========================================
router.delete('/progress', authMiddleware, verifyPayment, async (req, res) => {
    try {
        // Supprimer toute la progression avec Supabase
        const { error } = await supabase
            .from('user_progress')
            .delete()
            .eq('user_id', req.user.id);

        if (error) {
            console.error('❌ Erreur réinitialisation progression:', error);
            return res.status(500).json({ error: 'Erreur lors de la réinitialisation.' });
        }

        console.log('✅ Progression réinitialisée');

        res.json({ message: 'Progression réinitialisée.' });

    } catch (error) {
        console.error('❌ Erreur réinitialisation:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;
