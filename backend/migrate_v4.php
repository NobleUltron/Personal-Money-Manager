<?php
/**
 * Database Migration Script v4
 * Adds loans table for tracking borrowed/lent money.
 */

require_once __DIR__ . '/db.php';

try {
    // Check if the loans table already exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'loans'");
    $tableExists = $stmt->fetch();

    if (!$tableExists) {
        $pdo->exec("
            CREATE TABLE loans (
                id VARCHAR(50) PRIMARY KEY,
                user_id INT NOT NULL,
                type VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                amount_paid DECIMAL(15, 2) DEFAULT 0.00,
                due_date DATE NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");
        echo "Migration successful: Table 'loans' created.\n";
    } else {
        echo "Migration skipped: Table 'loans' already exists.\n";
    }
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
