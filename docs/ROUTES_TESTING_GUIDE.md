# 🚌 Routes & Testing Integration Guide

Complete guide for implementing and testing the routes feature in Budget Byahe.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Implementation Summary](#implementation-summary)
- [Client-Side Routes Display](#client-side-routes-display)
- [Admin Routes Management](#admin-routes-management)
- [Testing Guide](#testing-guide)
- [API Integration](#api-integration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The Routes system in Budget Byahe allows:
- **Users** to view, search, and filter available transportation routes
- **Admins** to manage routes (create, edit, delete) with full CRUD operations
- **Integration** with MySQL database for persistent storage
- **Real-time** updates and responsive design

---

## 📦 Implementation Summary

### What Was Built

#### Frontend Components
1. **RoutesDisplay.js** - User-facing routes display
2. **RoutesDisplay.css** - Styling for routes display
3. **AdminRoutes.js** - Admin routes management panel
4. **AdminRoutes.css** - Admin panel styling

#### Backend Components
1. **RouteController.php** - API controller for CRUD operations
2. **Route.php** - Eloquent model
3. **API Routes** - RESTful endpoints

#### Database Tables
1. **routes** - Main routes table
2. **route_points** - GPS waypoints for each route
3. **terminals** - Terminal locations
4. **transport_types** - Vehicle types

---

## 👥 Client-Side Routes Display

### Component: `RoutesDisplay.js`

**Location:** `transpo-system-frontend/src/components/RoutesDisplay.js`

### Features

#### 1. Display All Routes
- Shows route cards with key information:
  - Route name and status badge
  - Start and end terminals with locations
  - Transport type with icon (🚌 Jeepney, 🛺 Tricycle)
  - Total distance
  - Number of route points/waypoints

#### 2. Search Functionality
- Search by:
  - Route name
  - Terminal names
  - Location addresses
- Real-time filtering as you type

#### 3. Filter by Transport Type
- **All** - Show all routes
- **Jeepney** - Show only jeepney routes
- **Tricycle** - Show only tricycle routes

#### 4. Filter by Status
- **Active** - Currently operational routes
- **Inactive** - Temporarily suspended routes

#### 5. Responsive Design
- **Desktop** (>968px): 3-column grid
- **Tablet** (768-968px): 2-column grid
- **Mobile** (<768px): Single column stack

### Usage

```jsx
import RoutesDisplay from './components/RoutesDisplay';

function App() {
  return (
    <div>
      <RoutesDisplay />
    </div>
  );
}
```

### Accessing the Page
- URL: `http://localhost:3000/routes`
- Navigation: Click "Routes" in main menu

---

## 👨‍💼 Admin Routes Management

### Component: `AdminRoutes.js`

**Location:** `transpo-system-frontend/src/admin/AdminRoutes.js`

### Features

#### 1. View All Routes
- Table format with columns:
  - ID
  - Route Name
  - Start → End Terminals
  - Distance
  - Transport Type
  - Status
  - Actions

#### 2. Create New Route
- Form fields:
  - Route Name
  - Start Terminal (dropdown)
  - End Terminal (dropdown)
  - Transport Type (dropdown)
  - Distance (auto-calculated or manual)
  - Status (Active/Inactive)
  - Description

#### 3. Edit Existing Route
- Click "Edit" button on any route
- Pre-filled form with current data
- Update any field
- Save changes

#### 4. Delete Route
- Click "Delete" button
- Confirmation dialog
- Permanently removes route and associated data

#### 5. Search & Filter
- Search by route name or terminal
- Filter by transport type
- Filter by status
- Pagination support

### Usage

```jsx
import AdminRoutes from './admin/AdminRoutes';

function AdminDashboard() {
  return (
    <div>
      <AdminRoutes />
    </div>
  );
}
```

### Accessing the Panel
- URL: `http://localhost:3000/admin/routes`
- Navigation: Admin Dashboard → Routes Management

---

## 🔌 API Integration

### Base URL
```
http://localhost:8000/api
```

### Endpoints

#### 1. Get All Routes
```http
GET /api/routes
```

**Query Parameters:**
- `search` - Search term
- `transport_type` - Filter by type
- `status` - Filter by status (active/inactive)
- `page` - Pagination

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "SM to Ayala Route",
      "start_terminal": {
        "id": 1,
        "name": "SM City Cebu",
        "location": "North Reclamation Area, Cebu City"
      },
      "end_terminal": {
        "id": 2,
        "name": "Ayala Center Cebu",
        "location": "Cebu Business Park"
      },
      "transport_type": {
        "id": 1,
        "name": "Jeepney",
        "icon": "🚌"
      },
      "total_distance": 5.2,
      "status": "active",
      "route_points_count": 15
    }
  ],
  "total": 10,
  "per_page": 15
}
```

#### 2. Get Single Route
```http
GET /api/routes/{id}
```

**Response:**
```json
{
  "id": 1,
  "name": "SM to Ayala Route",
  "description": "Main route connecting SM and Ayala",
  "start_terminal_id": 1,
  "end_terminal_id": 2,
  "transport_type_id": 1,
  "total_distance": 5.2,
  "status": "active",
  "start_terminal": { /* terminal object */ },
  "end_terminal": { /* terminal object */ },
  "transport_type": { /* type object */ },
  "route_points": [ /* waypoints array */ ]
}
```

#### 3. Create Route (Admin)
```http
POST /api/routes
Content-Type: application/json

{
  "name": "Carbon to Colon Route",
  "start_terminal_id": 3,
  "end_terminal_id": 4,
  "transport_type_id": 1,
  "total_distance": 2.5,
  "status": "active",
  "description": "Short downtown route"
}
```

**Response (201 Created):**
```json
{
  "message": "Route created successfully",
  "route": { /* created route object */ }
}
```

#### 4. Update Route (Admin)
```http
PUT /api/routes/{id}
Content-Type: application/json

{
  "name": "Updated Route Name",
  "status": "inactive",
  "total_distance": 5.5
}
```

**Response (200 OK):**
```json
{
  "message": "Route updated successfully",
  "route": { /* updated route object */ }
}
```

#### 5. Delete Route (Admin)
```http
DELETE /api/routes/{id}
```

**Response (200 OK):**
```json
{
  "message": "Route deleted successfully"
}
```

---

## 🧪 Testing Guide

### Prerequisites

Before testing, ensure:
- ✅ XAMPP running (Apache & MySQL)
- ✅ Database `budget_byahe` exists
- ✅ Migrations completed
- ✅ Laravel backend running on `http://localhost:8000`
- ✅ React frontend running on `http://localhost:3000`

### Setup Steps

#### 1. Backend Setup (Laravel)

```powershell
cd c:\xampp\htdocs\BudgetByahe\transpo-system-backend

# Verify database is up-to-date
php artisan migrate:status

# If needed, run migrations
php artisan migrate

# Start Laravel development server
php artisan serve
```

#### 2. Frontend Setup (React)

```powershell
cd c:\xampp\htdocs\BudgetByahe\transpo-system-frontend

# Install dependencies (if not already done)
npm install

# Verify .env.local has API URL
# REACT_APP_API_URL=http://localhost:8000/api

# Start React development server
npm start
```

#### 3. Load Sample Data

```powershell
# In backend directory
cd transpo-system-backend

# Import sample data
mysql -u root budget_byahe < database/sample_data.sql
```

### Test Scenarios

#### Test 1: Client Routes Display ✅

**Steps:**
1. Navigate to `http://localhost:3000/routes`
2. Verify page loads without errors
3. Check that route cards are displayed
4. Test search functionality:
   - Type "SM" in search bar
   - Verify routes filtered correctly
5. Test filter buttons:
   - Click "Jeepney" - only jeepney routes shown
   - Click "Tricycle" - only tricycle routes shown
   - Click "All" - all routes shown
6. Verify responsive design:
   - Resize browser window
   - Check mobile view (<768px)

**Expected Results:**
- ✅ Route cards display with correct information
- ✅ Search filters results in real-time
- ✅ Transport type filters work
- ✅ Status badges show (Active/Inactive)
- ✅ Icons display correctly (🚌 🛺)
- ✅ Distance shows in kilometers
- ✅ No console errors

#### Test 2: Admin Routes Management ✅

**Steps:**
1. Navigate to `http://localhost:3000/admin/login`
2. Login with admin credentials
3. Click "Routes Management" in sidebar
4. Verify routes table displays

**Create Route Test:**
1. Click "Add New Route" button
2. Fill in form:
   - Name: "Test Route"
   - Start Terminal: Select from dropdown
   - End Terminal: Select different terminal
   - Transport Type: Jeepney
   - Distance: 3.5
   - Status: Active
3. Click "Save"
4. Verify success message
5. Check route appears in table

**Edit Route Test:**
1. Click "Edit" on any route
2. Change route name
3. Update distance
4. Click "Save"
5. Verify changes reflected

**Delete Route Test:**
1. Click "Delete" on test route
2. Confirm deletion
3. Verify route removed from table

**Expected Results:**
- ✅ All CRUD operations work
- ✅ Form validation works
- ✅ Success/error messages display
- ✅ Table updates after operations
- ✅ No console errors

#### Test 3: API Endpoints ✅

**Using Browser/Postman:**

```http
# Get all routes
GET http://localhost:8000/api/routes

# Get specific route
GET http://localhost:8000/api/routes/1

# Create route (requires admin token)
POST http://localhost:8000/api/routes
{
  "name": "API Test Route",
  "start_terminal_id": 1,
  "end_terminal_id": 2,
  "transport_type_id": 1,
  "total_distance": 4.0,
  "status": "active"
}

# Update route
PUT http://localhost:8000/api/routes/1
{
  "name": "Updated Name"
}

# Delete route
DELETE http://localhost:8000/api/routes/1
```

**Expected Results:**
- ✅ All endpoints return correct status codes
- ✅ Data format matches API documentation
- ✅ Relationships load correctly
- ✅ Pagination works
- ✅ Filters work

#### Test 4: Error Handling ✅

**Steps:**
1. Stop backend server
2. Try accessing routes page
3. Verify error message displays
4. Restart backend
5. Refresh page - should work

**Expected Results:**
- ✅ Graceful error messages
- ✅ No app crashes
- ✅ Retry functionality works

---

## 🔧 Troubleshooting

### Issue 1: Routes Not Displaying

**Symptoms:**
- Empty routes page
- "No routes found" message

**Solutions:**
1. Check backend is running:
   ```powershell
   curl http://localhost:8000/api/routes
   ```
2. Verify database has data:
   ```sql
   SELECT * FROM routes;
   ```
3. Check CORS configuration in `config/cors.php`
4. Verify API URL in frontend `.env.local`

### Issue 2: Cannot Create Route

**Symptoms:**
- 500 error on route creation
- Form submission fails

**Solutions:**
1. Check all foreign keys exist:
   ```sql
   SELECT * FROM terminals;
   SELECT * FROM transport_types;
   ```
2. Verify admin authentication
3. Check Laravel logs: `storage/logs/laravel.log`
4. Validate form data format

### Issue 3: Search Not Working

**Symptoms:**
- Search returns no results
- Filter buttons don't work

**Solutions:**
1. Check browser console for errors
2. Verify API endpoint returns data
3. Check search logic in component
4. Clear browser cache

### Issue 4: Images/Icons Not Loading

**Symptoms:**
- Missing transport type icons
- Broken images

**Solutions:**
1. Verify image paths in code
2. Check public folder structure
3. Use emoji icons as fallback
4. Check browser console for 404 errors

---

## 📊 Database Schema Reference

### Routes Table
```sql
CREATE TABLE routes (
    id BIGINT UNSIGNED PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_terminal_id BIGINT UNSIGNED,
    end_terminal_id BIGINT UNSIGNED,
    transport_type_id BIGINT UNSIGNED,
    total_distance DECIMAL(8,2),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Route Points Table
```sql
CREATE TABLE route_points (
    id BIGINT UNSIGNED PRIMARY KEY,
    route_id BIGINT UNSIGNED,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    point_order INT NOT NULL,
    landmark VARCHAR(255),
    created_at TIMESTAMP
);
```

---

## 📚 Related Documentation

- **[DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md)** - Database configuration
- **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Complete schema reference
- **[ADMIN_SETUP_GUIDE.md](ADMIN_SETUP_GUIDE.md)** - Admin access setup
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Production deployment

---

## ✅ Testing Checklist

Use this checklist to verify all features:

### Client Routes Display
- [ ] Page loads successfully at `/routes`
- [ ] Route cards display with all information
- [ ] Search functionality works
- [ ] Transport type filters work
- [ ] Status filters work
- [ ] Responsive design on mobile
- [ ] Loading states display
- [ ] Error handling works

### Admin Routes Management
- [ ] Admin can access routes panel
- [ ] Routes table displays correctly
- [ ] Can create new route
- [ ] Can edit existing route
- [ ] Can delete route
- [ ] Form validation works
- [ ] Success messages display
- [ ] Changes reflect immediately

### API Integration
- [ ] All GET endpoints work
- [ ] POST creates new routes
- [ ] PUT updates routes
- [ ] DELETE removes routes
- [ ] Relationships load correctly
- [ ] Pagination works
- [ ] Filters work

---

<div align="center">

**Routes System Complete! 🚌**

*Your transportation routes are now fully integrated and testable.*

</div>
