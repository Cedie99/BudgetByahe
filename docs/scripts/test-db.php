<?php
/**
 * Database Connection Test for Hostinger
 * Upload this to your public_html folder
 * Access via: https://api.budgetbyahe.com/test-db.php
 * DELETE THIS FILE AFTER TESTING!
 */

// Database credentials from your .env.production
$hosts = ['127.0.0.1', 'localhost']; // Try both
$database = 'u356758842_budgetByaheDB';
$username = 'u356758842_ByaHERO';
$password = 'Onetwothreefour5!!';

echo "<h2>🔍 Budget Byahe - Database Connection Test</h2>";
echo "<p><strong>Testing Date:</strong> " . date('Y-m-d H:i:s') . "</p>";
echo "<hr>";

foreach ($hosts as $host) {
    echo "<h3>Testing with Host: <code>$host</code></h3>";
    
    try {
        $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
        $conn = new PDO($dsn, $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        echo "<div style='background: #d4edda; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "✅ <strong>SUCCESS! Connected to database</strong><br>";
        echo "Host: <code>$host</code><br>";
        echo "Database: <code>$database</code><br>";
        echo "Username: <code>$username</code><br>";
        echo "</div>";
        
        // Get PHP version
        echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
        
        // Test query - Show tables
        echo "<h4>📊 Database Tables:</h4>";
        $stmt = $conn->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (count($tables) > 0) {
            echo "<ul>";
            foreach ($tables as $table) {
                // Count rows in each table
                try {
                    $countStmt = $conn->query("SELECT COUNT(*) as count FROM `$table`");
                    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
                    echo "<li><strong>$table</strong> - $count rows</li>";
                } catch (Exception $e) {
                    echo "<li><strong>$table</strong> - Error counting rows</li>";
                }
            }
            echo "</ul>";
            echo "<p><strong>Total Tables:</strong> " . count($tables) . "</p>";
        } else {
            echo "<p style='color: orange;'>⚠️ No tables found. You may need to run migrations.</p>";
        }
        
        // Test specific tables
        echo "<h4>🔍 Checking Key Tables:</h4>";
        $keyTables = ['routes', 'terminals', 'feedbacks', 'users', 'transport_types'];
        foreach ($keyTables as $table) {
            try {
                $stmt = $conn->query("SELECT COUNT(*) as count FROM `$table`");
                $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                echo "<p>✅ <strong>$table</strong>: $count records</p>";
            } catch (Exception $e) {
                echo "<p>❌ <strong>$table</strong>: Not found or error</p>";
            }
        }
        
        echo "<hr>";
        echo "<div style='background: #fff3cd; padding: 15px; border-radius: 5px;'>";
        echo "🎯 <strong>Next Steps:</strong><br>";
        echo "1. If tables are empty, run: <code>php artisan migrate</code><br>";
        echo "2. Update your .env file with: <code>DB_HOST=$host</code><br>";
        echo "3. Clear Laravel cache: <code>php artisan config:clear</code><br>";
        echo "4. <strong style='color: red;'>DELETE THIS FILE for security!</strong>";
        echo "</div>";
        
        // Close connection
        $conn = null;
        break; // Exit loop on success
        
    } catch(PDOException $e) {
        echo "<div style='background: #f8d7da; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "❌ <strong>Connection FAILED</strong><br>";
        echo "Error: " . htmlspecialchars($e->getMessage()) . "<br>";
        echo "Error Code: " . $e->getCode() . "<br>";
        echo "</div>";
        
        // Provide specific solutions based on error code
        $errorCode = $e->getCode();
        echo "<div style='background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 10px 0;'>";
        echo "<strong>💡 Possible Solutions:</strong><br>";
        
        switch ($errorCode) {
            case 2002:
                echo "• Try the other host (localhost or 127.0.0.1)<br>";
                echo "• Check if MySQL service is running on server<br>";
                echo "• Contact Hostinger support for correct hostname<br>";
                break;
            case 1045:
                echo "• Verify username and password in Hostinger hPanel<br>";
                echo "• Make sure to include the prefix (u356758842_)<br>";
                echo "• Reset password in hPanel if needed<br>";
                break;
            case 1049:
                echo "• Verify database name in Hostinger hPanel<br>";
                echo "• Make sure to include the prefix (u356758842_)<br>";
                echo "• Check if database was created successfully<br>";
                break;
            default:
                echo "• Check Hostinger hPanel for database details<br>";
                echo "• Verify all credentials match exactly<br>";
                echo "• Contact Hostinger support with this error<br>";
        }
        echo "</div>";
    }
    
    echo "<hr>";
}

echo "<h3>📋 Current Configuration:</h3>";
echo "<pre>";
echo "DB_HOST: (testing both 127.0.0.1 and localhost)\n";
echo "DB_PORT: 3306\n";
echo "DB_DATABASE: $database\n";
echo "DB_USERNAME: $username\n";
echo "DB_PASSWORD: " . str_repeat('*', strlen($password)) . "\n";
echo "</pre>";

echo "<div style='background: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px solid red;'>";
echo "<h3 style='color: red; margin: 0;'>⚠️ SECURITY WARNING</h3>";
echo "<p style='margin: 10px 0 0 0;'><strong>DELETE THIS FILE IMMEDIATELY AFTER TESTING!</strong><br>";
echo "This file contains sensitive database credentials and should not remain on your server.</p>";
echo "</div>";
?>
