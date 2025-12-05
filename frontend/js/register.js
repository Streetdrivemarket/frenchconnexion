// Script pour la page d'inscription

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Récupérer les valeurs
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;

        // Masquer les messages
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';

        // Validation côté client
        if (!terms) {
            errorMessage.textContent = 'Tu dois accepter les CGV pour continuer.';
            errorMessage.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            errorMessage.textContent = 'Les mots de passe ne correspondent pas.';
            errorMessage.style.display = 'block';
            return;
        }

        if (password.length < 8) {
            errorMessage.textContent = 'Le mot de passe doit contenir au moins 8 caractères.';
            errorMessage.style.display = 'block';
            return;
        }

        // Vérifier la complexité du mot de passe
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            errorMessage.textContent = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.';
            errorMessage.style.display = 'block';
            return;
        }

        // Désactiver le bouton
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Création en cours...';

        try {
            const response = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ name, email, password })
            });

            successMessage.textContent = 'Compte créé avec succès ! Redirection vers la connexion...';
            successMessage.style.display = 'block';

            // Connecter automatiquement l'utilisateur
            setTimeout(async () => {
                try {
                    const loginResponse = await apiRequest('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({ email, password })
                    });

                    saveToken(loginResponse.token);
                    saveUser(loginResponse.user);

                    // Rediriger vers la page de paiement
                    window.location.href = 'payment.html';
                } catch (error) {
                    // Si la connexion échoue, rediriger vers login
                    window.location.href = 'login.html';
                }
            }, 1500);
        } catch (error) {
            errorMessage.textContent = error.message || 'Une erreur est survenue lors de la création du compte.';
            errorMessage.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Créer mon compte';
        }
    });

    // Validation en temps réel du mot de passe
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value && confirmPasswordInput.value !== passwordInput.value) {
            confirmPasswordInput.style.borderColor = '#ff6b6b';
        } else {
            confirmPasswordInput.style.borderColor = '#ffffff';
        }
    });
});
