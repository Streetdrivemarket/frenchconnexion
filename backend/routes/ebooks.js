const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

/**
 * GET /api/ebooks
 * Récupère la liste de tous les ebooks disponibles
 */
router.get('/', async (req, res) => {
    try {
        const { data: ebooks, error } = await supabase
            .from('ebooks')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('❌ Erreur Supabase:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des ebooks',
                error: error.message
            });
        }

        res.json({
            success: true,
            ebooks: ebooks || []
        });

    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

/**
 * GET /api/ebooks/user/purchases
 * Récupère tous les ebooks achetés par l'utilisateur connecté
 * Nécessite authentification
 * IMPORTANT: Cette route doit être AVANT /:slug pour éviter que "user" soit interprété comme un slug
 */
router.get('/user/purchases', async (req, res) => {
    try {
        // Récupérer le token depuis le header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token manquant'
            });
        }

        const token = authHeader.split(' ')[1];

        // Vérifier le token avec Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }

        // Récupérer les achats de l'utilisateur avec les détails des ebooks
        const { data: purchases, error } = await supabase
            .from('user_purchases')
            .select(`
                *,
                ebook:ebooks (*)
            `)
            .eq('user_id', user.id)
            .order('purchased_at', { ascending: false });

        if (error) {
            console.error('❌ Erreur Supabase:', error);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des achats',
                error: error.message
            });
        }

        res.json({
            success: true,
            purchases: purchases || [],
            user_id: user.id
        });

    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

/**
 * GET /api/ebooks/check-access/:ebookId
 * Vérifie si l'utilisateur a accès à un ebook spécifique
 * Nécessite authentification
 * IMPORTANT: Cette route doit être AVANT /:slug
 */
router.get('/check-access/:ebookId', async (req, res) => {
    try {
        const { ebookId } = req.params;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token manquant',
                hasAccess: false
            });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({
                success: false,
                message: 'Token invalide',
                hasAccess: false
            });
        }

        // Vérifier si l'utilisateur a acheté cet ebook
        const { data: purchase, error } = await supabase
            .from('user_purchases')
            .select('*')
            .eq('user_id', user.id)
            .eq('ebook_id', ebookId)
            .single();

        const hasAccess = !error && purchase !== null;

        res.json({
            success: true,
            hasAccess,
            user_id: user.id,
            ebook_id: ebookId
        });

    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            hasAccess: false,
            error: error.message
        });
    }
});

/**
 * GET /api/ebooks/:slug
 * Récupère un ebook spécifique par son slug
 * IMPORTANT: Cette route dynamique doit être en DERNIER pour éviter de capturer les routes spécifiques
 */
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        const { data: ebook, error } = await supabase
            .from('ebooks')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !ebook) {
            return res.status(404).json({
                success: false,
                message: 'Ebook non trouvé'
            });
        }

        res.json({
            success: true,
            ebook
        });

    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur',
            error: error.message
        });
    }
});

module.exports = router;
