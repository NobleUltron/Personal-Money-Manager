<?php
/**
 * Database Setup Script
 * Sets up the personal_money_manager database and tables.
 */

$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    // Connect to MySQL server first without database
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS personal_money_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database 'personal_money_manager' created or already exists.\n";

    // Connect to the database
    $pdo->exec("USE personal_money_manager");

    // Create accounts table
    $createAccountsTable = "
        CREATE TABLE IF NOT EXISTS accounts (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($createAccountsTable);
    echo "Table 'accounts' created or already exists.\n";

    // Create transactions table
    $createTransactionsTable = "
        CREATE TABLE IF NOT EXISTS transactions (
            id VARCHAR(50) PRIMARY KEY,
            accountId VARCHAR(50) NOT NULL,
            type ENUM('deposit', 'withdrawal') NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            date DATE NOT NULL,
            reason VARCHAR(255) DEFAULT NULL,
            category VARCHAR(50) DEFAULT 'Other',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ";
    $pdo->exec($createTransactionsTable);
    echo "Table 'transactions' created or already exists.\n";

    echo "Database setup completed successfully!\n";
} catch (PDOException $e) {
    echo "Database setup failed: " . $e->getMessage() . "\n";
    exit(1);
}
