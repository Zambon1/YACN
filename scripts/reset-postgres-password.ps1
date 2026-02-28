# PostgreSQL Password Reset Script
# This script resets the postgres user password to "postgres"

Write-Host "PostgreSQL Password Reset Tool" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Configuration
$pgBinPath = "C:\Program Files\PostgreSQL\18\bin"
$pgDataPath = "C:\Program Files\PostgreSQL\18\data"
$hbaFile = "$pgDataPath\pg_hba.conf"
$hbaBackup = "$pgDataPath\pg_hba.conf.backup"
$newPassword = "postgres"

# Add PostgreSQL to PATH
$env:Path = "$pgBinPath;$env:Path"

Write-Host "Step 1: Backing up pg_hba.conf..." -ForegroundColor Yellow
Copy-Item -Path $hbaFile -Destination $hbaBackup -Force
Write-Host "✓ Backup created at $hbaBackup`n" -ForegroundColor Green

Write-Host "Step 2: Updating authentication to 'trust' mode..." -ForegroundColor Yellow
$hbaContent = Get-Content $hbaFile
$newHbaContent = $hbaContent -replace "scram-sha-256", "trust" -replace "md5", "trust"
Set-Content -Path $hbaFile -Value $newHbaContent
Write-Host "✓ Authentication updated`n" -ForegroundColor Green

Write-Host "Step 3: Restarting PostgreSQL service..." -ForegroundColor Yellow
$service = Get-Service -Name "postgresql*"
Restart-Service $service.Name -Force
Start-Sleep -Seconds 5
Write-Host "✓ Service restarted`n" -ForegroundColor Green

Write-Host "Step 4: Resetting postgres password to '$newPassword'..." -ForegroundColor Yellow
$env:PGPASSWORD = ""
$resetQuery = "ALTER USER postgres WITH PASSWORD '$newPassword';"
psql -U postgres -h localhost -c $resetQuery 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Password reset successful!`n" -ForegroundColor Green
} else {
    Write-Host "✗ Password reset failed`n" -ForegroundColor Red
    Write-Host "Restoring original configuration..." -ForegroundColor Yellow
    Copy-Item -Path $hbaBackup -Destination $hbaFile -Force
    Restart-Service $service.Name -Force
    exit 1
}

Write-Host "Step 5: Restoring original authentication settings..." -ForegroundColor Yellow
Copy-Item -Path $hbaBackup -Destination $hbaFile -Force
Write-Host "✓ Original settings restored`n" -ForegroundColor Green

Write-Host "Step 6: Restarting PostgreSQL service..." -ForegroundColor Yellow
Restart-Service $service.Name -Force
Start-Sleep -Seconds 5
Write-Host "✓ Service restarted`n" -ForegroundColor Green

Write-Host "Step 7: Testing new password..." -ForegroundColor Yellow
$env:PGPASSWORD = $newPassword
psql -U postgres -h localhost -c "SELECT 1;" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Password test successful!`n" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "SUCCESS! Your PostgreSQL password is now: $newPassword" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Write-Host "Updating your .env file..." -ForegroundColor Yellow
    $envPath = Join-Path $PSScriptRoot ".." ".env"
    if (Test-Path $envPath) {
        $envContent = Get-Content $envPath -Raw
        $envContent = $envContent -replace "DB_PASSWORD=.*", "DB_PASSWORD=$newPassword"
        Set-Content -Path $envPath -Value $envContent -NoNewline
        Write-Host "✓ .env file updated`n" -ForegroundColor Green
    }
    
    Write-Host "You can now restart your Node server!" -ForegroundColor Cyan
} else {
    Write-Host "✗ Password test failed`n" -ForegroundColor Red
    Write-Host "Please check the PostgreSQL logs for errors" -ForegroundColor Yellow
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
Read-Host "`nPress Enter to exit"
