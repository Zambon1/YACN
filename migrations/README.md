# Database Migration System

This directory contains SQL migration files that build and maintain the RentMatch database schema.

## Migration Files

- **0001_build_database.sql** - Initial schema creation with all core tables
- **0002_add_user_role.sql** - Adds user role column for renter/landlord distinction

New migrations should follow the numbering pattern: `000N_description.sql`

## Running Migrations

### Option 1: Command Line (Recommended for Development)

```bash
# Run all pending migrations
node run-migrations.js

# Check current migration status
node run-migrations.js --status

# Reset migration tracking (advanced - requires --force flag)
node run-migrations.js --reset --force
```

### Option 2: Automatic on Server Startup

Add this to the top of your `server.js` startup code (after imports and before routes):

```javascript
import { runMigrationsOnStartup } from './utils/migrations.js';

// ... other imports and setup ...

// Run migrations on startup
try {
    await runMigrationsOnStartup();
} catch (error) {
    console.error('Failed to run migrations on startup');
    process.exit(1);
}

// ... then continue with routes and server.listen ...
```

### Option 3: Programmatic Usage

```javascript
import { runMigrationsOnStartup, getMigrationStatus } from './utils/migrations.js';

// Run migrations
await runMigrationsOnStartup();

// Check status
const status = await getMigrationStatus();
console.log(`Applied: ${status.applied}/${status.total}`);
```

## How It Works

1. **Initialization**: Creates `schema_migrations` table if it doesn't exist
2. **Discovery**: Reads all `.sql` files from this directory (sorted numerically)
3. **Comparison**: Checks which migrations have already been applied
4. **Execution**: Runs only pending migrations in order
5. **Tracking**: Records each completed migration with timestamp
6. **Rollback**: Uses database transactions - if a migration fails, it's automatically rolled back

## Migration Tracking

Each executed migration is recorded in the `schema_migrations` table:

```sql
CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) UNIQUE,
    executed_at TIMESTAMP,
    status VARCHAR(50)  -- 'completed' or 'failed'
);
```

This ensures:
- Migrations only run once (safe for repeated server restarts)
- Audit trail of schema changes
- Easy to identify which migration failed if there's an error

## Best Practices

✅ **DO:**
- Use descriptive filenames: `000X_short_description.sql`
- Include comments in SQL explaining what changed
- Test migrations on a copy of production data
- Keep migrations small and focused
- Use transactions (wrapped by the runner)

❌ **DON'T:**
- Edit migration files after they've been applied
- Use migrations for data manipulation (use separate scripts)
- Create migrations out of order
- Rely on specific database state that might change

## Troubleshooting

### Connection Error
```
❌ Cannot connect to PostgreSQL database
```
Solution: Check that PostgreSQL is running and `.env` has correct credentials

### Table Already Exists
```
ERROR: relation "users" already exists
```
Solution: The migration has already been applied. Run `node run-migrations.js --status` to check.

### Failed Migration
```
❌ Migration failed: 0001_build_database.sql
```
Solution: 
1. Check the error message for the SQL issue
2. Fix the `.sql` file
3. If the table partially created, manually clean up before re-running
4. Note: Failed migrations are NOT recorded, so they'll retry on next run

## Example: Creating a New Migration

1. Create file: `migrations/0003_add_new_table.sql`
2. Add your SQL:
```sql
-- Create new events table for tracking
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```
3. Run: `node run-migrations.js`
4. Verify: `node run-migrations.js --status`

## Environment Variables

The migration runner uses these from `.env`:
- `DB_USER` - PostgreSQL username (default: rentmatch)
- `DB_PASSWORD` - PostgreSQL password (default: rentmatch123)
- `DB_HOST` - PostgreSQL hostname (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - Database name (default: rentmatch)
