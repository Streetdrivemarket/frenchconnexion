const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { supabase, supabaseAdmin } = require('../config/supabase');

console.log('✅ Module de paiement chargé avec Stripe');

// Middleware auth Supabase
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

// Créer une session de paiement Stripe
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { affiliateRef } = req.body;

        // Vérifier si l'utilisateur a déjà payé
        const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', user.id)
            .single();

        if (profile && profile.has_paid) {
            return res.status(400).json({
                error: 'Tu as déjà acheté cet ebook.',
                message: 'Tu peux y accéder directement depuis le lecteur.'
            });
        }

        const price = parseFloat(process.env.EBOOK_PRICE) || 20.00;
        const currency = process.env.CURRENCY || 'eur';

        // Créer une session de paiement Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'French Connexion™ Ebook',
                            description: 'Accès à vie à l\'ebook French Connexion - Le Processus Complet',
                            images: [],
                        },
                        unit_amount: Math.round(price * 100),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/reader.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment.html?canceled=true`,
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                user_email: user.email,
                affiliate_ref: affiliateRef || ''
            }
        });

        res.json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Erreur création session Stripe:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la session de paiement.' });
    }
});

// Webhook Stripe pour gérer tous les événements de paiement
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('❌ Erreur webhook signature:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`📨 Webhook reçu: ${event.type}`);

    try {
        switch (event.type) {
            // ✅ PAIEMENT RÉUSSI (Checkout Session)
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;

            // ✅ PAIEMENT CONFIRMÉ (Payment Intent)
            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;

            // ❌ PAIEMENT ÉCHOUÉ
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;

            // 💰 REMBOURSEMENT
            case 'charge.refunded':
                await handleRefund(event.data.object);
                break;

            // ⏱️ PANIER ABANDONNÉ (Remarketing)
            case 'checkout.session.expired':
                await handleCheckoutExpired(event.data.object);
                break;

            default:
                console.log(`⚠️ Événement non géré: ${event.type}`);
        }
    } catch (error) {
        console.error(`❌ Erreur traitement événement ${event.type}:`, error);
        return res.status(500).json({ error: 'Erreur traitement webhook' });
    }

    res.json({ received: true });
});

// 🎯 Fonction: Paiement réussi via Checkout Session
async function handleCheckoutCompleted(session) {
    try {
        const userId = session.metadata.user_id;
        const affiliateRef = session.metadata.affiliate_ref;

        console.log(`✅ Checkout complété pour user ${userId}`);

        // Enregistrer le paiement
        const { error: paymentError } = await supabase
            .from('payments')
            .insert({
                user_id: userId,
                stripe_payment_id: session.payment_intent,
                stripe_customer_id: session.customer,
                amount: session.amount_total / 100,
                currency: session.currency,
                status: 'completed'
            });

        if (paymentError) {
            console.error('❌ Erreur enregistrement paiement:', paymentError);
        }

        // Mettre à jour le profil
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ has_paid: true })
            .eq('id', userId);

        if (profileError) {
            console.error('❌ Erreur mise à jour profil:', profileError);
        }

        console.log(`✅ Paiement confirmé pour l'utilisateur ${userId}`);

        // Gérer l'affiliation
        if (affiliateRef) {
            await handleAffiliateCommission(affiliateRef, session.customer_email, session.amount_total / 100, session.payment_intent);
        }

    } catch (error) {
        console.error('❌ Erreur handleCheckoutCompleted:', error);
        throw error;
    }
}

// 🎯 Fonction: Paiement confirmé via Payment Intent
async function handlePaymentSucceeded(paymentIntent) {
    try {
        const userId = paymentIntent.metadata.user_id;
        console.log(`✅ Payment Intent réussi: ${paymentIntent.id} pour user ${userId}`);

        // Log pour suivi
        await supabaseAdmin
            .from('payments')
            .update({ status: 'succeeded' })
            .eq('stripe_payment_id', paymentIntent.id);

    } catch (error) {
        console.error('❌ Erreur handlePaymentSucceeded:', error);
    }
}

// 🎯 Fonction: Paiement échoué
async function handlePaymentFailed(paymentIntent) {
    try {
        const userId = paymentIntent.metadata.user_id;
        const userEmail = paymentIntent.metadata.user_email;

        console.log(`❌ Paiement échoué pour ${userEmail}: ${paymentIntent.last_payment_error?.message || 'Erreur inconnue'}`);

        // Enregistrer l'échec pour remarketing
        await supabaseAdmin
            .from('payments')
            .insert({
                user_id: userId,
                stripe_payment_id: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                status: 'failed',
                error_message: paymentIntent.last_payment_error?.message || 'Payment failed'
            });

        // TODO: Envoyer email de récupération / proposition d'aide

    } catch (error) {
        console.error('❌ Erreur handlePaymentFailed:', error);
    }
}

// 🎯 Fonction: Remboursement
async function handleRefund(charge) {
    try {
        const paymentIntentId = charge.payment_intent;

        console.log(`💰 Remboursement effectué: ${charge.id} pour montant ${charge.amount_refunded / 100}€`);

        // Trouver le paiement
        const { data: payment } = await supabaseAdmin
            .from('payments')
            .select('user_id')
            .eq('stripe_payment_id', paymentIntentId)
            .single();

        if (payment) {
            // Révoquer l'accès
            await supabaseAdmin
                .from('profiles')
                .update({ has_paid: false })
                .eq('id', payment.user_id);

            // Mettre à jour le statut du paiement
            await supabaseAdmin
                .from('payments')
                .update({ status: 'refunded' })
                .eq('stripe_payment_id', paymentIntentId);

            console.log(`✅ Accès révoqué pour user ${payment.user_id} suite au remboursement`);
        }

    } catch (error) {
        console.error('❌ Erreur handleRefund:', error);
    }
}

