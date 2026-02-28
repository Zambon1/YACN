/**
 * Migration utility for automatic schema setup
 * 
 * This module can be imported into server.js to run migrations automatically
 * on application startup.
 * 
 * Usage:
 *   import { runMigrationsOnStartup } from './utils/migrations.js';
 *   
 *   // Then in your start sequence:
 *   await runMigrationsOnStartup();
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

/**
 * Initialize migrations tracking table if it doesn't exist
 */
async function initializeMigrationsTable() {
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id SERIAL PRIMARY KEY,
            migration_name VARCHAR(255) UNIQUE NOT NULL,
            executed_at TIMESTAMP DEFAULT NOW(),
            status VARCHAR(50) DEFAULT 'completed'
        )
    `;

    try {
        await pool.query(createTableSQL);
        return true;
    } catch (error) {
        console.error('Failed to initialize migrations table:', error.message);
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
        console.error('Failed to fetch applied migrations:', error.message);
        throw error;
    }
}

/**
 * Get list of migration files from migrations directory
 */
function getMigrationFiles() {
    try {
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(file => file.endsWith('.sql') && file !== 'README.md')
            .sort(); // Sorts numerically (0001, 0002, etc.)
        return files;
    } catch (error) {
        console.error('Failed to read migrations directory:', error.message);
        throw error;
    }
}

/**
 * Read migration SQL file
 */
function readMigrationFile(filename) {
    const filepath = path.join(MIGRATIONS_DIR, filename);
    try {
        return fs.readFileSync(filepath, 'utf-8');
    } catch (error) {
        console.error(`Failed to read migration file ${filename}:`, error.message);
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
        console.error(`Failed to record migration ${migrationName}:`, error.message);
        throw error;
    }
}

/**
 * Execute a single migration
 */
async function executeMigration(migrationName) {
    const client = await pool.connect();
    try {
        const sql = readMigrationFile(migrationName);
        console.log(`  → Running: ${migrationName}`);
        
        // Execute migration in a transaction
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        
        // Record in migrations table
        await recordMigration(migrationName);
        console.log(`  ✓ Completed: ${migrationName}`);
        
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`  ✗ Failed: ${migrationName}`);
        console.error(`    Error: ${error.message}`);
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Run all pending migrations
 * This is the main function to call from server.js
 */
async function runMigrationsOnStartup() {
    try {
        console.log('🔄 Checking database migrations...');
        
        // Initialize migrations table
        await initializeMigrationsTable();
        
        // Get all migration files and applied migrations
        const allMigrations = getMigrationFiles();
        const appliedMigrations = await getAppliedMigrations();
        const pendingMigrations = allMigrations.filter(m => !appliedMigrations.includes(m));
        
        if (pendingMigrations.length === 0) {
            console.log('✓ Database schema is up to date\n');
            return true;
        }
        
        console.log(`📋 Running ${pendingMigrations.length} pending migration(s):\n`);
        
        // Execute each pending migration
        for (const migration of pendingMigrations) {
            await executeMigration(migration);
        }
        
        console.log('\n✓ All migrations completed successfully\n');
        return true;
    } catch (error) {
        console.error('\n✗ Migration error:', error.message);
        console.error('\nPlease check the error above and fix it before continuing.\n');
        throw error;
    }
}

/**
 * Get migration status (for debugging)
 */
async function getMigrationStatus() {
    try {
        await initializeMigrationsTable();
        
        const allMigrations = getMigrationFiles();
        const appliedMigrations = await getAppliedMigrations();
        const pendingMigrations = allMigrations.filter(m => !appliedMigrations.includes(m));
        
        return {
            total: allMigrations.length,
            applied: appliedMigrations.length,
            pending: pendingMigrations.length,
            migrations: {
                applied: appliedMigrations,
                pending: pendingMigrations
            }
        };
    } catch (error) {
        console.error('Failed to get migration status:', error.message);
        throw error;
    }
}

export {
    runMigrationsOnStartup,
    getMigrationStatus,
    getAppliedMigrations,
    getMigrationFiles
};
