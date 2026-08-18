<?php
/**
 * Database Migration Script v3
 * Adds profile_picture column to users table.
 */

require_once __DIR__ . '/db.php';

try {
    // Check if the profile_picture column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM users LIKE 'profile_picture'");
    $columnExists = $stmt->fetch();

    if (!$columnExists) {
        $pdo->exec("ALTER TABLE users ADD COLUMN profile_picture LONGTEXT DEFAULT NULL");
        echo "Migration successful: Column 'profile_picture' added to 'users' table.\n";
    } else {
        echo "Migration skipped: Column 'profile_picture' already exists in 'users' table.\n";
    }
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
