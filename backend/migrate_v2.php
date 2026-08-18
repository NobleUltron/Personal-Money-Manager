<?php
/**
 * Database Migration Script v2
 * Adds users, budgets, and subscriptions tables.
 * Updates accounts table to link to users.
 */

$host = '127.0.0.1';
$user = 'root';
$pass = '';
$db   = 'personal_money_manager';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Create users table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            api_token VARCHAR(128) UNIQUE DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
    ");
    echo "Table 'users' created.\n";

    // Create a default user for existing data
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = 'default_user'");
    $stmt->execute();
    $defaultUserId = $stmt->fetchColumn();

    if (!$defaultUserId) {
        $defaultPassword = password_hash('password123', PASSWORD_DEFAULT);
        $defaultToken = bin2hex(random_bytes(32));
        $pdo->exec("INSERT INTO users (username, password_hash, api_token) VALUES ('default_user', '$defaultPassword', '$defaultToken')");
        $defaultUserId = $pdo->lastInsertId();
        echo "Created default user (default_user / password123).\n";
    }

    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN api_token VARCHAR(128) UNIQUE DEFAULT NULL");
        echo "Added api_token to users.\n";
    } catch (PDOException $e) {}

    // 2. Update accounts table to add user_id
    try {
        $pdo->exec("ALTER TABLE accounts ADD COLUMN user_id INT NULL");
        echo "Added user_id to accounts.\n";
    } catch (PDOException $e) {
        // Ignore if column already exists
    }

    // Assign existing accounts to default user
    $pdo->exec("UPDATE accounts SET user_id = $defaultUserId WHERE user_id IS NULL");
    
    // Make user_id NOT NULL and add foreign key (ignore errors if it already exists)
    try {
        $pdo->exec("ALTER TABLE accounts MODIFY user_id INT NOT NULL");
        $pdo->exec("ALTER TABLE accounts ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
        echo "Added foreign key to accounts.\n";
    } catch (PDOException $e) {}

    // 3. Create budgets table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS budgets (
            id VARCHAR(50) PRIMARY KEY,
            user_id INT NOT NULL,
            category VARCHAR(50) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, category)
        ) ENGINE=InnoDB;
    ");
    echo "Table 'budgets' created.\n";

    // 4. Create subscriptions table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS subscriptions (
            id VARCHAR(50) PRIMARY KEY,
            user_id INT NOT NULL,
            accountId VARCHAR(50) NOT NULL,
            name VARCHAR(100) NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            frequency ENUM('monthly', 'yearly', 'weekly') NOT NULL DEFAULT 'monthly',
            next_due_date DATE NOT NULL,
            category VARCHAR(50) DEFAULT 'Other',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
        ) ENGINE=InnoDB;
    ");
    echo "Table 'subscriptions' created.\n";

    echo "Migration completed successfully!\n";

} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
