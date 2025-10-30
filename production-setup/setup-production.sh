#!/bin/bash

# Budget Byahe - Production Setup Script
# This script helps configure environment variables for Hostinger deployment

echo "======================================"
echo "Budget Byahe - Production Setup"
echo "======================================"
echo ""

# Function to read user input
read_input() {
    read -p "$1: " value
    echo "$value"
}

echo "This script will help you configure your production environment."
echo "Please have your Hostinger credentials ready."
echo ""

# Get domain information
echo "--- Domain Configuration ---"
FRONTEND_DOMAIN=$(read_input "Enter your frontend domain (e.g., www.budgetbyahe.com)")
BACKEND_DOMAIN=$(read_input "Enter your backend domain (e.g., api.budgetbyahe.com)")

# Get database information
echo ""
echo "--- Database Configuration ---"
DB_NAME=$(read_input "Enter database name")
DB_USERNAME=$(read_input "Enter database username")
DB_PASSWORD=$(read_input "Enter database password")

# Create backend .env.production
echo ""
echo "Creating backend .env.production file..."

cat > transpo-system-backend/.env.production << EOF
APP_NAME="Budget Byahe"
APP_ENV=production
APP_KEY=base64:8Fc0wXyeTdKgXO7DUXcGqH9UBn8Yoe8NDJPBXmDI3GU=
APP_DEBUG=false
APP_URL=https://${BACKEND_DOMAIN}

FRONTEND_URL=https://${FRONTEND_DOMAIN}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USERNAME}
DB_PASSWORD=${DB_PASSWORD}

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
MAIL_FROM_ADDRESS=noreply@${FRONTEND_DOMAIN}
MAIL_FROM_NAME="\${APP_NAME}"

FIREBASE_CREDENTIALS=/path/to/storage/firebase-service-account.json

SESSION_DOMAIN=.${FRONTEND_DOMAIN#www.}
SANCTUM_STATEFUL_DOMAINS=${FRONTEND_DOMAIN}
EOF

echo "✓ Backend .env.production created"

# Create frontend .env.production
echo "Creating frontend .env.production file..."

cat > transpo-system-frontend/.env.production << EOF
# Production Environment Variables
REACT_APP_API_URL=https://${BACKEND_DOMAIN}
REACT_APP_URL=https://${FRONTEND_DOMAIN}

# Map Services - Copy from your .env file
REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoiY2VkaWVlZSIsImEiOiJjbWJicG94NGswbnFxMmpxMTc5cm93Y2tkIn0.WG-O3ewDyQ8n1w5OYSvCag

# AI Services - Copy from your .env file
REACT_APP_GROQ_API_KEY=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

NODE_ENV=production
EOF

echo "✓ Frontend .env.production created"

echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Files created:"
echo "  - transpo-system-backend/.env.production"
echo "  - transpo-system-frontend/.env.production"
echo ""
echo "Next steps:"
echo "1. Review the generated .env.production files"
echo "2. Update API keys if needed"
echo "3. Follow the DEPLOYMENT_GUIDE.md for deployment instructions"
echo ""
echo "Frontend URL: https://${FRONTEND_DOMAIN}"
echo "Backend URL: https://${BACKEND_DOMAIN}"
echo ""
