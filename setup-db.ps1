# PostgreSQL Database Setup Script for RentMatch
# This script creates the database and sets up tables with comprehensive schema

Write-Host "Setting up PostgreSQL database for RentMatch..." -ForegroundColor Cyan
Write-Host "This includes users, settings, preferences, complexes, units, applications, guarantors, and more." -ForegroundColor Cyan

# Configuration from .env
$DB_NAME = "rentmatch"
$DB_USER = "rentmatch"
$DB_PASSWORD = "rentmatch"

# Check if PostgreSQL is running
Write-Host "Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($null -eq $pgService) {
    Write-Host "WARNING: PostgreSQL service not found. Please ensure PostgreSQL is installed and running." -ForegroundColor Red
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "PostgreSQL service is not running. Attempting to start..." -ForegroundColor Yellow
    Start-Service $pgService.Name
    Start-Sleep -Seconds 2
}

Write-Host "PostgreSQL service is running!" -ForegroundColor Green

# Set password environment variable for psql
$env:PGPASSWORD = "postgres"

# Create database
Write-Host "`nCreating database '$DB_NAME'..." -ForegroundColor Yellow
$createDbCommand = "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME';"
$dbExists = psql -U postgres -h localhost -p 5432 -t -c $createDbCommand 2>$null

if ($null -eq $dbExists -or $dbExists.Trim() -eq "") {
    psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE $DB_NAME;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database '$DB_NAME' created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to create database. You may need to create it manually." -ForegroundColor Red
    }
} else {
    Write-Host "Database '$DB_NAME' already exists." -ForegroundColor Yellow
}

# Create user if needed
Write-Host "`nCreating user '$DB_USER'..." -ForegroundColor Yellow
$userExists = psql -U postgres -h localhost -p 5432 -t -c "SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER';" 2>$null

if ($null -eq $userExists -or $userExists.Trim() -eq "") {
    psql -U postgres -h localhost -p 5432 -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "User '$DB_USER' created successfully!" -ForegroundColor Green
    }
} else {
    Write-Host "User '$DB_USER' already exists." -ForegroundColor Yellow
}

# Grant privileges
Write-Host "`nGranting privileges..." -ForegroundColor Yellow
psql -U postgres -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>$null
psql -U postgres -h localhost -p 5432 -d $DB_NAME -c "GRANT ALL ON SCHEMA public TO $DB_USER;" 2>$null

# Run schema file
Write-Host "`nRunning schema migrations..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASSWORD
psql -U $DB_USER -h localhost -p 5432 -d $DB_NAME -f "database/base/000_base_schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDatabase setup completed successfully!" -ForegroundColor Green
    Write-Host "You can now start the application with 'npm start'" -ForegroundColor Cyan
} else {
    Write-Host "`nSchema migration failed. Please check the error messages above." -ForegroundColor Red
}

# Clean up
Remove-Item Env:\PGPASSWORD
