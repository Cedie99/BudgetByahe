# Budget Byahe Database Quick Start

## 🚀 Quick Setup

### Step 1: Create Database
Open phpMyAdmin (http://localhost/phpmyadmin) and run:
```sql
CREATE DATABASE budgetbyahe_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Environment
Edit `transpo-system-backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=budgetbyahe_backend
DB_USERNAME=root
DB_PASSWORD=
```
**Note:** If your MySQL root user has a password, add it to `DB_PASSWORD`.

### Step 3: Run Migrations
```bash
cd transpo-system-backend
php artisan migrate
```

### Step 4: Verify Setup
```bash
php artisan migrate:status
```

You should see all migrations listed as "Ran".

---

## 📊 Database Architecture

### Firebase/Firestore (Authentication & Profiles)
- User credentials (email, password)
- User profiles (firstName, lastName, photoURL, role, etc.)
- Real-time user data synchronization

### MySQL (Application Data)
- Routes and terminals
- Fare calculations
- User feedback and reports
- Analytics and logging

### Linking the Systems
The `users.firebase_uid` column links MySQL records to Firebase/Firestore users.

---

## 📋 Tables Overview

| Table | Purpose | Records |
|-------|---------|---------|
| `users` | Links Firebase users to MySQL | User activities |
| `transport_types` | Vehicle types (jeepney, tricycle) | 2 default |
| `terminals` | Terminal/station locations | Admin-managed |
| `routes` | Routes between terminals | Admin-managed |
| `route_points` | GPS points along routes | For map display |
| `fare_matrix` | Official fare calculation rules | LGU/LTFRB data |
| `fare_calculations` | Logged fare calculations | Analytics |
| `saved_routes` | User's favorite routes | User data |
| `feedbacks` | User feedback | User submissions |
| `reports` | User issue reports | User submissions |

---

## 🔗 Key Relationships

```
users ─┬─→ saved_routes ──→ routes ←── terminals
       ├─→ fare_calculations ┘         └─→ transport_types
       ├─→ feedbacks                         ↓
       └─→ reports                      fare_matrix
                                             ↓
                                       route_points
```

---

## 🧪 Testing the Setup

### Test Database Connection
```bash
php artisan tinker
```
```php
DB::connection()->getPdo();
// Should return PDO object
```

### Check Default Data
```bash
php artisan tinker
```
```php
TransportType::all();
// Should return jeepney and tricycle
```

### Create Test Terminal
```php
$jeepney = TransportType::where('name', 'jeepney')->first();
Terminal::create([
    'name' => 'Test Terminal',
    'association_name' => 'Test Association',
    'barangay' => 'Test Barangay',
    'municipality' => 'Test City',
    'latitude' => 14.5995,
    'longitude' => 120.9842,
    'transport_type_id' => $jeepney->id
]);
```

---

## 📚 Full Documentation

For complete schema details, see **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)**

---

## 🆘 Troubleshooting

### "Access denied for user 'root'@'localhost'"
Your MySQL root user has a password. Update `.env`:
```env
DB_PASSWORD=your_mysql_password
```

### "Database 'budgetbyahe_backend' doesn't exist"
Create the database first using phpMyAdmin or MySQL command line.

### "SQLSTATE[HY000] [2002] No connection could be made"
1. Start XAMPP
2. Ensure MySQL is running (green indicator)
3. Check port 3306 is not blocked

### Migration Already Run
To reset and re-run:
```bash
php artisan migrate:fresh
```
**Warning:** This will delete all data!

---

**Next:** See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for complete documentation
