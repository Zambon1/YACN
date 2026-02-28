#!/usr/bin/env node
/**
 * Generate SQL migration from apartments.js data
 */

import { APARTMENTS } from '../data/apartments.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSqlString(str) {
    if (str === null || str === undefined) return 'NULL';
    return str.toString().replace(/'/g, "''");
}

function generateSqlInserts() {
    let sql = `-- Migration: Add apartment/property data structure and seed data
-- This migration extends the complex and unit tables to accommodate full apartment data

-- Add missing columns to complex table
ALTER TABLE complex 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS amenities TEXT[], -- Array of amenities
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_types TEXT[], -- Array of allowed pet types
ADD COLUMN IF NOT EXISTS max_pets INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pet_deposit INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_evictions BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_bankruptcies BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accepts_criminal_record BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS min_credit_score INT,
ADD COLUMN IF NOT EXISTS min_income_multiplier NUMERIC;

-- Add deposit column to unit table
ALTER TABLE unit
ADD COLUMN IF NOT EXISTS deposit INT;

-- Insert apartment data as complexes with their units
`;

    APARTMENTS.forEach((apt, index) => {
        const amenitiesArray = apt.amenities && apt.amenities.length > 0 
            ? `ARRAY[${apt.amenities.map(a => `'${escapeSqlString(a)}'`).join(', ')}]`
            : 'ARRAY[]::TEXT[]';
        
        const petTypesArray = apt.pet_types && apt.pet_types.length > 0
            ? `ARRAY[${apt.pet_types.map(p => `'${escapeSqlString(p)}'`).join(', ')}]`
            : 'ARRAY[]::TEXT[]';

        // Handle bedroom - convert "studio" to 0
        const bedroomValue = apt.bedrooms === 'studio' ? 0 : apt.bedrooms;

        sql += `
-- Apartment ${index + 1}: ${apt.name}
INSERT INTO complex (name, us_state, city, street, image, amenities, pets_allowed, pet_types, max_pets, pet_deposit, smoking_allowed, accepts_evictions, accepts_bankruptcies, accepts_criminal_record, min_credit_score, min_income_multiplier)
VALUES ('${escapeSqlString(apt.name)}', '${escapeSqlString(apt.state)}', '${escapeSqlString(apt.city)}', '${escapeSqlString(apt.address)}', '${escapeSqlString(apt.image)}', ${amenitiesArray}, ${apt.pets_allowed}, ${petTypesArray}, ${apt.max_pets}, ${apt.pet_deposit}, ${apt.smoking_allowed}, ${apt.accepts_evictions}, ${apt.accepts_bankruptcies}, ${apt.accepts_criminal_record}, ${apt.min_credit_score}, ${apt.min_income_multiplier});
INSERT INTO unit (complex_id, price, deposit, bedroom, bathroom, available) 
VALUES (currval('complex_id_seq'), ${apt.rent}, ${apt.deposit}, ${bedroomValue}, ${apt.bathrooms}, true);
`;
    });

    return sql;
}

try {
    const sqlContent = generateSqlInserts();
    const outputPath = path.join(__dirname, '..', 'migrations', '0004_add_apartment_data.sql');
    
    fs.writeFileSync(outputPath, sqlContent, 'utf-8');
    
    console.log(`✅ Successfully generated migration file: ${outputPath}`);
    console.log(`📊 Total apartments: ${APARTMENTS.length}`);
    console.log(`📝 File size: ${(sqlContent.length / 1024).toFixed(2)} KB`);
} catch (error) {
    console.error('❌ Error generating migration:', error);
    process.exit(1);
}
