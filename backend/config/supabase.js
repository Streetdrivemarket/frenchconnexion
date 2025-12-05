const { createClient } = require('@supabase/supabase-js');

// Vérifier que les variables d'environnement sont définies
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('');
    console.error('❌ ERREUR: SUPABASE NON CONFIGURÉ');
    console.error('');
    console.error('📝 Pour configurer Supabase, suis ces étapes :');
    console.error('');
    console.error('1. Va sur https://supabase.com et crée un compte (gratuit)');
    console.error('2. Crée un nouveau projet');
    console.error('3. Va dans Settings > API');
    console.error('4. Copie tes clés et mets-les dans backend/.env :');
    console.error('');
    console.error('   SUPABASE_URL=ta_vraie_url');
    console.error('   SUPABASE_ANON_KEY=ta_vraie_cle_anon');
    console.error('   SUPABASE_SERVICE_KEY=ta_vraie_cle_service');
    console.error('');
    console.error('📖 Guide complet : cat DEMARRAGE-RAPIDE.md');
    console.error('');
    process.exit(1);
}

// Vérifier que ce ne sont pas les placeholders
if (process.env.SUPABASE_URL.includes('xxxxxxxxxxxxx') ||
    process.env.SUPABASE_ANON_KEY.includes('xxxx')) {
    console.error('');
    console.error('❌ ERREUR: Les clés Supabase sont encore des placeholders !');
    console.error('');
    console.error('Tu dois remplacer les "xxxx" dans backend/.env par tes VRAIES clés Supabase');
    console.error('');
    console.error('📖 Lis le guide : cat DEMARRAGE-RAPIDE.md');
    console.error('');
    process.exit(1);
}

// Client Supabase (anon key - pour le frontend et backend)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: false // Backend n'a pas besoin de persister
        }
    }
);

// Client Supabase Admin (service role - pour opérations admin)
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

console.log('✅ Supabase connecté');
console.log(`🌍 URL: ${process.env.SUPABASE_URL}`);

module.exports = {
    supabase,
    supabaseAdmin
};
