# Budget Byahe Database Schema

## 📊 Overview

Budget Byahe uses a **hybrid database architecture**:
- **Firebase/Firestore**: User authentication and profile management
- **MySQL**: Application data (routes, fares, feedback, reports)

This separation provides the best of both worlds: Firebase's robust authentication with MySQL's relational data capabilities.

---

## 🔐 Authentication Layer (Firebase/Firestore)

### Firebase Auth
Handles user credentials and identity verification.

### Firestore Users Collection
Stores user profile information:

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Unique Firebase user ID |
| `email` | string | User's email address |
| `firstName` | string | User's first name |
| `lastName` | string | User's last name |
| `photoURL` | string | Profile photo URL |
| `profilePicture` | string | Alternative profile picture |
| `provider` | string | Auth provider (email, google, facebook) |
| `role` | string | User role (user, admin, operator) |
| `lastLogin` | timestamp | Last login timestamp |

---

## 🗄️ Application Database (MySQL)

### Database Name: `budgetbyahe_backend`

---

## 📋 Table Schemas

### 1. `users` Table
Links Firebase users with MySQL data for application-specific operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Internal MySQL user ID |
| `firebase_uid` | VARCHAR(128) | UNIQUE, NULLABLE | Links to Firebase Auth UID |
| `name` | VARCHAR(255) | | User's full name |
| `email` | VARCHAR(255) | UNIQUE | User's email |
| `password` | VARCHAR(255) | NULLABLE | Optional (Firebase handles auth) |
| `email_verified_at` | TIMESTAMP | NULLABLE | Email verification timestamp |
| `last_login_at` | TIMESTAMP | NULLABLE | Last login tracking |
| `role` | ENUM | 'user', 'admin', 'operator' | User role |
| `profile_photo` | VARCHAR(255) | NULLABLE | Profile photo path/URL |
| `remember_token` | VARCHAR(100) | NULLABLE | Remember me token |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `firebase_uid` (UNIQUE)
- `email` (UNIQUE)

---

### 2. `transport_types` Table
Defines types of transportation vehicles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Transport type ID |
| `name` | ENUM | 'jeepney', 'tricycle', UNIQUE | Vehicle type |
| `description` | TEXT | NULLABLE | Additional details |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Default Data:**
- Jeepney: "Traditional Philippine jeepney transport"
- Tricycle: "Motorcycle with sidecar transport"

---

### 3. `terminals` Table
Stores terminal/station information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Terminal ID |
| `name` | VARCHAR(150) | | Terminal name |
| `association_name` | VARCHAR(150) | | Terminal association |
| `barangay` | VARCHAR(150) | | Barangay location |
| `municipality` | VARCHAR(150) | | Municipality/city |
| `latitude` | DECIMAL(10,7) | | GPS latitude |
| `longitude` | DECIMAL(10,7) | | GPS longitude |
| `transport_type_id` | BIGINT | FK → transport_types | Vehicle type |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `municipality`, `barangay` (composite)
- `transport_type_id`

**Foreign Keys:**
- `transport_type_id` → `transport_types.id` (CASCADE)

---

### 4. `routes` Table
Defines transportation routes between terminals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Route ID |
| `route_name` | VARCHAR(255) | | Route name (e.g., "SM Pulilan to PUP Sta. Maria") |
| `start_terminal_id` | BIGINT | FK → terminals | Starting terminal |
| `end_terminal_id` | BIGINT | FK → terminals | Destination terminal |
| `total_distance_km` | DECIMAL(8,2) | | Total route distance in km |
| `transport_type_id` | BIGINT | FK → transport_types | Vehicle type |
| `status` | ENUM | 'active', 'inactive' | Route visibility status |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `transport_type_id`, `status` (composite)
- `start_terminal_id`
- `end_terminal_id`

**Foreign Keys:**
- `start_terminal_id` → `terminals.id` (CASCADE)
- `end_terminal_id` → `terminals.id` (CASCADE)
- `transport_type_id` → `transport_types.id` (CASCADE)

---

### 5. `route_points` Table
Stores intermediate GPS points along a route (for map display).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Point ID |
| `route_id` | BIGINT | FK → routes | Associated route |
| `order_no` | INT | | Sequence number of point |
| `latitude` | DECIMAL(10,7) | | GPS latitude |
| `longitude` | DECIMAL(10,7) | | GPS longitude |
| `barangay_name` | VARCHAR(150) | NULLABLE | Optional barangay label |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `route_id`, `order_no` (composite)

