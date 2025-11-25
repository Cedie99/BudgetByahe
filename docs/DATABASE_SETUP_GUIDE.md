# 🗄️ Budget Byahe Database Setup Guide

Complete guide for setting up and managing the Budget Byahe database system.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Database Structure](#database-structure)
- [Installation](#installation)
- [Sample Data](#sample-data)
- [Troubleshooting](#troubleshooting)
- [Related Documentation](#related-documentation)

---

## 🎯 Overview

Budget Byahe uses a **hybrid database architecture**:
- **Firebase Firestore** - Primary database for real-time features, authentication, and user data
- **MySQL** - Backend database for routes, fare matrices, and administrative operations

### Why Hybrid?
- **Firebase**: Real-time sync, authentication, scalability, offline support
- **MySQL**: Complex queries, relationships, reporting, data integrity

---

## 📦 Database Structure

### 10 Tables Created

| Table | Purpose | Key Features |
|-------|---------|--------------|
| **users** | Firebase integration | `firebase_uid`, role, profile, last_login |
| **transport_types** | Vehicle types | Jeepney, Tricycle with base fares |
| **terminals** | Terminal locations | GPS coordinates, addresses |
| **routes** | Routes between terminals | Distance, status, transport type |
| **route_points** | GPS waypoints | Ordered route mapping |
| **fare_matrix** | Official fare rules | Distance-based, LGU/LTFRB approved |
| **fare_calculations** | Calculation logging | Analytics and tracking |
| **saved_routes** | User favorites | Frequency tracking |
| **feedbacks** | User feedback | Category, status, resolution |
| **reports** | Issue reporting | Bug reports, fare discrepancies |

### Entity Relationships

```
users (1) ───── (Many) saved_routes
users (1) ───── (Many) feedbacks
users (1) ───── (Many) reports
users (1) ───── (Many) fare_calculations

transport_types (1) ───── (Many) routes
transport_types (1) ───── (Many) fare_matrix

terminals (1) ───── (Many) routes [as start_terminal]
terminals (1) ───── (Many) routes [as end_terminal]

routes (1) ───── (Many) route_points
routes (1) ───── (Many) saved_routes
```

---

## 🚀 Installation

### Prerequisites

- XAMPP installed with MySQL running
- Laravel backend set up
- Composer installed

### Step 1: Start MySQL

1. Open **XAMPP Control Panel**
2. Click **Start** for MySQL module
3. Verify green indicator shows it's running

### Step 2: Create Database

#### Option A: Using phpMyAdmin (Recommended)

1. Open browser: `http://localhost/phpmyadmin`
2. Click **"New"** in left sidebar
3. Database name: `budget_byahe` or `budgetbyahe_backend`
4. Collation: `utf8mb4_unicode_ci`
5. Click **"Create"**

#### Option B: Using SQL Command

```sql
CREATE DATABASE budget_byahe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Option C: Using Automated Script

Run the provided batch script:
```powershell
cd c:\xampp\htdocs\BudgetByahe
.\setup-database.bat
```

### Step 3: Configure Environment

Edit `transpo-system-backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=budget_byahe
DB_USERNAME=root
DB_PASSWORD=

FIREBASE_CREDENTIALS=storage/firebase-service-account.json
```

### Step 4: Run Migrations

Navigate to backend directory and run:

```powershell
cd transpo-system-backend
php artisan migrate
```

Expected output:
```
Migration table created successfully.
Migrating: 2025_11_03_082624_update_users_table_for_firebase_integration
Migrated:  2025_11_03_082624_update_users_table_for_firebase_integration (45.67ms)
Migrating: 2025_11_03_083525_create_transport_types_table
Migrated:  2025_11_03_083525_create_transport_types_table (32.12ms)
... (10 migrations total)
```

### Step 5: Verify Installation

```powershell
# Check database connection
php artisan db:show

# List all tables
php artisan db:table --database=mysql
```

---

## 📊 Sample Data

### Load Sample Data

The system includes sample data for testing in `database/sample_data.sql`.

#### Option A: Using phpMyAdmin

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Select your database (`budget_byahe`)
3. Click **"Import"** tab
4. Choose file: `transpo-system-backend/database/sample_data.sql`
5. Click **"Go"**

#### Option B: Using MySQL Command Line

```bash
mysql -u root -p budget_byahe < transpo-system-backend/database/sample_data.sql
```

### Sample Data Includes

- **2 Transport Types**: Jeepney, Tricycle
- **4 Terminals**: SM City Cebu, Ayala Center, Carbon Market, Colon Street
- **3 Sample Routes**: 
  - SM to Ayala (Jeepney)
  - Carbon to Colon (Jeepney)
  - SM to Carbon (Tricycle)
- **Route Points**: GPS waypoints for each route
- **Fare Matrix**: Distance-based fare rules

---

## 🔧 Troubleshooting

### Issue 1: Migration Fails - Table Already Exists

**Solution:**
```powershell
# Reset and re-run migrations
php artisan migrate:fresh
```

⚠️ **Warning**: This will delete all existing data!

### Issue 2: Connection Refused

**Symptoms:**
```
SQLSTATE[HY000] [2002] Connection refused
```

**Solutions:**
1. Verify MySQL is running in XAMPP
2. Check `DB_HOST` in `.env`:
   - Try `127.0.0.1` instead of `localhost`
   - Or try `localhost` instead of `127.0.0.1`
3. Verify port 3306 is not blocked:
   ```powershell
   netstat -an | findstr 3306
   ```

### Issue 3: Access Denied for User

**Symptoms:**
```
SQLSTATE[HY000] [1045] Access denied for user 'root'@'localhost'
```

**Solutions:**
1. Check MySQL credentials in `.env`
2. Default XAMPP credentials:
   - Username: `root`
   - Password: (empty)
3. Reset MySQL password if needed

### Issue 4: Unknown Database

**Symptoms:**
```
SQLSTATE[HY000] [1049] Unknown database 'budget_byahe'
```

**Solution:**
Create the database first (see Step 2 above)

### Issue 5: Hostinger Production Database Issues

**Common Hostinger-specific issues:**

1. **Wrong DB_HOST**: Use `127.0.0.1` not `localhost`
   ```env
   DB_HOST=127.0.0.1
   ```

2. **Remote MySQL Disabled**: 
   - Login to Hostinger hPanel
   - Go to: Databases → Remote MySQL
   - Add your server IP or use `%` for all IPs

3. **Incorrect Credentials**:
   - Verify database name, username, and password in hPanel
   - Format: `u356758842_databasename`

4. **Cache Issues**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   ```

---

## 🧹 Maintenance Commands

### Clear All Caches

```powershell
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Refresh Database (Development Only)

```powershell
# Drop all tables and re-run migrations
php artisan migrate:fresh

# With sample data
php artisan migrate:fresh --seed
```

### Backup Database

```powershell
# Using mysqldump
mysqldump -u root budget_byahe > backup_$(Get-Date -Format 'yyyy-MM-dd').sql
```

---

## 📚 Related Documentation

- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete technical schema documentation
- **[DATABASE_QUICK_START.md](DATABASE_QUICK_START.md)** - Quick reference guide
- **[DATABASE_ERD.md](DATABASE_ERD.md)** - Entity relationship diagrams
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment
- **[HOSTINGER_AUTH_FIX.md](HOSTINGER_AUTH_FIX.md)** - Hostinger-specific fixes

---

## ✅ Post-Installation Checklist

- [ ] MySQL service running in XAMPP
- [ ] Database created successfully
- [ ] `.env` configured with correct credentials
- [ ] All 10 migrations completed without errors
- [ ] Database connection verified with `php artisan db:show`
- [ ] Sample data loaded (optional but recommended)
- [ ] Backend server running: `php artisan serve`
- [ ] API routes accessible: `http://localhost:8000/api`

---

## 🔗 Quick Commands Reference

```powershell
# Start backend server
cd transpo-system-backend
php artisan serve

# Check database status
php artisan db:show

# List migrations
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback

# Fresh install with seed data
php artisan migrate:fresh --seed
```

---

<div align="center">

**Database Setup Complete! 🎉**

*Your Budget Byahe database is ready for development and testing.*

</div>
