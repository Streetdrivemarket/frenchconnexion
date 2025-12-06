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

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = async (req, res, next) => {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', req.user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            console.log(`⚠️ Tentative d'accès admin refusée pour ${req.user.email}`);
            return res.status(403).json({
                error: 'Accès refusé.',
                message: 'Seuls les administrateurs peuvent accéder à cette ressource.'
            });
        }

        console.log(`✅ Accès admin autorisé pour ${req.user.email}`);
        next();
    } catch (error) {
        console.error('❌ Erreur vérification admin:', error);
        res.status(403).json({ error: 'Accès refusé.' });
    }
};

// ==========================================
// DEVENIR AFFILIÉ
// ==========================================
router.post('/register', authMiddleware, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est déjà affilié
        const { data: existing } = await supabase
            .from('affiliates')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Tu es déjà inscrit comme affilié.' });
        }

        // Essayer d'utiliser un code du pool
        let affiliateCode;
        const fs = require('fs');
        const path = require('path');
        const poolPath = path.join(__dirname, '..', '..', 'affiliate-codes-pool.json');

        try {
            if (fs.existsSync(poolPath)) {
                const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
                if (pool.codes && pool.codes.length > 0) {
                    // Prendre le premier code disponible
                    affiliateCode = pool.codes.shift();
                    pool.available = pool.codes.length;

                    // Sauvegarder le pool mis à jour
                    fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2));

                    console.log(`✅ Code pris du pool: ${affiliateCode} (${pool.available} restants)`);
                }
            }
        } catch (poolError) {
            console.log('⚠️  Impossible de lire le pool, génération via Supabase');
        }

        // Si pas de code du pool, générer via Supabase
        if (!affiliateCode) {
            const { data: codeData } = await supabaseAdmin.rpc('generate_affiliate_code');
            affiliateCode = codeData;
            console.log(`✅ Code généré via Supabase: ${affiliateCode}`);
        }

        // Récupérer le nom depuis le profil
        const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', req.user.id)
            .single();

        // Créer l'affilié
        const { data: affiliate, error } = await supabase
            .from('affiliates')
            .insert({
                user_id: req.user.id,
                affiliate_code: affiliateCode,
                name: profile?.name || req.user.user_metadata?.name || 'Affilié',
                email: req.user.email
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur création affilié:', error);
            return res.status(500).json({ error: 'Erreur lors de la création.' });
        }

        console.log('✅ Affilié créé:', affiliate.affiliate_code);

        res.status(201).json({
            message: 'Bienvenue dans le programme d\'affiliation !',
            affiliate: {
                code: affiliate.affiliate_code,
                link: `${process.env.FRONTEND_URL}/?ref=${affiliate.affiliate_code}`,
                commission_rate: affiliate.commission_rate
            }
        });

    } catch (error) {
        console.error('❌ Erreur register affiliate:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// RÉCUPÉRER MES STATS AFFILIÉ
// ==========================================
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Récupérer le profil affilié
        const { data: affiliate, error } = await supabase
            .from('affiliates')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error || !affiliate) {
            return res.status(404).json({ error: 'Profil affilié non trouvé.' });
        }

        // Récupérer les ventes récentes
        const { data: sales } = await supabase
            .from('affiliate_sales')
            .select('*')
            .eq('affiliate_id', affiliate.id)
            .order('created_at', { ascending: false })
            .limit(10);

        res.json({
            affiliate: {
                code: affiliate.affiliate_code,
                link: `${process.env.FRONTEND_URL}/?ref=${affiliate.affiliate_code}`,
                status: affiliate.status,
                commission_rate: affiliate.commission_rate
            },
            stats: {
                total_clicks: affiliate.total_clicks,
                total_sales: affiliate.total_sales,
                total_commission: affiliate.total_commission,
                total_paid: affiliate.total_paid,
                pending: (affiliate.total_commission - affiliate.total_paid).toFixed(2)
            },
            recent_sales: sales || []
        });

    } catch (error) {
        console.error('❌ Erreur stats affiliate:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// TRACKER UN CLIC (public)
// ==========================================
router.post('/track-click', async (req, res) => {
    try {
        const { ref } = req.body;

        if (!ref) {
            return res.status(400).json({ error: 'Code affilié manquant.' });
        }

        // Trouver l'affilié
        const { data: affiliate } = await supabase
            .from('affiliates')
            .select('id')
            .eq('affiliate_code', ref)
            .eq('status', 'active')
            .single();

        if (!affiliate) {
            return res.status(404).json({ error: 'Code affilié invalide.' });
        }

        // Enregistrer le clic
        await supabase
            .from('affiliate_clicks')
            .insert({
                affiliate_id: affiliate.id,
                ip_address: req.ip,
                user_agent: req.headers['user-agent'],
                referrer: req.headers['referer'] || req.headers['referrer']
            });

        console.log(`✅ Clic affilié tracké: ${ref}`);

        res.json({ message: 'Clic tracké.' });

    } catch (error) {
        console.error('❌ Erreur track click:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// ADMIN: LISTER TOUS LES AFFILIÉS
// ==========================================
router.get('/admin/list', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { data: affiliates, error } = await supabase
            .from('affiliates')
            .select('*')
            .order('total_sales', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Erreur lors de la récupération.' });
        }

        res.json({ affiliates });

    } catch (error) {
        console.error('❌ Erreur list affiliates:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// ADMIN: CONFIRMER UNE VENTE
// ==========================================
router.post('/admin/confirm-sale', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { affiliate_code, buyer_email, amount, stripe_payment_id } = req.body;

        // Trouver l'affilié
        const { data: affiliate } = await supabase
            .from('affiliates')
            .select('*')
            .eq('affiliate_code', affiliate_code)
            .single();

        if (!affiliate) {
            return res.status(404).json({ error: 'Affilié non trouvé.' });
        }

        // Calculer la commission
        const commission = (amount * affiliate.commission_rate / 100).toFixed(2);

        // Créer la vente
        const { data: sale, error } = await supabase
            .from('affiliate_sales')
            .insert({
                affiliate_id: affiliate.id,
                buyer_email: buyer_email,
                amount: amount,
                commission: commission,
                stripe_payment_id: stripe_payment_id,
                status: 'confirmed'
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur création vente:', error);
            return res.status(500).json({ error: 'Erreur lors de la création.' });
        }

        console.log(`✅ Vente confirmée: ${affiliate_code} → ${commission}€`);

        res.json({
            message: 'Vente confirmée !',
            sale: {
                id: sale.id,
                affiliate_code: affiliate_code,
                commission: commission,
                status: sale.status
            }
        });

    } catch (error) {
        console.error('❌ Erreur confirm sale:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// ADMIN: MARQUER UNE VENTE COMME PAYÉE
// ==========================================
router.post('/admin/mark-paid/:saleId', authMiddleware, isAdmin, async (req, res) => {
    try {
        const { saleId } = req.params;

        const { error } = await supabase
            .from('affiliate_sales')
            .update({
                status: 'paid',
                paid_at: new Date().toISOString()
            })
            .eq('id', saleId);

        if (error) {
            console.error('❌ Erreur mark paid:', error);
            return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
        }

        console.log(`✅ Vente marquée comme payée: ${saleId}`);

        res.json({ message: 'Vente marquée comme payée.' });

    } catch (error) {
        console.error('❌ Erreur mark paid:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// CLASSEMENT DES AFFILIÉS (public)
// ==========================================
router.get('/leaderboard', async (req, res) => {
    try {
        const { data: leaderboard, error } = await supabase
            .from('affiliates')
            .select('name, affiliate_code, total_sales, total_commission')
            .eq('status', 'active')
            .order('total_sales', { ascending: false })
            .limit(20);

        if (error) {
            console.error('❌ Erreur leaderboard:', error);
            return res.status(500).json({ error: 'Erreur lors de la récupération.' });
        }

        res.json({ leaderboard });

    } catch (error) {
        console.error('❌ Erreur leaderboard:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

// ==========================================
// MA POSITION DANS LE CLASSEMENT
// ==========================================
router.get('/my-rank', authMiddleware, async (req, res) => {
    try {
        // Récupérer mon profil affilié
        const { data: myAffiliate } = await supabase
            .from('affiliates')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (!myAffiliate) {
            return res.status(404).json({ error: 'Profil affilié non trouvé.' });
        }

        // Compter combien d'affiliés ont plus de ventes que moi
        const { count } = await supabase
            .from('affiliates')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .gt('total_sales', myAffiliate.total_sales);

        const rank = (count || 0) + 1;

        res.json({
            rank,
            total_sales: myAffiliate.total_sales,
            total_commission: myAffiliate.total_commission
        });

    } catch (error) {
        console.error('❌ Erreur my-rank:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;
