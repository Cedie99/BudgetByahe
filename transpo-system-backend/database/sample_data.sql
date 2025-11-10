-- ====================================================
-- Budget Byahe - Sample Data SQL
-- ====================================================
-- This file contains sample data for testing the application
-- Run this AFTER running migrations: php artisan migrate
-- ====================================================

-- Use the database
USE budgetbyahe_backend;

-- ====================================================
-- Sample Terminals
-- ====================================================

-- Pulilan Terminals
INSERT INTO terminals (name, association_name, barangay, municipality, latitude, longitude, transport_type_id, created_at, updated_at) VALUES
('SM Pulilan Terminal', 'SM Pulilan Transport Association', 'Poblacion', 'Pulilan', 14.904400, 120.849400, 1, NOW(), NOW()),
('Pulilan Public Market Terminal', 'Pulilan Jeepney Operators', 'Poblacion', 'Pulilan', 14.903200, 120.848700, 1, NOW(), NOW()),
('Barasoain Terminal', 'Barasoain Transport Cooperative', 'Barasoain', 'Malolos', 14.845000, 120.811200, 1, NOW(), NOW());

-- Sta. Maria Terminals
INSERT INTO terminals (name, association_name, barangay, municipality, latitude, longitude, transport_type_id, created_at, updated_at) VALUES
('PUP Sta. Maria Terminal', 'PUP Transport Association', 'Bagbaguin', 'Sta. Maria', 14.822700, 120.956400, 1, NOW(), NOW()),
('Sta. Maria Public Market', 'Sta. Maria Jeepney Association', 'Poblacion', 'Sta. Maria', 14.469100, 121.424900, 1, NOW(), NOW());

-- Tricycle Terminals
INSERT INTO terminals (name, association_name, barangay, municipality, latitude, longitude, transport_type_id, created_at, updated_at) VALUES
('Pulilan Tricycle Terminal', 'Pulilan TODA', 'Poblacion', 'Pulilan', 14.904000, 120.849000, 2, NOW(), NOW()),
('Balatong Tricycle Terminal', 'Balatong TODA', 'Balatong', 'Pulilan', 14.911300, 120.831400, 2, NOW(), NOW());

-- ====================================================
-- Sample Routes
-- ====================================================

-- Jeepney Routes
INSERT INTO routes (route_name, start_terminal_id, end_terminal_id, total_distance_km, transport_type_id, status, created_at, updated_at) VALUES
('SM Pulilan to PUP Sta. Maria', 1, 4, 15.5, 1, 'active', NOW(), NOW()),
('Pulilan Market to PUP Sta. Maria', 2, 4, 16.2, 1, 'active', NOW(), NOW()),
('SM Pulilan to Barasoain', 1, 3, 8.3, 1, 'active', NOW(), NOW()),
('Barasoain to Sta. Maria Market', 3, 5, 12.7, 1, 'active', NOW(), NOW());

-- Tricycle Routes
INSERT INTO routes (route_name, start_terminal_id, end_terminal_id, total_distance_km, transport_type_id, status, created_at, updated_at) VALUES
('Pulilan Town to Balatong', 6, 7, 3.2, 2, 'active', NOW(), NOW());

-- ====================================================
-- Sample Route Points (for map display)
-- ====================================================

-- Route 1: SM Pulilan to PUP Sta. Maria (simplified)
INSERT INTO route_points (route_id, order_no, latitude, longitude, barangay_name, created_at, updated_at) VALUES
(1, 1, 14.904400, 120.849400, 'Poblacion (Pulilan)', NOW(), NOW()),
(1, 2, 14.898000, 120.860000, 'Dampol', NOW(), NOW()),
(1, 3, 14.880000, 120.880000, 'Longos', NOW(), NOW()),
(1, 4, 14.850000, 120.900000, 'Caingin', NOW(), NOW()),
(1, 5, 14.822700, 120.956400, 'Bagbaguin (PUP)', NOW(), NOW());

