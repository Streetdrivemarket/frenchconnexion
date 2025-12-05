/**
 * Script pour pré-générer des codes d'affiliation (VERSION SIMPLE SANS SUPABASE)
 * Usage: node scripts/generate-codes-simple.js [nombre]
 */

// Fonction pour générer un code unique
function generateCode() {
    return 'USER' + String(Math.floor(Math.random() * 999999)).padStart(6, '0');
}

// Fonction principale
function generateCodes(count = 100) {
    console.log(`🚀 Génération de ${count} codes d'affiliation...\n`);

    const codes = [];
    const codesSet = new Set();
    let generated = 0;
    let attempts = 0;
    const maxAttempts = count * 10; // Maximum 10x le nombre demandé

    while (generated < count && attempts < maxAttempts) {
        attempts++;
        const code = generateCode();

        // Vérifier si le code existe déjà dans notre set
        if (!codesSet.has(code)) {
            codesSet.add(code);
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

    const data = {
        generated_at: new Date().toISOString(),
        total: codes.length,
        available: codes.length,
        codes: codes
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`\n✅ ${codes.length} codes générés avec succès !`);
    console.log(`📁 Fichier sauvegardé : ${filePath}\n`);
    console.log(`Exemple de codes:`);
    codes.slice(0, 10).forEach(code => console.log(`   - ${code}`));
    if (codes.length > 10) {
        console.log(`   - ... (${codes.length - 10} autres codes)`);
    }
}

// Exécution
const count = parseInt(process.argv[2]) || 100;
generateCodes(count);

console.log('\n🎉 Terminé !');
