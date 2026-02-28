#!/usr/bin/env node
/**
 * Quick Database Setup for RentMatch
 * Creates the rentmatch database and runs migrations
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create connection to default postgres database
const adminPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres'
    // No password needed for trust auth
});

// Create connection to rentmatch database (will be used after creation)
const rentmatchPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'rentmatch',
    user: 'postgres'
    // No password needed for trust auth
});

async function setupDatabase() {
    try {
        console.log('🔧 RentMatch Database Setup\n');
        
        // Step 1: Connect to postgres and create rentmatch database
        console.log('Step 1: Creating rentmatch database...');
        const adminClient = await adminPool.connect();
        
        try {
            // Check if database exists
            const dbCheck = await adminClient.query(
                "SELECT 1 FROM pg_database WHERE datname = 'rentmatch'"
            );
            
            if (dbCheck.rows.length === 0) {
                // Create database
                await adminClient.query('CREATE DATABASE rentmatch');
                console.log('✓ Database created\n');
            } else {
                console.log('✓ Database already exists\n');
            }
        } finally {
            adminClient.release();
        }
        
        // Step 2: Run migrations
        console.log('Step 2: Running migrations...');
        const migrationsDir = path.join(__dirname, '..', 'migrations');
        
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();
        
        if (migrationFiles.length === 0) {
            console.log('⚠ No migration files found in migrations/ folder');
            console.log('Create migration SQL files first\n');
        } else {
            for (const file of migrationFiles) {
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf-8');
                
                try {
                    console.log(`  Running ${file}...`);
                    await rentmatchPool.query(sql);
                    console.log(`  ✓ ${file} completed`);
                } catch (error) {
                    console.error(`  ✗ ${file} failed:`, error.message);
                    throw error;
                }
            }
            console.log('\n✓ All migrations completed\n');
        }
        
        console.log('✅ Database setup complete!');
        console.log('You can now start the server: npm start\n');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('Details:', error);
        process.exit(1);
    } finally {
        await adminPool.end();
        await rentmatchPool.end();
    }
}

setupDatabase();
