# 🗄️ Budget Byahe Database - Complete Setup

## ✅ What Has Been Created

### 1. Database Migrations (10 tables)
All migration files are ready in `transpo-system-backend/database/migrations/`:

| Migration File | Table | Purpose |
|----------------|-------|---------|
| `2025_11_03_082624_update_users_table_for_firebase_integration.php` | `users` | Links Firebase users to MySQL |
| `2025_11_03_083525_create_transport_types_table.php` | `transport_types` | Vehicle types (jeepney, tricycle) |
| `2025_11_03_083933_create_terminals_table.php` | `terminals` | Terminal/station locations |
| `2025_11_03_083956_create_routes_table.php` | `routes` | Routes between terminals |
| `2025_11_03_084004_create_route_points_table.php` | `route_points` | GPS points along routes |
| `2025_11_03_084012_create_fare_matrix_table.php` | `fare_matrix` | Official fare calculation rules |
| `2025_11_03_084022_create_fare_calculations_table.php` | `fare_calculations` | Logged fare calculations |
| `2025_11_03_084032_create_saved_routes_table.php` | `saved_routes` | User's favorite routes |
| `2025_11_03_084042_create_feedbacks_table.php` | `feedbacks` | User feedback |
| `2025_11_03_084052_create_reports_table.php` | `reports` | User issue reports |

### 2. Eloquent Models (9 models)
All model files created in `transpo-system-backend/app/Models/`:
- `TransportType.php`
- `Terminal.php`
- `Route.php`
- `RoutePoint.php`
- `FareMatrix.php`
- `FareCalculation.php`
- `SavedRoute.php`
- `Feedback.php`
- `Report.php`

### 3. Documentation
- **`docs/DATABASE_SCHEMA.md`** - Complete database documentation (400+ lines)
- **`docs/DATABASE_QUICK_START.md`** - Quick setup guide
- **`database/sample_data.sql`** - Sample data for testing
- **`setup-database.bat`** - Automated setup script for Windows

---

## 🚀 Setup Instructions

### Step 1: Ensure XAMPP MySQL is Running
1. Open XAMPP Control Panel
2. Click "Start" for MySQL module
3. Verify it's running (green indicator)

### Step 2: Create Database

**Option A: Using phpMyAdmin (Recommended)**
1. Open http://localhost/phpmyadmin
2. Click "New" in the left sidebar
3. Database name: `budgetbyahe_backend`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

**Option B: Using SQL**
```sql
CREATE DATABASE budgetbyahe_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Configure Database Connection

Check your `transpo-system-backend/.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=budgetbyahe_backend
DB_USERNAME=root
DB_PASSWORD=
```

**Important:** If your MySQL root user has a password, add it to `DB_PASSWORD`.

### Step 4: Run Migrations

Open PowerShell and run:
```powershell
cd c:\xampp\htdocs\BudgetByahe\transpo-system-backend
php artisan migrate
```

You should see output like:
```
Migration table created successfully.
Migrating: 2014_10_12_000000_create_users_table
Migrated:  2014_10_12_000000_create_users_table (XX.XXms)
...
```

### Step 5: Verify Setup

Check migration status:
```powershell
php artisan migrate:status
```

All migrations should show "Ran".

### Step 6: Add Sample Data (Optional)

Import sample data for testing:
```powershell
# Using MySQL command line
cd c:\xampp\mysql\bin
.\mysql.exe -u root budgetbyahe_backend < c:\xampp\htdocs\BudgetByahe\transpo-system-backend\database\sample_data.sql

