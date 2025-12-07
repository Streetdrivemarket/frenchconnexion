// Script pour la page de connexion - CONNEXION DIRECTE SUPABASE

// Configuration Supabase
const SUPABASE_URL = 'https://skiacrdysyzrjezpadvx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNraWFjcmR5c3l6cmplenBhZHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NjYwMTcsImV4cCI6MjA4MDU0MjAxN30.XZhLB9aqbxDeE-EpW156VZFA0YKrt2FJ2u-E3sIxmIs';

// Charger Supabase client
let supabaseClient = null;

// Fonction pour charger Supabase dynamiquement
async function loadSupabase() {
    if (!window.supabase) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        document.head.appendChild(script);

        await new Promise((resolve) => {
            script.onload = resolve;
        });
    }

    const { createClient } = window.supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {
    // Charger Supabase
    await loadSupabase();

    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        hideError('error-message');

        // Désactiver le bouton
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';

        try {
            console.log('🔐 Connexion à Supabase...');

            // Connexion directe à Supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('❌ Erreur Supabase:', error);
                throw new Error(error.message);
            }

            console.log('✅ Connexion réussie !', data);

            // Sauvegarder le token Supabase
            const token = data.session.access_token;
            localStorage.setItem('token', token);

            // Récupérer le profil utilisateur depuis notre API
            try {
                const profileResponse = await fetch(`${window.location.origin}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    localStorage.setItem('user', JSON.stringify(profileData.user));

                    // Rediriger selon le statut de paiement
                    if (profileData.user.has_paid) {
                        window.location.href = 'reader.html';
                    } else {
                        window.location.href = 'payment.html';
                    }
                } else {
                    // Si l'API échoue, rediriger quand même
                    console.warn('⚠️ Impossible de récupérer le profil, redirection vers payment');
                    window.location.href = 'payment.html';
                }
            } catch (apiError) {
                console.error('❌ Erreur API:', apiError);
                // Rediriger quand même
                window.location.href = 'payment.html';
            }

        } catch (error) {
            console.error('❌ Erreur connexion:', error);
            showError('error-message', error.message || 'Email ou mot de passe incorrect.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    });
});
