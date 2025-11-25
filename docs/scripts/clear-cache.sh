#!/bin/bash

# Hostinger Laravel Cache Clear Script
# Upload this to your server root and run: bash clear-cache.sh
# Or add these commands to a Laravel route

echo "🧹 Clearing Laravel Caches..."
echo "================================"

# Navigate to Laravel directory (adjust path if needed)
cd /home/u356758842/domains/api.budgetbyahe.com/public_html
# OR
# cd /home/u356758842/htdocs

echo "📦 Clearing config cache..."
php artisan config:clear

echo "🗂️ Clearing application cache..."
php artisan cache:clear

echo "🛣️ Clearing route cache..."
php artisan route:clear

echo "👁️ Clearing view cache..."
php artisan view:clear

echo "📝 Clearing compiled cache..."
php artisan clear-compiled

echo "✅ All caches cleared!"
echo "================================"
echo "Now test your application"
