# ========================================
# Car Insurance Prediction - Startup Script
# ========================================
# PowerShell version for starting all services
# Usage: .\START_ALL.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚗 Car Insurance Claim Prediction" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting all services..." -ForegroundColor Yellow
Write-Host ""

# Check if ports are available
function Check-Port {
    param([int]$Port)
    $listening = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object {$_.Port -eq $Port}
    if ($listening) {
        Write-Host "⚠️  Port $Port is already in use!" -ForegroundColor Red
        return $false
    }
    return $true
}

# Verify ports
Write-Host "Checking ports..." -ForegroundColor Blue
$ports = @(5001, 5000, 3000)
foreach ($port in $ports) {
    if (-not (Check-Port $port)) {
        Write-Host "Please close the application using port $port" -ForegroundColor Red
        exit
    }
}

Write-Host "✅ All ports available" -ForegroundColor Green
Write-Host ""

# Terminal 1: Flask ML API
Write-Host "[1/3] Starting Flask ML API on port 5001..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList '-NoExit -Command "cd E:\PROJECTS\car\backend\ml_api; python app.py"' -WindowStyle Normal
Start-Sleep -Seconds 3

# Terminal 2: Node.js Backend
Write-Host "[2/3] Starting Node.js Backend on port 5000..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList '-NoExit -Command "cd E:\PROJECTS\car\backend; npm start"' -WindowStyle Normal
Start-Sleep -Seconds 3

# Terminal 3: React Frontend
Write-Host "[3/3] Starting React Frontend on port 3000..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList '-NoExit -Command "cd E:\PROJECTS\car; npm start"' -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All services started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the application at:" -ForegroundColor Yellow
Write-Host "  🎨 Frontend:  http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Services Running:" -ForegroundColor Yellow
Write-Host "  📊 ML API (Flask):      http://127.0.0.1:5001" -ForegroundColor Green
Write-Host "  🔌 Backend (Node.js):   http://localhost:5000" -ForegroundColor Green
Write-Host "  🎨 Frontend (React):    http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Logs will appear in separate windows above" -ForegroundColor Cyan
Write-Host ""
