<?php
// Create Budget Byahe database
try {
    $pdo = new PDO('mysql:host=127.0.0.1', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database
    $pdo->exec('CREATE DATABASE IF NOT EXISTS budgetbyahe_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    
    echo "✅ Database 'budgetbyahe_backend' created successfully!\n";
    
    // Verify database exists
    $stmt = $pdo->query("SHOW DATABASES LIKE 'budgetbyahe_backend'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Database verified and ready to use!\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
