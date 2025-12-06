// ========================================
// 🎮 ROUTES PROGRESSION GAMIFIÉE
// ========================================

const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// Middleware auth
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Non authentifié.' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Session invalide.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ Erreur auth:', error);
        res.status(401).json({ error: 'Non authentifié.' });
    }
};

// ========================================
// 📊 GET /api/progress/me
// Récupérer MA progression
// ========================================
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Récupérer la progression (utiliser supabaseAdmin pour bypass RLS si nécessaire)
        const { data: progress, error } = await supabaseAdmin
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Si pas de progression trouvée, initialiser
        if (error && error.code === 'PGRST116') {
            // Initialiser via fonction SQL
            const { error: initError } = await supabaseAdmin.rpc('initialize_user_progress', {
                p_user_id: userId
            });

            if (initError) {
                console.error('❌ Erreur init progression:', initError);
                return res.status(500).json({ error: 'Impossible d\'initialiser la progression' });
            }

            // Récupérer après init
            const { data: newProgress, error: fetchError } = await supabaseAdmin
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (fetchError) {
                console.error('❌ Erreur récupération après init:', fetchError);
                return res.status(500).json({ error: 'Impossible de récupérer la progression' });
            }

            return res.json({
                success: true,
                progress: newProgress
            });
        }

        if (error) {
            console.error('❌ Erreur récupération progression:', error);
            return res.status(500).json({ error: 'Impossible de récupérer la progression' });
        }

        res.json({
            success: true,
            progress
        });

    } catch (error) {
        console.error('❌ Erreur /api/progress/me:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ========================================
// 🔓 POST /api/progress/unlock
// Déverrouiller un chapitre
// ========================================
router.post('/unlock', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { chapter_id } = req.body;

        // Validation
        if (!chapter_id) {
            return res.status(400).json({ error: 'chapter_id requis' });
        }

        // Vérifier que l'utilisateur a bien payé
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('has_paid')
            .eq('id', userId)
            .single();

        if (profileError || !profile?.has_paid) {
            return res.status(403).json({ error: 'Accès refusé. Paiement requis.' });
        }

        // Déverrouiller via fonction SQL
        const { data, error } = await supabaseAdmin.rpc('unlock_chapter', {
            p_user_id: userId,
            p_chapter_id: chapter_id
        });

        if (error) {
            console.error('❌ Erreur unlock_chapter:', error);
            return res.status(500).json({ error: 'Impossible de déverrouiller le chapitre' });
        }

        // data est un array avec un seul élément
        const result = data && data.length > 0 ? data[0] : null;

        if (!result || !result.success) {
            return res.status(500).json({ error: 'Échec du déverrouillage' });
        }

        // Vérifier si un badge doit être attribué
        let badgeAwarded = null;
        const unlockedCount = result.unlocked_chapters ? JSON.parse(JSON.stringify(result.unlocked_chapters)).length : 0;

        // Badges selon progression
        if (unlockedCount === 3 && !await hasBadge(userId, 'first-steps')) {
            badgeAwarded = await awardBadge(userId, 'first-steps', '🎯 Premiers Pas');
        } else if (unlockedCount === 6 && !await hasBadge(userId, 'midway')) {
            badgeAwarded = await awardBadge(userId, 'midway', '⚡ Mi-Parcours');
        } else if (unlockedCount === 10 && !await hasBadge(userId, 'almost-there')) {
            badgeAwarded = await awardBadge(userId, 'almost-there', '🔥 Presque là');
        } else if (unlockedCount === 13 && !await hasBadge(userId, 'completed')) {
            badgeAwarded = await awardBadge(userId, 'completed', '👑 Maîtrise Complète');
        }

        // Message de shock selon le chapitre
        const shockMessage = getShockMessage(chapter_id, unlockedCount);

        res.json({
            success: true,
            unlocked_chapters: result.unlocked_chapters,
            completion_percentage: result.new_percentage,
            chapter_unlocked: chapter_id,
            shock_message: shockMessage,
            badge_awarded: badgeAwarded
        });

    } catch (error) {
        console.error('❌ Erreur /api/progress/unlock:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ========================================
// 🏆 POST /api/progress/badge
// Attribuer un badge manuellement
// ========================================
router.post('/badge', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { badge_id, badge_name } = req.body;

        if (!badge_id) {
            return res.status(400).json({ error: 'badge_id requis' });
        }

        const badge = await awardBadge(userId, badge_id, badge_name || badge_id);

        res.json({
            success: true,
            badge
        });

    } catch (error) {
        console.error('❌ Erreur /api/progress/badge:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ========================================
// 🔄 POST /api/progress/reset
// Reset la progression (DEV ONLY)
// ========================================
router.post('/reset', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Reset à l'état initial
        const { error } = await supabaseAdmin
            .from('user_progress')
            .update({
                unlocked_chapters: JSON.stringify(['chapter-1']),
                badges_earned: JSON.stringify([]),
                completion_percentage: 0,
                last_chapter_unlocked: 'chapter-1',
                chapters_completed: 0
            })
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Erreur reset:', error);
            return res.status(500).json({ error: 'Impossible de réinitialiser' });
        }

        res.json({
            success: true,
            message: 'Progression réinitialisée'
        });

    } catch (error) {
        console.error('❌ Erreur /api/progress/reset:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ========================================
// 📈 GET /api/progress/stats
// Statistiques globales (pour admin)
// ========================================
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Vérifier si admin (optionnel - pour l'instant tous les utilisateurs peuvent voir)

        const { data: stats, error } = await supabaseAdmin
            .from('user_progress')
            .select('completion_percentage, chapters_completed');

        if (error) {
            console.error('❌ Erreur stats:', error);
            return res.status(500).json({ error: 'Impossible de récupérer les stats' });
        }

        // Calculer moyennes
        const totalUsers = stats.length;
        const avgCompletion = stats.reduce((sum, s) => sum + s.completion_percentage, 0) / totalUsers;
        const avgChapters = stats.reduce((sum, s) => sum + s.chapters_completed, 0) / totalUsers;
        const completedUsers = stats.filter(s => s.completion_percentage === 100).length;

        res.json({
            success: true,
            stats: {
                total_users: totalUsers,
                avg_completion: Math.round(avgCompletion),
                avg_chapters: Math.round(avgChapters),
                completed_users: completedUsers,
                completion_rate: Math.round((completedUsers / totalUsers) * 100)
            }
        });

    } catch (error) {
        console.error('❌ Erreur /api/progress/stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ========================================
// 🛠️ FONCTIONS UTILITAIRES
// ========================================

// Vérifier si l'utilisateur a un badge
async function hasBadge(userId, badgeId) {
    const { data, error } = await supabaseAdmin
        .from('user_progress')
        .select('badges_earned')
        .eq('user_id', userId)
        .single();

    if (error || !data) return false;

    const badges = data.badges_earned || [];
    return badges.some(b => b.id === badgeId);
}

// Attribuer un badge
async function awardBadge(userId, badgeId, badgeName) {
    const { data, error } = await supabaseAdmin.rpc('add_badge', {
        p_user_id: userId,
        p_badge_id: JSON.stringify({ id: badgeId, name: badgeName, earned_at: new Date().toISOString() })
    });

    if (error) {
        console.error('❌ Erreur add_badge:', error);
        return null;
    }

    return { id: badgeId, name: badgeName };
}

// Messages de shock selon le chapitre
function getShockMessage(chapterId, unlockedCount) {
    const messages = {
        'chapter-2': '🔥 Tu avances. Pas mal.',
        'chapter-3': '⚡ 97% abandonnent ici. Pas toi.',
        'chapter-4': '💪 Tu commences à comprendre.',
        'chapter-5': '🎯 Tu es au milieu. Continue.',
        'chapter-6': '🚀 La moitié du chemin. Respect.',
        'chapter-7': '👀 Ça devient sérieux maintenant.',
        'chapter-8': '🔥 Tu es dans le top 10%.',
        'chapter-9': '💎 Presque là. Ne lâche rien.',
        'chapter-10': '⚡ Tu es dans le top 5%. Incroyable.',
        'chapter-11': '🏆 Plus que 2 chapitres. Tu vas y arriver.',
        'chapter-12': '👑 Dernier effort. La ligne d\'arrivée.',
        'chapter-13': '🎉 TU L\'AS FAIT. Tu fais partie des 1%.',
        'affiliation': '💰 Tu as fini le processus. Tu peux maintenant gagner de l\'argent.',
        'secrets': '🔐 BONUS DÉVERROUILLÉ. Les secrets sont à toi.'
    };

    return messages[chapterId] || '✅ Nouveau chapitre déverrouillé.';
}

module.exports = router;