**Foreign Keys:**
- `route_id` → `routes.id` (CASCADE)

---

### 6. `fare_matrix` Table
Stores official fare calculation rules from LGU/LTFRB.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Fare matrix ID |
| `transport_type_id` | BIGINT | FK → transport_types | Vehicle type |
| `base_fare` | DECIMAL(8,2) | | Minimum fare amount |
| `base_distance_km` | DECIMAL(8,2) | | Distance covered by base fare |
| `per_km_rate` | DECIMAL(8,2) | | Rate per kilometer after base |
| `effective_date` | DATE | | When this fare takes effect |
| `source_document` | VARCHAR(255) | NULLABLE | URL/path to official document |
| `municipality` | VARCHAR(150) | NULLABLE | For LGU-specific fares |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `transport_type_id`, `effective_date` (composite)
- `municipality`

**Foreign Keys:**
- `transport_type_id` → `transport_types.id` (CASCADE)

**Note:** Store official fare documents in `storage/app/public/fare_matrices/` or Firebase Storage, not as BLOB in database.

---

### 7. `fare_calculations` Table
Logs every fare calculation for analytics and debugging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Calculation ID |
| `user_id` | BIGINT | FK → users, NULLABLE | User who requested calculation |
| `route_id` | BIGINT | FK → routes | Route calculated |
| `distance_km` | DECIMAL(8,2) | | Actual distance calculated |
| `fare_amount` | DECIMAL(8,2) | | Calculated fare |
| `fare_matrix_id` | BIGINT | FK → fare_matrix | Fare rule used |
| `created_at` | TIMESTAMP | | Calculation timestamp |

**Indexes:**
- `user_id`, `created_at` (composite)
- `route_id`, `created_at` (composite)

**Foreign Keys:**
- `user_id` → `users.id` (SET NULL)
- `route_id` → `routes.id` (CASCADE)
- `fare_matrix_id` → `fare_matrix.id` (CASCADE)

---

### 8. `saved_routes` Table
User's saved/favorite routes for quick access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Saved route ID |
| `user_id` | BIGINT | FK → users | User who saved |
| `route_id` | BIGINT | FK → routes | Saved route |
| `alias` | VARCHAR(100) | NULLABLE | Custom name (e.g., "Home to School") |
| `frequency` | INT | DEFAULT 1 | Usage counter |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `user_id`, `route_id` (UNIQUE composite)
- `frequency`

**Foreign Keys:**
- `user_id` → `users.id` (CASCADE)
- `route_id` → `routes.id` (CASCADE)

**Note:** `frequency` increments each time user reuses this route for analytics on popular routes.

---

### 9. `feedbacks` Table
User feedback and suggestions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Feedback ID |
| `user_id` | BIGINT | FK → users | User who submitted |
| `message` | TEXT | | Feedback content |
| `category` | ENUM | 'suggestion', 'bug', 'fare_discrepancy', 'general' | Feedback type |
| `status` | ENUM | 'pending', 'reviewed', 'resolved' | Admin status |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `status`, `created_at` (composite)
- `category`

**Foreign Keys:**
- `user_id` → `users.id` (CASCADE)

---

