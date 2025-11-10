# Budget Byahe - Entity Relationship Diagram (ERD)

## 🗺️ Database Architecture Visualization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FIREBASE/FIRESTORE (Authentication Layer)             │
│                                                                          │
│  Users Collection:                                                       │
│  ├─ uid (string) ────────────────────────────┐                         │
│  ├─ email (string)                            │                         │
│  ├─ firstName (string)                        │                         │
│  ├─ lastName (string)                         │                         │
│  ├─ photoURL (string)                         │                         │
│  ├─ role (string: user|admin|operator)       │                         │
│  └─ lastLogin (timestamp)                     │                         │
│                                                │                         │
└────────────────────────────────────────────────┼─────────────────────────┘
                                                 │
                                                 │ firebase_uid (LINK)
                                                 │
┌────────────────────────────────────────────────▼─────────────────────────┐
│                    MYSQL (Application Database)                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)            │
│ firebase_uid (UQ)  │◄────────────────┐
│ name               │                  │
│ email (UQ)         │                  │
│ password (null)    │                  │
│ role (enum)        │                  │
│ profile_photo      │                  │
│ last_login_at      │                  │
└──────────┬──────────┘                  │
           │                             │
           │ Links to all user activities│
           │                             │
    ┌──────┴──────┬──────────┬──────────┴──────┐
    │             │          │                  │
    ▼             ▼          ▼                  ▼
┌─────────┐  ┌─────────┐ ┌─────────┐    ┌─────────┐
│ saved_  │  │  fare_  │ │feedback │    │ reports │
│ routes  │  │calculs. │ │         │    │         │
└────┬────┘  └────┬────┘ └─────────┘    └────┬────┘
     │            │                           │
     │            │                           │
     ▼            ▼                           ▼
┌─────────────────────┐                 ┌─────────┐
│       routes        │                 │ routes  │
├─────────────────────┤                 │ (opt.)  │
│ id (PK)            │                 └─────────┘
│ route_name         │
│ start_terminal_id  │────┐
│ end_terminal_id    │────┼───┐
│ total_distance_km  │    │   │
│ transport_type_id  │──┐ │   │
│ status (enum)      │  │ │   │
└──────────┬──────────┘  │ │   │
           │             │ │   │
           ▼             │ │   │
┌─────────────────────┐  │ │   │
│   route_points      │  │ │   │
├─────────────────────┤  │ │   │
│ id (PK)            │  │ │   │
│ route_id (FK)      │◄─┘ │   │
│ order_no           │    │   │
│ latitude           │    │   │
│ longitude          │    │   │
│ barangay_name      │    │   │
└─────────────────────┘    │   │
                           │   │
                ┌──────────┘   │
                │              │
                ▼              ▼
    ┌─────────────────┐  ┌─────────────────┐
    │ transport_types │  │   terminals     │
    ├─────────────────┤  ├─────────────────┤
    │ id (PK)        │◄─┤ id (PK)        │
    │ name (enum)    │  │ name           │
    │ description    │  │ association_   │
    └────────┬────────┘  │ barangay       │
             │           │ municipality   │
             │           │ latitude       │
             │           │ longitude      │
             └───────────┤ transport_     │
                         │   type_id (FK) │
                         └─────────────────┘

┌─────────────────────┐
│   fare_matrix       │
├─────────────────────┤
│ id (PK)            │
│ transport_type_id  │◄──────┐
│ base_fare          │       │
│ base_distance_km   │       │
│ per_km_rate        │       │
│ effective_date     │       │
│ source_document    │       │
│ municipality       │       │
└──────────┬──────────┘       │
           │                  │
           │ Used for         │
           │ calculations     │
           │                  │
           ▼                  │
┌─────────────────────┐       │
│ fare_calculations   │       │
├─────────────────────┤       │
│ id (PK)            │       │
│ user_id (FK)       │       │
│ route_id (FK)      │       │
│ distance_km        │       │
│ fare_amount        │       │
│ fare_matrix_id(FK) │───────┘
│ created_at         │
└─────────────────────┘
```

---

## 🔗 Relationship Types

### One-to-Many Relationships

| Parent Table | Child Table | Description |
|--------------|-------------|-------------|
| `users` | `saved_routes` | One user has many saved routes |
| `users` | `fare_calculations` | One user has many fare calculations |
| `users` | `feedbacks` | One user submits many feedbacks |
| `users` | `reports` | One user submits many reports |
| `routes` | `route_points` | One route has many GPS points |
| `routes` | `fare_calculations` | One route has many calculations |
| `routes` | `saved_routes` | One route is saved by many users |
| `transport_types` | `terminals` | One type has many terminals |
| `transport_types` | `routes` | One type has many routes |
| `transport_types` | `fare_matrix` | One type has many fare rules |
| `terminals` | `routes` (start) | One terminal starts many routes |
| `terminals` | `routes` (end) | One terminal ends many routes |
| `fare_matrix` | `fare_calculations` | One fare rule used in many calculations |

### Many-to-Many Relationships

| Table 1 | Junction Table | Table 2 | Description |
|---------|----------------|---------|-------------|
| `users` | `saved_routes` | `routes` | Users can save multiple routes, routes can be saved by multiple users |

---

## 📊 Cardinality Notation

```
┌──────┐          ┌──────┐
│Parent│ 1 ────── ∞ │Child│
└──────┘          └──────┘
   One to Many

