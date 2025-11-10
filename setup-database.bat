@echo off
REM Budget Byahe Database Setup Script for Windows
REM This script creates the database and runs migrations

echo ========================================
echo Budget Byahe Database Setup
echo ========================================
echo.

REM Navigate to backend directory
cd /d "%~dp0transpo-system-backend"

echo [1/4] Creating database...
echo.
echo Please create the database manually using phpMyAdmin:
echo   1. Open http://localhost/phpmyadmin
echo   2. Click "New" in the left sidebar
echo   3. Database name: budgetbyahe_backend
echo   4. Collation: utf8mb4_unicode_ci
echo   5. Click "Create"
echo.
echo OR run this SQL command:
echo   CREATE DATABASE budgetbyahe_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
pause

echo.
echo [2/4] Checking database connection...
php artisan db:show
if errorlevel 1 (
    echo.
    echo ERROR: Could not connect to database!
    echo Please check your .env file settings:
    echo   DB_CONNECTION=mysql
    echo   DB_HOST=127.0.0.1
    echo   DB_PORT=3306
    echo   DB_DATABASE=budgetbyahe_backend
    echo   DB_USERNAME=root
    echo   DB_PASSWORD=^(your MySQL password^)
    echo.
    pause
    exit /b 1
)

echo.
echo [3/4] Running database migrations...
php artisan migrate --force
if errorlevel 1 (
    echo.
    echo ERROR: Migration failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo [4/4] Checking migration status...
php artisan migrate:status

echo.
echo ========================================
echo Database setup completed successfully!
echo ========================================
echo.
echo Tables created:
echo   - users (linked to Firebase)
echo   - transport_types (jeepney, tricycle)
echo   - terminals
echo   - routes
echo   - route_points
echo   - fare_matrix
echo   - fare_calculations
echo   - saved_routes
echo   - feedbacks
echo   - reports
echo.
echo Next steps:
echo   1. Review the database in phpMyAdmin
echo   2. See docs/DATABASE_SCHEMA.md for full documentation
echo   3. Start adding data through the admin panel
echo.
pause
