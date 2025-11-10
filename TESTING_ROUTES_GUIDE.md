# Testing Routes Integration - Quick Start Guide

## Prerequisites
1. XAMPP running (Apache & MySQL)
2. Database `budgetbyahe_backend` exists with migrations completed
3. Laravel backend running on `http://localhost:8000`
4. React frontend running on `http://localhost:3000`

## Setup Steps

### 1. Backend Setup (Laravel)
```powershell
cd c:\xampp\htdocs\BudgetByahe\transpo-system-backend

# Make sure database is up-to-date
php artisan migrate

# Start Laravel development server
php artisan serve
```

### 2. Frontend Setup (React)
```powershell
cd c:\xampp\htdocs\BudgetByahe\transpo-system-frontend

# Install dependencies (if not already done)
npm install

# Create .env.local file (or copy from example)
# Make sure it contains: REACT_APP_API_URL=http://localhost:8000/api

# Start React development server
npm start
```

## Testing Scenarios

### Test 1: Client Routes Display
1. Navigate to `http://localhost:3000/routes`
2. **Expected Results**:
   - Page loads without errors
   - Routes cards are displayed (if sample data exists)
   - Search bar is functional
   - Filter buttons work (All, Jeepney, Tricycle)
   - Route cards show: route name, terminals, distance, status

### Test 2: Admin Routes Management
1. Navigate to `http://localhost:3000/admin/login`
2. Login with admin credentials
3. Click "Routes Management" in sidebar
4. Navigate to `http://localhost:3000/admin/routes`

#### Test Add Route:
1. Click "Add New Route" button
2. Fill in the form:
   - Route Name: "Test Route"
   - Select Start Terminal
   - Select End Terminal (different from start)
   - Select Transport Type
   - Enter Distance (optional)
   - Status: Active
3. Click "Add Route"
4. **Expected**: Success notification, route appears in table

#### Test Edit Route:
1. Find a route in the table
2. Click the edit button (pencil icon)
3. Modify route name or other fields
4. Click "Update Route"
5. **Expected**: Success notification, changes reflected in table

#### Test Status Toggle:
1. Find a route with "Active" status
2. Click the status button
3. **Expected**: Status changes to "Inactive" with success message
4. Click again to reactivate

#### Test Delete Route:
1. Find a route to delete
2. Click the delete button (trash icon)
3. Confirm deletion in popup
4. **Expected**: Success notification, route removed from table

#### Test Filters:
1. Use "Status" dropdown to filter Active/Inactive routes
2. Use "Transport Type" dropdown to filter by vehicle type
3. **Expected**: Table updates to show only matching routes

### Test 3: API Endpoints (Using Browser or Postman)

#### Get All Routes:
```
GET http://localhost:8000/api/routes
```
Expected: JSON array of all active routes with relationships

#### Get Single Route:
```
GET http://localhost:8000/api/routes/1
```
Expected: JSON object with route details

#### Get Terminals:
```
GET http://localhost:8000/api/terminals
```
Expected: JSON array of all terminals

#### Create Route (POST):
```
POST http://localhost:8000/api/routes
Content-Type: application/json

{
  "route_name": "API Test Route",
  "start_terminal_id": 1,
  "end_terminal_id": 2,
  "transport_type_id": 1,
  "total_distance_km": 5.5,
  "status": "active"
}
```
Expected: 201 status with created route

#### Update Route (PUT):
```
PUT http://localhost:8000/api/routes/1
Content-Type: application/json

{
  "route_name": "Updated Route Name",
  "status": "inactive"
}
```
Expected: 200 status with updated route

#### Delete Route (DELETE):
```
DELETE http://localhost:8000/api/routes/1
```
Expected: 200 status with success message

## Common Issues & Solutions

### Issue: "Failed to load routes"
**Solution**: 
- Check if Laravel server is running: `php artisan serve`
- Verify database connection in `.env`
- Check if migrations are complete: `php artisan migrate:status`

### Issue: "CORS Error"
**Solution**: 
- Verify `config/cors.php` allows all origins
- Clear browser cache
- Restart Laravel server

### Issue: "No routes displayed"
**Solution**: 
- Check if sample data exists in database
- Run seeders if needed
- Create routes manually via admin panel

### Issue: "API URL not found"
**Solution**: 
- Create `.env.local` in frontend directory
- Add: `REACT_APP_API_URL=http://localhost:8000/api`
- Restart React development server

### Issue: "Admin login required"
**Solution**: 
- Use admin credentials stored in localStorage
- Or navigate to `/admin/login` first
- Check browser console for auth errors

## Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Database connection successful
- [ ] Sample routes visible on `/routes` page
- [ ] Admin can access `/admin/routes` page
- [ ] Admin can create new routes
- [ ] Admin can edit existing routes
- [ ] Admin can delete routes
- [ ] Admin can toggle route status
- [ ] Filters work correctly
- [ ] API endpoints respond correctly
- [ ] No console errors in browser
- [ ] No errors in Laravel logs

## Database Check

To verify routes in database:
```sql
-- View all routes
SELECT * FROM routes;

-- View routes with terminals
SELECT 
    r.route_name,
    t1.name as start_terminal,
    t2.name as end_terminal,
    tt.type_name as transport_type,
    r.total_distance_km,
    r.status
FROM routes r
JOIN terminals t1 ON r.start_terminal_id = t1.id
JOIN terminals t2 ON r.end_terminal_id = t2.id
JOIN transport_types tt ON r.transport_type_id = tt.id;
```

## Success Criteria

✅ All routes display correctly on client page
✅ Search and filters work smoothly
✅ Admin can perform all CRUD operations
✅ API responds with correct data
✅ No errors in console or logs
✅ Responsive design works on mobile

## Next Steps After Testing

1. Add authentication middleware to admin routes API
2. Implement route waypoints editor with map
3. Add more sample data for better testing
4. Integrate routes with fare calculation system
5. Add route analytics and statistics

---

**Note**: This guide assumes you have already completed the database setup and have sample data loaded. Refer to `ROUTES_INTEGRATION_GUIDE.md` for complete technical documentation.
