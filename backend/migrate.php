<?php
/**
 * Database Schema Migration Script
 * Safely adds the category column to the transactions table.
 */

require_once __DIR__ . '/db.php';

try {
    // Check if the category column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM transactions LIKE 'category'");
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        $pdo->exec("ALTER TABLE transactions ADD COLUMN category VARCHAR(50) DEFAULT 'Other' AFTER reason");
        echo "Migration successful: Column 'category' added to 'transactions' table.\n";
    } else {
        echo "Migration skipped: Column 'category' already exists in 'transactions' table.\n";
    }
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