┌──────┐     ┌──────┐     ┌──────┐
│Table1│ ∞ ──┤Junct.│── ∞ │Table2│
└──────┘     └──────┘     └──────┘
      Many to Many
```

---

## 🗂️ Table Categories

### Authentication & Users
```
users (links to Firebase via firebase_uid)
```

### Transportation Infrastructure
```
transport_types (jeepney, tricycle)
    ↓
terminals (physical locations)
    ↓
routes (connections between terminals)
    ↓
route_points (GPS waypoints)
```

### Fare System
```
fare_matrix (official rates)
    ↓
fare_calculations (logged calculations)
```

### User Features
```
saved_routes (favorites)
feedbacks (suggestions/issues)
reports (problem reporting)
```

---

## 🔐 Foreign Key Constraints

### CASCADE Deletes
When parent is deleted, child records are also deleted:

- `transport_types` → `terminals`
- `transport_types` → `routes`
- `transport_types` → `fare_matrix`
- `terminals` → `routes`
- `routes` → `route_points`
- `routes` → `fare_calculations`
- `routes` → `saved_routes`
- `fare_matrix` → `fare_calculations`
- `users` → `saved_routes`
- `users` → `feedbacks`
- `users` → `reports`

### SET NULL Deletes
When parent is deleted, foreign key is set to NULL:

- `users` → `fare_calculations` (allows guest calculations)
- `routes` → `reports` (preserve report even if route deleted)

---

## 📈 Index Strategy

### Primary Keys (PK)
- Automatically indexed
- Used for row identification

### Foreign Keys (FK)
- Automatically indexed
- Used for JOIN operations

### Unique Constraints (UQ)
- `users.firebase_uid` - Links to Firebase
- `users.email` - Prevents duplicate emails
- `transport_types.name` - No duplicate types
- `saved_routes.user_id + route_id` - No duplicate favorites

### Composite Indexes
- `terminals(municipality, barangay)` - Location searches
- `routes(transport_type_id, status)` - Route filtering
- `fare_matrix(transport_type_id, effective_date)` - Fare lookups
- `fare_calculations(user_id, created_at)` - User analytics
- `fare_calculations(route_id, created_at)` - Route analytics
- `feedbacks(status, created_at)` - Admin dashboard
- `reports(status, created_at)` - Admin management

### Simple Indexes
- `saved_routes.frequency` - Popular routes
- `feedbacks.category` - Feedback filtering
- `reports.report_type` - Report filtering

---

## 🔄 Data Flow Examples

### Scenario 1: User Calculates Fare

```
1. User selects route in frontend
   ↓
2. Frontend calls backend API with route_id
   ↓
3. Backend queries:
   - routes table (get route details)
   - fare_matrix table (get applicable fare rule)
   ↓
4. Backend calculates fare:
   base_fare + (distance - base_distance) × per_km_rate
   ↓
5. Backend saves to fare_calculations table
   ↓
6. Backend returns fare to frontend
```

### Scenario 2: User Saves Route

```
1. User clicks "Save Route" in frontend
   ↓
2. Frontend sends user_id + route_id to backend
   ↓
3. Backend checks if already saved:
   - If exists: increment frequency
   - If new: create saved_route record
   ↓
4. Backend returns success
   ↓
5. Frontend updates UI
```

### Scenario 3: Admin Adds New Route

```
1. Admin selects start and end terminals
   ↓
2. Admin enters route details
   ↓
3. Backend creates route record
   ↓
4. Admin draws route on map
   ↓
5. Backend saves GPS waypoints to route_points
   ↓
6. Route becomes available to users
```

---

## 🎯 Key Design Principles

### 1. Separation of Concerns
- **Firebase**: Authentication & User Profiles
- **MySQL**: Application Data & Business Logic

### 2. Data Integrity
- Foreign key constraints prevent orphaned records
- Enums enforce valid values
- NOT NULL constraints ensure required data

### 3. Performance Optimization
- Strategic indexing on frequently queried columns
- Composite indexes for multi-column queries
- Proper data types (DECIMAL for money, coordinates)

### 4. Scalability
- Normalized structure reduces duplication
- Flexible fare_matrix supports multiple LGUs
- route_points allows detailed mapping

### 5. Analytics Ready
- fare_calculations logs all activity
- frequency tracking on saved_routes
- Timestamps on all tables

### 6. Extensibility
- Easy to add new transport types
- Support for LGU-specific fares
- Can add more route attributes

---

## 📝 Notes

- **firebase_uid** is the critical link between Firebase and MySQL
- All monetary values use `DECIMAL(8,2)` for precision
- All coordinates use `DECIMAL(10,7)` for ~1cm accuracy
- Timestamps automatically managed by Laravel
- Soft deletes can be added later if needed

---

**Diagram Version:** 1.0  
**Last Updated:** November 3, 2025