### 10. `reports` Table
User reports for issues (fare discrepancies, incorrect routes, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Report ID |
| `user_id` | BIGINT | FK → users | User who reported |
| `route_id` | BIGINT | FK → routes, NULLABLE | Related route (if applicable) |
| `description` | TEXT | | Report details |
| `report_type` | ENUM | 'fare_issue', 'route_issue', 'system_issue' | Issue category |
| `status` | ENUM | 'open', 'in_progress', 'closed' | Resolution status |
| `created_at` | TIMESTAMP | | Created timestamp |
| `updated_at` | TIMESTAMP | | Updated timestamp |

**Indexes:**
- `status`, `created_at` (composite)
- `report_type`

**Foreign Keys:**
- `user_id` → `users.id` (CASCADE)
- `route_id` → `routes.id` (SET NULL)

---

## 🔗 Entity Relationship Diagram

```
Firebase Auth/Firestore
        ↓
    users (MySQL)
    ├── saved_routes → routes ← terminals
    ├── fare_calculations ↓         ↓
    ├── feedbacks      fare_matrix  transport_types
    └── reports           ↓
                    route_points
```

---

## 🚀 Database Setup Instructions

### 1. Ensure MySQL is Running
Start XAMPP and ensure MySQL is running.

### 2. Create Database
```sql
CREATE DATABASE budgetbyahe_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use phpMyAdmin to create the database.

### 3. Configure Environment
Edit `transpo-system-backend/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=budgetbyahe_backend
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Run Migrations
```bash
cd transpo-system-backend
php artisan migrate
```

This will:
- Create all tables with proper structure
- Set up foreign key constraints
- Add indexes for performance
- Insert default transport types (jeepney, tricycle)

### 5. Verify Tables
Check that all 10 tables were created:
```bash
php artisan migrate:status
```

---

## 🔍 Key Design Decisions

### 1. **Hybrid Architecture**
- Firebase handles authentication (no passwords in MySQL)
- MySQL handles relational data and complex queries
- `firebase_uid` links the two systems

### 2. **Data Normalization**
- Separate lookup tables (`transport_types`)
- Efficient foreign key relationships
- Prevents data duplication

### 3. **Geospatial Support**
- `DECIMAL(10,7)` for lat/long provides ~1cm precision
- `route_points` allows detailed route mapping
- Ready for future map enhancements

### 4. **Analytics-Ready**
- `fare_calculations` logs every calculation
- `frequency` field in `saved_routes` tracks usage
- Timestamps on all tables for trend analysis

### 5. **File Handling**
- Store document URLs/paths, not files
- Use Laravel storage or Firebase Storage
- Keep database lean and performant

### 6. **Soft Deletes (Optional)**
Consider adding `deleted_at` to key tables:
```php
$table->softDeletes();
```
This allows data recovery and audit trails.

---

## 📈 Performance Considerations

### Indexes Created
All foreign keys are indexed automatically. Additional indexes:
- User lookups by `firebase_uid`
- Terminal searches by location
- Route filtering by status and type
- Analytics queries on timestamps
- Popular routes by frequency

### Query Optimization Tips
1. Use eager loading for relationships: `Route::with('terminals', 'transportType')`
2. Index frequently searched fields
3. Use pagination for large result sets
4. Cache frequently accessed data (fare matrices)

---

## 🔒 Security Best Practices

1. **No Passwords in MySQL** - Firebase handles authentication
2. **Validate Firebase Tokens** - Always verify tokens in Laravel middleware
3. **Foreign Key Constraints** - Prevent orphaned records
4. **Input Validation** - Use Laravel form requests
5. **SQL Injection Protection** - Use Eloquent ORM (automatic)

---

## 🧪 Testing the Database

### Check Connection
```bash
php artisan tinker
```
```php
DB::connection()->getPdo();
```

### Create Test Data
```php
$jeepney = TransportType::where('name', 'jeepney')->first();
$terminal = Terminal::create([
    'name' => 'SM Pulilan',
    'association_name' => 'SMPTA',
    'barangay' => 'Poblacion',
    'municipality' => 'Pulilan',
    'latitude' => 14.9044,
    'longitude' => 120.8494,
    'transport_type_id' => $jeepney->id
]);
```

---

## 📚 Related Documentation

- [Admin Setup Guide](ADMIN_SETUP_GUIDE.md)
- [CMS Guide](CMS_GUIDE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Documentation](#) _(Coming Soon)_

---

## 🆘 Troubleshooting

### Migration Errors
```bash
# Reset database and re-run migrations
php artisan migrate:fresh

# Rollback last migration
php artisan migrate:rollback

# Check migration status
php artisan migrate:status
```

### Connection Issues
1. Verify MySQL is running in XAMPP
2. Check database name matches `.env`
3. Ensure `root` user has no password (or update `.env`)
4. Test connection: `php artisan tinker` → `DB::connection()->getPdo();`

### Foreign Key Constraint Errors
- Ensure parent tables are created first (migrations are ordered)
- Check that referenced IDs exist
- Verify cascade rules are correct

---

**Last Updated:** November 3, 2025
**Database Version:** 1.0.0
