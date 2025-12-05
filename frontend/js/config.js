// Configuration globale
// ⚠️ IMPORTANT: Remplace ces valeurs avec tes propres clés avant de déployer en production
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : 'https://french-connexion-ebook-2e0xd2y05-streetdrives-projects.vercel.app/api'; // Production URL

// Stripe publishable key - MODE LIVE PRODUCTION ⚠️
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51Safd5FKeI89dgT28Zwt8FznPowY2Z7N0Mdls0AeSn3WEjIgULBlwcYfvFDousgjPEk7Zxl9ssqNlCcImPOmx5LC00yH2Djj9g';

// Configuration de session
const SESSION_CHECK_INTERVAL = 60000; // Vérifier la session toutes les 60 secondes
const SESSION_TIMEOUT = 3600000; // 1 heure d'inactivité

// Helper pour les requêtes API
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('🌐 API Request:', {
        url: `${API_URL}${endpoint}`,
        method: config.method || 'GET',
        hasToken: !!token
    });

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        console.log('📡 API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ API Error:', data);
            throw new Error(data.error || 'Erreur réseau');
        }

        console.log('✅ API Success:', data);
        return data;
    } catch (error) {
        console.error('❌ Erreur API complète:', error);
        throw error;
    }
}

// Sauvegarder le token
function saveToken(token) {
    localStorage.setItem('token', token);
}

// Récupérer le token
function getToken() {
    return localStorage.getItem('token');
}

// Supprimer le token
function removeToken() {
    localStorage.removeItem('token');
}

// Sauvegarder les données utilisateur
function saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
}

// Récupérer les données utilisateur
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Supprimer les données utilisateur
function removeUser() {
    localStorage.removeItem('user');
}

// Déconnexion complète
function logout() {
    removeToken();
    removeUser();
    window.location.href = 'login.html';
}

// Afficher un message d'erreur
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

// Masquer un message d'erreur
function hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'none';
    }
}

// Afficher un message de succès
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

// Vérifier si l'utilisateur est connecté
function isAuthenticated() {
    return !!getToken();
}

// Rediriger vers login si non authentifié
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Vérifier si l'utilisateur a payé
function hasPaid() {
    const user = getUser();
    return user && user.has_paid;
}