-- Route 3: SM Pulilan to Barasoain (simplified)
INSERT INTO route_points (route_id, order_no, latitude, longitude, barangay_name, created_at, updated_at) VALUES
(3, 1, 14.904400, 120.849400, 'Poblacion (Pulilan)', NOW(), NOW()),
(3, 2, 14.880000, 120.840000, 'Cutcut', NOW(), NOW()),
(3, 3, 14.860000, 120.825000, 'Balite', NOW(), NOW()),
(3, 4, 14.845000, 120.811200, 'Barasoain', NOW(), NOW());

-- ====================================================
-- Sample Fare Matrix
-- ====================================================

-- Jeepney Fares (Bulacan LGU Standard 2025)
INSERT INTO fare_matrix (transport_type_id, base_fare, base_distance_km, per_km_rate, effective_date, municipality, created_at, updated_at) VALUES
(1, 13.00, 5.0, 2.20, '2025-01-01', 'Pulilan', NOW(), NOW()),
(1, 13.00, 5.0, 2.20, '2025-01-01', 'Sta. Maria', NOW(), NOW()),
(1, 13.00, 5.0, 2.20, '2025-01-01', 'Malolos', NOW(), NOW());

-- Tricycle Fares (Pulilan TODA Rates)
INSERT INTO fare_matrix (transport_type_id, base_fare, base_distance_km, per_km_rate, effective_date, municipality, created_at, updated_at) VALUES
(2, 15.00, 2.0, 5.00, '2025-01-01', 'Pulilan', NOW(), NOW());

-- ====================================================
-- Sample Fare Calculations (for analytics)
-- ====================================================

-- Note: user_id will be NULL for guest calculations
-- Replace NULL with actual user IDs after creating users

INSERT INTO fare_calculations (user_id, route_id, distance_km, fare_amount, fare_matrix_id, created_at) VALUES
(NULL, 1, 15.5, 36.10, 1, NOW() - INTERVAL 5 DAY),
(NULL, 1, 15.5, 36.10, 1, NOW() - INTERVAL 4 DAY),
(NULL, 3, 8.3, 20.26, 1, NOW() - INTERVAL 3 DAY),
(NULL, 5, 3.2, 21.00, 4, NOW() - INTERVAL 2 DAY),
(NULL, 1, 15.5, 36.10, 1, NOW() - INTERVAL 1 DAY);

-- ====================================================
-- Calculation Example:
-- Route 1 (15.5 km):
--   Base fare: ₱13.00 (covers first 5 km)
--   Remaining: 15.5 - 5 = 10.5 km
--   Additional: 10.5 × ₱2.20 = ₱23.10
--   Total: ₱13.00 + ₱23.10 = ₱36.10
-- ====================================================

-- ====================================================
-- Verify Sample Data
-- ====================================================

-- Count records
SELECT 
    (SELECT COUNT(*) FROM terminals) AS terminals_count,
    (SELECT COUNT(*) FROM routes) AS routes_count,
    (SELECT COUNT(*) FROM route_points) AS route_points_count,
    (SELECT COUNT(*) FROM fare_matrix) AS fare_matrix_count,
    (SELECT COUNT(*) FROM fare_calculations) AS fare_calculations_count;

-- View sample routes with terminals
SELECT 
    r.id,
    r.route_name,
    st.name AS start_terminal,
    et.name AS end_terminal,
    r.total_distance_km,
    tt.name AS transport_type,
    r.status
FROM routes r
JOIN terminals st ON r.start_terminal_id = st.id
JOIN terminals et ON r.end_terminal_id = et.id
JOIN transport_types tt ON r.transport_type_id = tt.id;

-- View fare calculations with routes
SELECT 
    fc.id,
    r.route_name,
    fc.distance_km,
    fc.fare_amount,
    fm.base_fare,
    fm.per_km_rate,
    fc.created_at
FROM fare_calculations fc
JOIN routes r ON fc.route_id = r.id
JOIN fare_matrix fm ON fc.fare_matrix_id = fm.id
ORDER BY fc.created_at DESC;

-- ====================================================
-- End of Sample Data
-- ====================================================