// 🎯 Fonction: Panier abandonné (Remarketing)
async function handleCheckoutExpired(session) {
    try {
        const userEmail = session.customer_email || session.metadata.user_email;

        console.log(`⏱️ Panier abandonné pour ${userEmail}`);

        // TODO: Enregistrer pour campagne de remarketing email
        // Exemple: Envoyer email "Tu as oublié quelque chose..." avec lien de récupération

    } catch (error) {
        console.error('❌ Erreur handleCheckoutExpired:', error);
    }
}

// 🎯 Fonction: Gérer commission d'affiliation
async function handleAffiliateCommission(affiliateRef, buyerEmail, amount, paymentIntentId) {
    try {
        // Trouver l'affilié
        const { data: affiliate } = await supabaseAdmin
            .from('affiliates')
            .select('id, commission_rate')
            .eq('affiliate_code', affiliateRef)
            .single();

        if (affiliate) {
            const commission = (amount * affiliate.commission_rate / 100).toFixed(2);

            // Créer la vente affiliée
            const { error: saleError } = await supabaseAdmin
                .from('affiliate_sales')
                .insert({
                    affiliate_id: affiliate.id,
                    buyer_email: buyerEmail,
                    amount: amount,
                    commission: commission,
                    stripe_payment_id: paymentIntentId,
                    status: 'confirmed'
                });

            if (saleError) {
                console.error('❌ Erreur création vente affiliée:', saleError);
            } else {
                console.log(`✅ Vente affiliée créée: ${affiliateRef} → ${commission}€`);
            }
        }
    } catch (error) {
        console.error('❌ Erreur handleAffiliateCommission:', error);
    }
}

// Créer une intention de paiement (Payment Intent) pour paiement inline
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const { affiliateRef } = req.body || {};

        if (affiliateRef) {
            console.log('💰 Code affilié reçu:', affiliateRef);
        }
        console.log('💳 Création d\'une intention de paiement pour:', user.email);

        // Vérifier si l'utilisateur a déjà payé
        const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', user.id)
            .single();

        if (profile && profile.has_paid) {
            return res.status(400).json({
                error: 'Tu as déjà acheté cet ebook.',
                message: 'Tu peux y accéder directement depuis le lecteur.'
            });
        }

        const price = parseFloat(process.env.EBOOK_PRICE) || 20.00;
        const currency = process.env.CURRENCY || 'eur';

        // Créer une intention de paiement
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(price * 100), // Montant en centimes
            currency: currency,
            metadata: {
                user_id: user.id,
                user_email: user.email,
                product: 'French Connexion Ebook',
                affiliate_ref: affiliateRef || ''
            },
            description: 'French Connexion™ Ebook - Accès à vie'
        });

        console.log('✅ Payment Intent créé:', paymentIntent.id);

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('❌ Erreur création Payment Intent:', error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'intention de paiement.' });
    }
});

// Vérifier et confirmer le paiement
router.post('/verify-payment', authMiddleware, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;
        const user = req.user;

        console.log('🔍 Vérification du paiement:', paymentIntentId);

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment Intent ID manquant.' });
        }

        // Récupérer le Payment Intent depuis Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        console.log('📊 Statut du paiement:', paymentIntent.status);

        if (paymentIntent.status === 'succeeded') {
            const affiliateRef = paymentIntent.metadata.affiliate_ref;

            // Enregistrer le paiement
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    user_id: user.id,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                    status: 'completed',
                    stripe_payment_id: paymentIntent.id
                });

            if (paymentError) {
                console.error('❌ Erreur enregistrement paiement:', paymentError);
            }

            // Mettre à jour le profil
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    has_paid: true,
                    stripe_payment_intent_id: paymentIntent.id
                })
                .eq('id', user.id);

            if (profileError) {
                console.error('❌ Erreur mise à jour profil:', profileError);
            }

            console.log('✅ Paiement confirmé pour l\'utilisateur:', user.email);

            // Si vente affiliée, créer la commission
            if (affiliateRef) {
                const { data: affiliate } = await supabase
                    .from('affiliates')
                    .select('id, commission_rate')
                    .eq('affiliate_code', affiliateRef)
                    .single();

                if (affiliate) {
                    const amount = paymentIntent.amount / 100;
                    const commission = (amount * affiliate.commission_rate / 100).toFixed(2);

                    const { error: saleError } = await supabase
                        .from('affiliate_sales')
                        .insert({
                            affiliate_id: affiliate.id,
                            buyer_email: user.email,
                            amount: amount,
                            commission: commission,
                            stripe_payment_id: paymentIntent.id,
                            status: 'confirmed'
                        });

                    if (!saleError) {
                        console.log(`✅ Vente affiliée créée: ${affiliateRef} → ${commission}€`);
                    }
                }
            }

            res.json({
                success: true,
                message: 'Paiement confirmé avec succès !',
                has_paid: true
            });
        } else {
            console.log('⚠️ Paiement non réussi:', paymentIntent.status);
            res.status(400).json({
                error: 'Le paiement n\'a pas été confirmé.',
                status: paymentIntent.status
            });
        }
    } catch (error) {
        console.error('❌ Erreur vérification paiement:', error);
        res.status(500).json({ error: 'Erreur lors de la vérification du paiement.' });
    }
});

// Vérifier le statut du paiement
router.get('/check-payment', authMiddleware, async (req, res) => {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('has_paid')
            .eq('id', req.user.id)
            .single();

        res.json({
            has_paid: profile?.has_paid || false,
            message: profile?.has_paid ? 'Paiement confirmé !' : 'Aucun paiement trouvé.'
        });
    } catch (error) {
        console.error('Erreur vérification paiement:', error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});

module.exports = router;
