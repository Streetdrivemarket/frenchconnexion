// Script pour la page de paiement Stripe

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎨 Chargement de la page de paiement...');

    // Vérifier l'authentification
    if (!requireAuth()) {
        console.log('❌ Non authentifié, redirection vers login');
        return;
    }

    const user = getUser();
    console.log('👤 Utilisateur:', user);

    // Vérifier si l'utilisateur a déjà payé
    if (user && user.has_paid) {
        console.log('✅ Utilisateur a déjà payé, redirection vers reader');
        window.location.href = 'reader.html';
        return;
    }

    // Vérifier que la clé Stripe est configurée
    if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY === 'pk_test_votre_cle_publique') {
        console.error('❌ Clé Stripe non configurée !');
        const errorMsg = document.getElementById('error-message');
        errorMsg.textContent = 'Configuration Stripe manquante. Configure ta clé Stripe dans frontend/js/config.js';
        errorMsg.style.display = 'block';
        return;
    }

    console.log('🔑 Initialisation de Stripe avec la clé:', STRIPE_PUBLISHABLE_KEY.substring(0, 20) + '...');

    try {
        // Initialiser Stripe
        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        console.log('✅ Stripe initialisé');

        const form = document.getElementById('payment-form');
        const submitBtn = document.getElementById('submit-button');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');

        // Créer l'élément de carte Stripe
        const elements = stripe.elements();
        const cardElement = elements.create('card', {
            style: {
                base: {
                    fontSize: '14px',
                    color: '#ffffff',
                    fontFamily: 'Orbitron, sans-serif',
                    '::placeholder': {
                        color: '#666',
                    },
                },
                invalid: {
                    color: '#ff0000',
                },
            },
        });

        cardElement.mount('#card-element');
        console.log('✅ Élément de carte monté');

        // Gérer les erreurs de validation
        cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
                displayError.classList.add('visible');
                console.log('⚠️ Erreur carte:', event.error.message);
            } else {
                displayError.textContent = '';
                displayError.classList.remove('visible');
            }
        });

        // Gérer la soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('💳 Soumission du formulaire de paiement...');

            // Masquer les messages
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';

            // Désactiver le bouton
            submitBtn.disabled = true;
            buttonText.textContent = 'Traitement...';
            spinner.style.display = 'inline-block';

            try {
                console.log('⏳ Création de l\'intention de paiement...');

                // Récupérer le code affilié s'il existe
                const affiliateRef = localStorage.getItem('affiliate_ref');
                if (affiliateRef) {
                    console.log('💰 Code affilié détecté:', affiliateRef);
                }

                // Créer une intention de paiement
                const response = await apiRequest('/payment/create-payment-intent', {
                    method: 'POST',
                    body: JSON.stringify({ affiliateRef: affiliateRef })
                });

                console.log('✅ Intention de paiement créée:', response.clientSecret.substring(0, 20) + '...');

                // Confirmer le paiement avec Stripe
                const { error, paymentIntent } = await stripe.confirmCardPayment(
                    response.clientSecret,
                    {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                name: user.name,
                                email: user.email
                            }
                        }
                    }
                );

                if (error) {
                    console.error('❌ Erreur Stripe:', error);
                    throw new Error(error.message);
                }

                console.log('✅ Paiement confirmé:', paymentIntent);

                // Vérifier le paiement côté serveur
                const checkResponse = await apiRequest('/payment/verify-payment', {
                    method: 'POST',
                    body: JSON.stringify({
                        paymentIntentId: paymentIntent.id
                    })
                });

                console.log('✅ Paiement vérifié:', checkResponse);

                // Mettre à jour l'utilisateur local
                user.has_paid = true;
                saveUser(user);

                // Afficher le message de succès
                successMessage.textContent = '✅ Paiement réussi ! Redirection...';
                successMessage.style.display = 'block';

                // Rediriger vers la page de succès
                setTimeout(() => {
                    window.location.href = 'payment-success.html';
                }, 1500);

            } catch (error) {
                console.error('❌ Erreur lors du paiement:', error);
                errorMessage.textContent = error.message || 'Erreur lors du traitement du paiement.';
                errorMessage.style.display = 'block';
                submitBtn.disabled = false;
                buttonText.textContent = 'Payer 19,99€';
                spinner.style.display = 'none';
            }
        });

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de Stripe:', error);
        const errorMsg = document.getElementById('error-message');
        errorMsg.textContent = 'Erreur lors de l\'initialisation du paiement. Vérifie la configuration Stripe.';
        errorMsg.style.display = 'block';
    }
});
