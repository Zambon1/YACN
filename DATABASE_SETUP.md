# PostgreSQL Database Setup for RentMatch

## Quick Setup (Automated)

Run the PowerShell setup script:

```powershell
.\setup-db.ps1
```

This script will:
1. Check if PostgreSQL is running
2. Create the `rentmatch` database
3. Create the `rentmatch` user with password `rentmatch`
4. Grant necessary privileges
5. Run schema migrations

## Manual Setup

If the automated script doesn't work, follow these steps:

### 1. Open PostgreSQL Command Line (psql)

Open PowerShell or Command Prompt and connect to PostgreSQL as the postgres superuser:

```bash
psql -U postgres
```

### 2. Create Database and User

```sql
-- Create the database
CREATE DATABASE rentmatch;

-- Create the user
CREATE USER rentmatch WITH PASSWORD 'rentmatch';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rentmatch TO rentmatch;

-- Connect to the database
\c rentmatch

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO rentmatch;

-- Exit psql
\q
```

### 3. Run Schema Migration

Connect as the rentmatch user and run the schema file:

```bash
psql -U rentmatch -d rentmatch -f database/base/000_base_schema.sql
```

### 4. Verify Setup

Check that tables were created:

```bash
psql -U rentmatch -d rentmatch -c "\dt"
```

You should see:
- users
- sessions
- applications

## Connection Configuration

The application uses these environment variables (already set in `.env`):

```
DB_USER=rentmatch
DB_PASSWORD=rentmatch
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rentmatch
```

## Starting the Application

After database setup is complete:

```bash
npm start
```

The server will connect to PostgreSQL and you should see:
```
✅ Connected to PostgreSQL database
Server running on http://localhost:5000
```

## Troubleshooting

### PostgreSQL Service Not Running

On Windows, start the PostgreSQL service:

```powershell
# Check status
Get-Service postgresql*

# Start if not running
Start-Service postgresql-x64-16  # Replace with your version
```

### Connection Refused

- Verify PostgreSQL is running on port 5432
- Check that `pg_hba.conf` allows local connections
- Ensure firewall isn't blocking port 5432

### Permission Denied

If you get permission errors when running the schema:

```bash
psql -U postgres -d rentmatch
GRANT ALL ON SCHEMA public TO rentmatch;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rentmatch;
```

### Reset Database

To start fresh:

```sql
psql -U postgres
DROP DATABASE rentmatch;
CREATE DATABASE rentmatch;
GRANT ALL PRIVILEGES ON DATABASE rentmatch TO rentmatch;
```

Then re-run the schema migration.
