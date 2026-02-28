#!/usr/bin/env node
/**
 * Update apartment images in database
 */

import { APARTMENTS } from '../data/apartments.js';
import db from '../utils/db.js';

async function updateImages() {
    try {
        console.log('🔄 Updating apartment images in database...\n');
        
        // Get all complexes
        const result = await db.query('SELECT id, name FROM complex ORDER BY id');
        const complexes = result.rows;
        
        console.log(`Found ${complexes.length} complexes in database`);
        console.log(`Found ${APARTMENTS.length} apartments in data file\n`);
        
        let updated = 0;
        let notFound = 0;
        
        // Update each apartment's image
        for (let i = 0; i < APARTMENTS.length && i < complexes.length; i++) {
            const apt = APARTMENTS[i];
            const complex = complexes[i];
            
            try {
                await db.query(
                    'UPDATE complex SET image = $1 WHERE id = $2',
                    [apt.image, complex.id]
                );
                updated++;
                console.log(`✓ ${updated}. ${complex.name || 'ID: ' + complex.id}: ${apt.image}`);
            } catch (error) {
                console.error(`✗ Failed to update ${complex.name}:`, error.message);
                notFound++;
            }
        }
        
        console.log(`\n✅ Updated ${updated} apartment images in database`);
        if (notFound > 0) {
            console.log(`⚠️  ${notFound} failed to update`);
        }
        
        await db.end();
    } catch (error) {
        console.error('❌ Error updating images:', error);
        process.exit(1);
    }
}

updateImages();
