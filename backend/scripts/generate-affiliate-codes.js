/**
 * Script pour pré-générer des codes d'affiliation
 * Usage: node scripts/generate-affiliate-codes.js [nombre]
 */

require('dotenv').config();
const { supabase } = require('../config/supabase');

// Fonction pour générer un code unique
function generateCode() {
    return 'USER' + String(Math.floor(Math.random() * 999999)).padStart(6, '0');
}

// Fonction pour vérifier si un code existe
async function codeExists(code) {
    const { data } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', code)
        .single();

    return !!data;
}

// Fonction principale
async function generateCodes(count = 100) {
    console.log(`🚀 Génération de ${count} codes d'affiliation...\n`);

    const codes = [];
    let generated = 0;
    let attempts = 0;
    const maxAttempts = count * 10; // Maximum 10x le nombre demandé

    while (generated < count && attempts < maxAttempts) {
        attempts++;
        const code = generateCode();

        // Vérifier si le code existe déjà dans notre liste ou dans la DB
        if (!codes.includes(code) && !(await codeExists(code))) {
            codes.push(code);
            generated++;

            // Afficher la progression tous les 10 codes
            if (generated % 10 === 0) {
                console.log(`✅ ${generated}/${count} codes générés...`);
            }
        }
    }

    if (generated < count) {
        console.log(`⚠️  Impossible de générer ${count} codes uniques (${generated} générés)`);
    }

    // Sauvegarder dans un fichier
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', '..', 'affiliate-codes-pool.json');

    fs.writeFileSync(filePath, JSON.stringify({
        generated_at: new Date().toISOString(),
        total: codes.length,
        available: codes.length,
        codes: codes
    }, null, 2));

    console.log(`\n✅ ${codes.length} codes générés avec succès !`);
    console.log(`📁 Fichier sauvegardé : ${filePath}\n`);
    console.log(`Exemple de codes:`);
    codes.slice(0, 5).forEach(code => console.log(`   - ${code}`));
    console.log(`   - ...`);
}

// Exécution
const count = parseInt(process.argv[2]) || 100;
generateCodes(count)
    .then(() => {
        console.log('\n🎉 Terminé !');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Erreur:', error);
        process.exit(1);
    });
