#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script runs all migrations from the migrations/ folder in order.
 * It tracks which migrations have been applied to avoid re-running them.
 * 
 * Usage:
 *   node run-migrations.js              (run all pending migrations)
 *   node run-migrations.js --reset      (reset and re-run all migrations)
 *   node run-migrations.js --status     (show migration status)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const args = process.argv.slice(2);

// PostgreSQL connection pool
const pool = new pg.Pool({
    user: process.env.DB_USER || 'rentmatch',
    password: process.env.DB_PASSWORD || 'rentmatch123',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'rentmatch'
});

/**
 * Initialize migrations table if it doesn't exist
 */
async function initializeMigrationsTable() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT NOW(),
                status VARCHAR(50) DEFAULT 'completed'
            )
        `);
        console.log('✓ Migrations table initialized');
    } catch (error) {
        console.error('✗ Failed to initialize migrations table:', error.message);
        throw error;
    }
}

/**
 * Get list of all applied migrations
 */
async function getAppliedMigrations() {
    try {
        const result = await pool.query(
            'SELECT migration_name FROM schema_migrations WHERE status = $1 ORDER BY executed_at',
            ['completed']
        );
        return result.rows.map(row => row.migration_name);
    } catch (error) {
        console.error('✗ Failed to fetch applied migrations:', error.message);
        throw error;
    }
}

/**
 * Get list of migration files
 */
function getMigrationFiles() {
    try {
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(file => file.endsWith('.sql'))
            .sort();
        return files;
    } catch (error) {
        console.error('✗ Failed to read migrations directory:', error.message);
        throw error;
    }
}

/**
 * Read migration file content
 */
function readMigrationFile(filename) {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    try {
        return fs.readFileSync(filepath, 'utf-8');
    } catch (error) {
        console.error(`✗ Failed to read migration file ${filename}:`, error.message);
        throw error;
    }
}

/**
 * Record migration as applied
 */
async function recordMigration(migrationName) {
    try {
        await pool.query(
            'INSERT INTO schema_migrations (migration_name, status) VALUES ($1, $2)',
            [migrationName, 'completed']
        );
    } catch (error) {
        console.error(`✗ Failed to record migration ${migrationName}:`, error.message);
        throw error;
    }
}

/**
 * Execute a migration
 */
async function executeMigration(migrationName) {
    const client = await pool.connect();
    try {
        const sql = readMigrationFile(migrationName);
        console.log(`⏳ Running migration: ${migrationName}`);
        
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        await recordMigration(migrationName);
        console.log(`✓ Migration completed: ${migrationName}`);
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ Migration failed: ${migrationName}`);
        console.error(`  Error: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Run all pending migrations
 */
async function runMigrations() {
    try {
        await initializeMigrationsTable();
        
        const allMigrations = getMigrationFiles();
        const appliedMigrations = await getAppliedMigrations();
        const pendingMigrations = allMigrations.filter(m => !appliedMigrations.includes(m));
        
        if (pendingMigrations.length === 0) {
            console.log('\n📊 Status: No pending migrations');
            return;
        }
        
        console.log(`\n📋 Found ${pendingMigrations.length} pending migration(s):\n`);
        
        for (const migration of pendingMigrations) {
            await executeMigration(migration);
        }
        
        console.log(`\n✅ All migrations completed successfully!\n`);
    } catch (error) {
        console.error('\n❌ Migration failed with error:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

/**
 * Show migration status
 */
async function showStatus() {
    try {
        await initializeMigrationsTable();
        
        const allMigrations = getMigrationFiles();
        const appliedMigrations = await getAppliedMigrations();
        
        console.log('\n📊 Migration Status:\n');
        console.log('Applied Migrations:');
        
        appliedMigrations.forEach(migration => {
            console.log(`  ✓ ${migration}`);
        });
        
        const pendingMigrations = allMigrations.filter(m => !appliedMigrations.includes(m));
        
        if (pendingMigrations.length > 0) {
            console.log('\nPending Migrations:');
            pendingMigrations.forEach(migration => {
                console.log(`  ⏳ ${migration}`);
            });
        } else {
            console.log('\nNo pending migrations');
        }
        
        console.log(`\nTotal: ${appliedMigrations.length}/${allMigrations.length} migrations applied\n`);
    } catch (error) {
        console.error('✗ Failed to show status:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

/**
 * Reset all migrations (dangerous!)
 */
async function resetMigrations() {
    try {
        const confirm = process.argv.includes('--force');
        
        if (!confirm) {
            console.log('\n⚠️  WARNING: This will delete all migration records and drop schema_migrations table');
            console.log('   Run with --force flag to confirm\n');
            return;
        }
        
        console.log('🔄 Resetting migrations...');
        
        await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
        console.log('✓ Migration tracking table dropped');
        
        console.log('\n⚠️  IMPORTANT: To re-create the database, you need to:');
        console.log('   1. Drop the PostgreSQL database');
        console.log('   2. Create a new database');
        console.log('   3. Run migrations again\n');
    } catch (error) {
        console.error('✗ Failed to reset migrations:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        // Test database connection
        console.log('🔗 Connecting to database...');
        const result = await pool.query('SELECT NOW()');
        console.log('✓ Database connection successful\n');
        
        if (args.includes('--status')) {
            await showStatus();
        } else if (args.includes('--reset')) {
            await resetMigrations();
        } else {
            await runMigrations();
        }
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.error('\n❌ Cannot connect to PostgreSQL database');
            console.error('   Make sure PostgreSQL is running on localhost:5432');
            console.error('   Or check your .env file for correct connection details\n');
        } else if (error.code === '3D000') {
            console.error('\n❌ Database does not exist');
            console.error('   Create the database first using the setup script\n');
        } else {
            console.error('\n❌ Error:', error.message);
        }
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { runMigrations, getMigrationFiles, getAppliedMigrations };
