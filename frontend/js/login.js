// Script pour la page de connexion

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        hideError('error-message');

        // Désactiver le bouton
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';

        try {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            // Sauvegarder le token et les données utilisateur
            saveToken(response.token);
            saveUser(response.user);

            // Rediriger selon le statut de paiement
            if (response.user.has_paid) {
                window.location.href = 'reader.html';
            } else {
                window.location.href = 'payment.html';
            }
        } catch (error) {
            showError('error-message', error.message || 'Email ou mot de passe incorrect.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    });
});
