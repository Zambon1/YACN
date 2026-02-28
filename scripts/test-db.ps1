# Test Database Connection and Tables

Write-Host "Testing PostgreSQL connection for RentMatch..." -ForegroundColor Cyan

# Set password for psql
$env:PGPASSWORD = "rentmatch"

Write-Host "`n1. Testing connection to database..." -ForegroundColor Yellow
$dbExists = psql -U rentmatch -d rentmatch -h localhost -p 5432 -c "SELECT current_database();" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully connected to 'rentmatch' database!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to connect. Please run setup-db.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "`n2. Checking tables..." -ForegroundColor Yellow
$tables = psql -U rentmatch -d rentmatch -h localhost -p 5432 -t -c "\dt" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Tables found:" -ForegroundColor Green
    Write-Host $tables
} else {
    Write-Host "❌ Could not list tables" -ForegroundColor Red
}

Write-Host "`n3. Checking UUID extension..." -ForegroundColor Yellow
$uuidCheck = psql -U rentmatch -d rentmatch -h localhost -p 5432 -t -c "SELECT gen_random_uuid();" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ UUID generation working!" -ForegroundColor Green
} else {
    Write-Host "⚠️  UUID extension might not be enabled" -ForegroundColor Yellow
}

Write-Host "`n4. Checking table schemas..." -ForegroundColor Yellow

Write-Host "Users table:" -ForegroundColor Cyan
psql -U rentmatch -d rentmatch -h localhost -p 5432 -c "\d users" 2>$null

Write-Host "`nSessions table:" -ForegroundColor Cyan
psql -U rentmatch -d rentmatch -h localhost -p 5432 -c "\d sessions" 2>$null

Write-Host "`nApplications table:" -ForegroundColor Cyan
psql -U rentmatch -d rentmatch -h localhost -p 5432 -c "\d applications" 2>$null

Write-Host "`n5. Checking existing data..." -ForegroundColor Yellow
$userCount = psql -U rentmatch -d rentmatch -h localhost -p 5432 -t -c "SELECT COUNT(*) FROM users;" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "Users in database: $($userCount.Trim())" -ForegroundColor Cyan
} else {
    Write-Host "Could not count users" -ForegroundColor Red
}

Write-Host "`n✅ Database test complete!" -ForegroundColor Green
Write-Host "If all checks passed, you can start the server with 'npm start'" -ForegroundColor Cyan

# Clean up
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
