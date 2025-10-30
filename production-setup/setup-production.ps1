# Budget Byahe - Production Setup Script (PowerShell)
# This script helps configure environment variables for Hostinger deployment

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Budget Byahe - Production Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure your production environment." -ForegroundColor Yellow
Write-Host "Please have your Hostinger credentials ready." -ForegroundColor Yellow
Write-Host ""

# Get domain information
Write-Host "--- Domain Configuration ---" -ForegroundColor Green
$FRONTEND_DOMAIN = Read-Host "Enter your frontend domain (e.g., www.budgetbyahe.com)"
$BACKEND_DOMAIN = Read-Host "Enter your backend domain (e.g., api.budgetbyahe.com)"

# Get database information
Write-Host ""
Write-Host "--- Database Configuration ---" -ForegroundColor Green
$DB_NAME = Read-Host "Enter database name"
$DB_USERNAME = Read-Host "Enter database username"
$DB_PASSWORD = Read-Host "Enter database password"

# Create backend .env.production
Write-Host ""
Write-Host "Creating backend .env.production file..." -ForegroundColor Yellow

$backendEnv = @"
APP_NAME="Budget Byahe"
APP_ENV=production
APP_KEY=base64:8Fc0wXyeTdKgXO7DUXcGqH9UBn8Yoe8NDJPBXmDI3GU=
APP_DEBUG=false
APP_URL=https://$BACKEND_DOMAIN

FRONTEND_URL=https://$FRONTEND_DOMAIN

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=$DB_NAME
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@$FRONTEND_DOMAIN
MAIL_FROM_NAME="`${APP_NAME}"

FIREBASE_CREDENTIALS=/path/to/storage/firebase-service-account.json

SESSION_DOMAIN=.$($FRONTEND_DOMAIN -replace '^www\.', '')
SANCTUM_STATEFUL_DOMAINS=$FRONTEND_DOMAIN
"@

$backendEnv | Out-File -FilePath "transpo-system-backend\.env.production" -Encoding UTF8
Write-Host "[OK] Backend .env.production created" -ForegroundColor Green

# Create frontend .env.production
Write-Host "Creating frontend .env.production file..." -ForegroundColor Yellow

$frontendEnv = @"
# Production Environment Variables
REACT_APP_API_URL=https://$BACKEND_DOMAIN
REACT_APP_URL=https://$FRONTEND_DOMAIN

# Map Services - Copy from your .env file
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoiY2VkaWVlZSIsImEiOiJjbWJicG94NGswbnFxMmpxMTc5cm93Y2tkIn0.WG-O3ewDyQ8n1w5OYSvCag

# AI Services - Copy from your .env file
REACT_APP_GROQ_API_KEY=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

NODE_ENV=production
"@

$frontendEnv | Out-File -FilePath "transpo-system-frontend\.env.production" -Encoding UTF8
Write-Host "checkmark Frontend .env.production created" -ForegroundColor Green

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor Green
Write-Host "  - transpo-system-backend\.env.production"
Write-Host "  - transpo-system-frontend\.env.production"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the generated .env.production files"
Write-Host "2. Update API keys if needed"
Write-Host "3. Follow the DEPLOYMENT_GUIDE.md for deployment instructions"
Write-Host ""
Write-Host "Frontend URL: https://$FRONTEND_DOMAIN" -ForegroundColor Cyan
Write-Host "Backend URL: https://$BACKEND_DOMAIN" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
