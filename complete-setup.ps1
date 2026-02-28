# Complete Setup and Test Script for RentMatch

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RentMatch - Complete Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Check PostgreSQL
Write-Host "`n[Step 1/5] Checking PostgreSQL service..." -ForegroundColor Yellow
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($null -eq $pgService) {
    Write-Host "❌ PostgreSQL service not found!" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "PostgreSQL service is stopped. Starting it..." -ForegroundColor Yellow
    try {
        Start-Service $pgService.Name
        Start-Sleep -Seconds 3
        Write-Host "✅ PostgreSQL service started!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start PostgreSQL service" -ForegroundColor Red
        Write-Host "Please start it manually from Services" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ PostgreSQL service is running!" -ForegroundColor Green
}

# Step 2: Check if database exists
Write-Host "`n[Step 2/5] Checking if rentmatch database exists..." -ForegroundColor Yellow
$env:PGPASSWORD = "postgres"
$dbCheck = psql -U postgres -h localhost -p 5432 -t -c "SELECT 1 FROM pg_database WHERE datname = 'rentmatch';" 2>$null

if ($LASTEXITCODE -eq 0 -and $dbCheck.Trim() -eq "1") {
    Write-Host "✅ Database 'rentmatch' already exists!" -ForegroundColor Green
    $recreate = Read-Host "Do you want to recreate it? (y/N)"
    
    if ($recreate -eq 'y' -or $recreate -eq 'Y') {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        psql -U postgres -h localhost -p 5432 -c "DROP DATABASE rentmatch;" 2>$null
        Write-Host "Creating fresh database..." -ForegroundColor Yellow
        psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE rentmatch;" 2>$null
        Write-Host "✅ Database recreated!" -ForegroundColor Green
    }
} else {
    Write-Host "Creating database 'rentmatch'..." -ForegroundColor Yellow
    psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE rentmatch;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Create user
Write-Host "`n[Step 3/5] Setting up database user..." -ForegroundColor Yellow
$userCheck = psql -U postgres -h localhost -p 5432 -t -c "SELECT 1 FROM pg_roles WHERE rolname = 'rentmatch';" 2>$null

if ($LASTEXITCODE -eq 0 -and $userCheck.Trim() -eq "1") {
    Write-Host "✅ User 'rentmatch' already exists!" -ForegroundColor Green
} else {
    Write-Host "Creating user 'rentmatch'..." -ForegroundColor Yellow
    psql -U postgres -h localhost -p 5432 -c "CREATE USER rentmatch WITH PASSWORD 'rentmatch';" 2>$null
    Write-Host "✅ User created!" -ForegroundColor Green
}

# Grant privileges
Write-Host "Granting privileges..." -ForegroundColor Yellow
psql -U postgres -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE rentmatch TO rentmatch;" 2>$null
psql -U postgres -h localhost -p 5432 -d rentmatch -c "GRANT ALL ON SCHEMA public TO rentmatch;" 2>$null
psql -U postgres -h localhost -p 5432 -d rentmatch -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO rentmatch;" 2>$null
Write-Host "✅ Privileges granted!" -ForegroundColor Green

# Step 4: Run schema
Write-Host "`n[Step 4/5] Running database schema..." -ForegroundColor Yellow
$env:PGPASSWORD = "rentmatch"
psql -U rentmatch -h localhost -p 5432 -d rentmatch -f "database/base/000_base_schema.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema created successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Schema creation failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}

# Step 5: Verify tables
Write-Host "`n[Step 5/5] Verifying tables..." -ForegroundColor Yellow
$tables = psql -U rentmatch -h localhost -p 5432 -d rentmatch -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';" 2>$null
$tableCount = ($tables -split "`n" | Where-Object { $_.Trim() -ne "" }).Count

if ($tableCount -gt 0) {
    Write-Host "✅ Found $tableCount tables:" -ForegroundColor Green
    Write-Host $tables -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No tables found" -ForegroundColor Yellow
}

# Clean up
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

# Success message
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you have all dependencies:" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor Yellow
Write-Host "`n2. Start the server:" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor Yellow
Write-Host "`n3. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:5000/login.html" -ForegroundColor Yellow
Write-Host "`n4. Create an account and test!" -ForegroundColor White

Write-Host "`nFor testing the database directly, run:" -ForegroundColor Cyan
Write-Host "   .\test-db.ps1" -ForegroundColor Yellow

Write-Host "`n"
