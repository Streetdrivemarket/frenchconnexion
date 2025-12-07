require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
            connectSrc: ["'self'", "https://*.supabase.co", "https://api.stripe.com"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Configuration CORS - SIMPLIFIÉE pour Vercel
const corsOptions = {
    origin: true, // Autoriser toutes les origines (API publique)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400 // 24h cache pour preflight
};
app.use(cors(corsOptions));

// Headers CORS supplémentaires pour Vercel
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

    // Répondre immédiatement aux requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Protection XSS supplémentaire
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting global
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requêtes max par IP (augmenté pour dev/production)
    handler: (req, res) => {
        res.status(429).json({
            error: 'Trop de requêtes depuis cette IP, réessaye plus tard.'
        });
    }
});
app.use(limiter);

// Rate limiting pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Augmenté à 50 pour le dev
    handler: (req, res) => {
        res.status(429).json({
            error: 'Trop de tentatives de connexion. Réessaye dans 15 minutes.'
        });
    }
});

// Routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const readerRoutes = require('./routes/reader');
const affiliateRoutes = require('./routes/affiliate');
const progressRoutes = require('./routes/progress');
const ebooksRoutes = require('./routes/ebooks');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reader', readerRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ebooks', ebooksRoutes);

// Route de test
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'French Connexion API est en ligne ⚜️',
        timestamp: new Date().toISOString()
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.path
    });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
    console.error('❌ Erreur:', err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Une erreur est survenue'
            : err.message
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`⚜️  FRENCH CONNEXION API`);
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 http://localhost:${PORT}/api/health`);
});

module.exports = app;
