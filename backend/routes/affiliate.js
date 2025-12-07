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
        console.log('📝 Tentative inscription affilié pour:', req.user.email);
        console.log('📝 User ID:', req.user.id);

        // Vérifier que supabaseAdmin est disponible
        if (!supabaseAdmin) {
            console.error('❌ supabaseAdmin non initialisé!');
            return res.status(500).json({ error: 'Erreur config serveur: SUPABASE_SERVICE_KEY manquante' });
        }

        // Vérifier si l'utilisateur est déjà affilié
        const { data: existing, error: existingError } = await supabaseAdmin
            .from('affiliates')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (existing) {
            console.log('⚠️ Utilisateur déjà affilié:', existing.affiliate_code);
            return res.status(400).json({ error: 'Tu es déjà inscrit comme affilié.' });
        }

        // Générer un code affilié unique
        let affiliateCode;

        // Méthode simple : générer un code aléatoire
        const generateCode = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = 'FC';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        };

        affiliateCode = generateCode();
        console.log('✅ Code généré:', affiliateCode);

        // Récupérer le nom depuis le profil
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('name')
            .eq('id', req.user.id)
            .single();

        // Créer l'affilié (utiliser supabaseAdmin pour bypass RLS)
        const { data: affiliate, error } = await supabaseAdmin
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
            console.error('❌ Erreur création affilié:', JSON.stringify(error, null, 2));
            return res.status(500).json({
                error: `Erreur: ${error.message || error.code || JSON.stringify(error)}`
            });
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
        const { data: affiliate, error } = await supabaseAdmin
            .from('affiliates')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error || !affiliate) {
            return res.status(404).json({ error: 'Profil affilié non trouvé.' });
        }

        // Récupérer les ventes récentes
        const { data: sales } = await supabaseAdmin
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

module.exports = router;