# OR using phpMyAdmin
# 1. Go to phpMyAdmin
# 2. Select 'budgetbyahe_backend' database
# 3. Click "Import" tab
# 4. Choose 'sample_data.sql' file
# 5. Click "Go"
```

---

## 📊 Database Structure Overview

### Core Tables

**1. users** - Links Firebase authentication with MySQL data
- Stores `firebase_uid` to connect with Firebase/Firestore
- Tracks user role (user/admin/operator)
- Records last login

**2. transport_types** - Vehicle categories
- Pre-populated with: Jeepney, Tricycle
- Extendable for future types (bus, UV Express)

**3. terminals** - Physical terminal locations
- GPS coordinates (latitude/longitude)
- Association information
- Barangay and municipality grouping

**4. routes** - Defined routes between terminals
- Links start and end terminals
- Total distance calculation
- Active/inactive status

**5. route_points** - GPS waypoints along routes
- Ordered sequence of coordinates
- Used for map display
- Optional barangay labels

**6. fare_matrix** - Official fare calculation rules
- Base fare and base distance
- Per-kilometer rates
- Effective dates for fare changes
- Municipality-specific fares

**7. fare_calculations** - Calculation history
- Logs every fare calculation
- Links to user, route, and fare matrix
- Analytics and reporting data

**8. saved_routes** - User favorites
- User's frequently used routes
- Custom aliases ("Home to School")
- Usage frequency tracking

**9. feedbacks** - User feedback
- Categorized feedback types
- Admin status tracking
- User suggestions and reports

**10. reports** - Issue reporting
- Fare discrepancies
- Route issues
- System problems

---

## 🔗 Firebase Integration

### How It Works

1. **User Signs Up/Logs In**
   - Firebase Auth creates user account
   - Frontend stores user info in Firestore
   - Backend receives Firebase ID token

2. **Backend Receives Request**
   - Verifies Firebase token
   - Extracts `firebase_uid`
   - Creates/updates MySQL user record

3. **Data Linking**
   ```
   Firebase User (uid: "abc123")
        ↓
   MySQL users (firebase_uid: "abc123")
        ↓
   saved_routes, fare_calculations, feedbacks, reports
   ```

### Key Points

- **No passwords in MySQL** - Firebase handles authentication
- **Firestore stores profile** - firstName, lastName, photoURL, etc.
- **MySQL stores activities** - routes, calculations, feedback
- **firebase_uid is the bridge** - Links both systems

---

## 📈 Sample Data Included

The `sample_data.sql` file includes:

- **7 Terminals** - Mix of jeepney and tricycle terminals in Bulacan
- **5 Routes** - Sample routes between terminals
- **9 Route Points** - GPS coordinates for map display
- **4 Fare Matrices** - LGU/LTFRB standard rates
- **5 Fare Calculations** - Sample calculation history

### Sample Routes

1. **SM Pulilan to PUP Sta. Maria** (15.5 km, Jeepney)
   - Fare: ₱36.10

2. **SM Pulilan to Barasoain** (8.3 km, Jeepney)
   - Fare: ₱20.26

3. **Pulilan Town to Balatong** (3.2 km, Tricycle)
   - Fare: ₱21.00

---

## 🧪 Testing the Database

### Test Connection
```powershell
php artisan tinker
```
```php
DB::connection()->getPdo();
// Should return PDO instance
```

### View Transport Types
```php
\App\Models\TransportType::all();
// Should show: jeepney, tricycle
```

### View Sample Terminals
```php
\App\Models\Terminal::with('transportType')->get();
// Shows all terminals with their transport type
```

### View Sample Routes
```php
\App\Models\Route::with(['startTerminal', 'endTerminal', 'transportType'])->get();
// Shows all routes with full details
```

---

## 🔧 Database Management Commands

### View All Tables
```powershell
php artisan db:show
```

### Check Migration Status
```powershell
php artisan migrate:status
```

### Rollback Last Migration
```powershell
php artisan migrate:rollback
```

### Fresh Start (Deletes All Data!)
```powershell
php artisan migrate:fresh
```

### View Database in Browser
Open phpMyAdmin: http://localhost/phpmyadmin

---

## 🆘 Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
**Solution:** Your MySQL root user has a password. Update `.env`:
```env
DB_PASSWORD=your_mysql_password
```

### Error: "Database 'budgetbyahe_backend' doesn't exist"
**Solution:** Create the database first using phpMyAdmin or SQL.

### Error: "SQLSTATE[HY000] [2002] No connection"
**Solution:** 
1. Start XAMPP
2. Start MySQL service
3. Verify green indicator in XAMPP Control Panel

### Error: "Syntax error or access violation: 1071"
**Solution:** This is a MySQL key length issue. Already handled in migrations with:
```php
Schema::defaultStringLength(191);
```

### Migrations Won't Run
**Solution:**
```powershell
# Clear config cache
php artisan config:clear

# Clear all caches
php artisan cache:clear

# Try migration again
php artisan migrate
```

---

## 📚 Next Steps

1. ✅ **Database Created** - All tables and structure ready
2. 📝 **Add Real Data** - Use admin panel to add terminals and routes
3. 🧪 **Test Fare Calculation** - Verify calculation logic
4. 📊 **Monitor Usage** - Check `fare_calculations` for analytics
5. 💬 **Review Feedback** - Monitor user feedback and reports

---

## 📖 Documentation Links

- **[Complete Database Schema](docs/DATABASE_SCHEMA.md)** - Full technical documentation
- **[Database Quick Start](docs/DATABASE_QUICK_START.md)** - Quick reference guide
- **[Admin Setup Guide](docs/ADMIN_SETUP_GUIDE.md)** - Admin account setup
- **[Main README](README.md)** - Project overview

---

**Database Version:** 1.0.0  
**Created:** November 3, 2025  
**Status:** ✅ Ready for Use
