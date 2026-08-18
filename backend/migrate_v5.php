<?php
/**
 * Database Migration Script v5
 * Adds bank details and initial balance to the accounts table.
 */

require_once __DIR__ . '/db.php';

try {
    // 1. Check and add bank_name
    $stmt = $pdo->query("SHOW COLUMNS FROM accounts LIKE 'bank_name'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE accounts ADD COLUMN bank_name VARCHAR(255) NULL");
        echo "Added column 'bank_name'.\n";
    } else {
        echo "Column 'bank_name' already exists.\n";
    }

    // 2. Check and add account_number
    $stmt = $pdo->query("SHOW COLUMNS FROM accounts LIKE 'account_number'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE accounts ADD COLUMN account_number VARCHAR(100) NULL");
        echo "Added column 'account_number'.\n";
    } else {
        echo "Column 'account_number' already exists.\n";
    }

    // 3. Check and add type
    $stmt = $pdo->query("SHOW COLUMNS FROM accounts LIKE 'type'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE accounts ADD COLUMN type VARCHAR(50) DEFAULT 'Checking'");
        echo "Added column 'type'.\n";
    } else {
        echo "Column 'type' already exists.\n";
    }

    // 4. Check and add initial_balance
    $stmt = $pdo->query("SHOW COLUMNS FROM accounts LIKE 'initial_balance'");
    if (!$stmt->fetch()) {
        $pdo->exec("ALTER TABLE accounts ADD COLUMN initial_balance DECIMAL(15, 2) DEFAULT 0.00");
        echo "Added column 'initial_balance'.\n";
    } else {
        echo "Column 'initial_balance' already exists.\n";
    }

    echo "Migration successful!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
