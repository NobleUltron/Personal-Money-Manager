<?php
/**
 * Personal Money Manager API (v2)
 * Exposes endpoints for managing users, accounts, transactions, budgets, and subscriptions.
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to send success response
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Helper to send error response
function sendError($message, $statusCode = 400) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'message' => $message
    ]);
    exit();
}

// Helper to get input JSON body
function getJSONInput() {
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);
    if ($inputJSON && $input === null) {
        sendError('Invalid JSON input');
    }
    return $input ? $input : [];
}

// --- Authentication Logic ---
$user_id = null;

// Allow public access for login/register
$public_actions = ['login', 'register'];

if (!in_array($action, $public_actions)) {
    $headers = function_exists('apache_request_headers') ? apache_request_headers() : [];
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader)) {
        // Fallback for NGINX or fastcgi
        $authHeader = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    }

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        $stmt = $pdo->prepare("SELECT id FROM users WHERE api_token = ?");
        $stmt->execute([$token]);
        $user_id = $stmt->fetchColumn();

        if (!$user_id) {
            sendError('Invalid or expired token', 401);
        }
    } else {
        sendError('Authorization header required', 401);
    }
}

// --- Endpoints ---
switch ($action) {
    case 'login':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        $input = getJSONInput();
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? trim($input['password']) : '';

        if (empty($username) || empty($password)) sendError('Username and password are required');

        $stmt = $pdo->prepare("SELECT id, password_hash, profile_picture FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $token = bin2hex(random_bytes(32));
            $pdo->prepare("UPDATE users SET api_token = ? WHERE id = ?")->execute([$token, $user['id']]);
            sendResponse([
                'success' => true,
                'token' => $token,
                'user' => ['id' => $user['id'], 'username' => $username, 'profilePicture' => $user['profile_picture']]
            ]);
        } else {
            sendError('Invalid username or password', 401);
        }
        break;

    case 'register':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        $input = getJSONInput();
        $username = isset($input['username']) ? trim($input['username']) : '';
        $password = isset($input['password']) ? trim($input['password']) : '';

        if (empty($username) || empty($password)) sendError('Username and password are required');
        
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) sendError('Username already exists');

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $token = bin2hex(random_bytes(32));
        
        $stmt = $pdo->prepare("INSERT INTO users (username, password_hash, api_token) VALUES (?, ?, ?)");
        if ($stmt->execute([$username, $hash, $token])) {
            $newUserId = $pdo->lastInsertId();
            sendResponse([
                'success' => true,
                'token' => $token,
                'user' => ['id' => $newUserId, 'username' => $username, 'profilePicture' => null]
            ]);
        } else {
            sendError('Registration failed', 500);
        }
        break;

    case 'update_profile':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        $input = getJSONInput();
        $newUsername = isset($input['username']) ? trim($input['username']) : '';
        $currentPassword = isset($input['currentPassword']) ? trim($input['currentPassword']) : '';
        $newPassword = isset($input['newPassword']) ? trim($input['newPassword']) : '';
        $profilePicture = isset($input['profilePicture']) ? $input['profilePicture'] : '';

        if (empty($currentPassword)) sendError('Current password is required to make changes');

        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            sendError('Incorrect current password', 401);
        }

        $updates = [];
        $params = [];

        if (!empty($newUsername)) {
            // Check if username is taken by someone else
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
            $stmt->execute([$newUsername, $user_id]);
            if ($stmt->fetch()) sendError('Username already exists');
            
            $updates[] = "username = ?";
            $params[] = $newUsername;
        }

        if (!empty($newPassword)) {
            $updates[] = "password_hash = ?";
            $params[] = password_hash($newPassword, PASSWORD_DEFAULT);
        }
        
        if (!empty($profilePicture)) {
            $updates[] = "profile_picture = ?";
            $params[] = $profilePicture;
        }

        if (!empty($updates)) {
            $params[] = $user_id;
            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            if ($stmt->execute($params)) {
                // Return updated user data
                $stmt = $pdo->prepare("SELECT username, profile_picture FROM users WHERE id = ?");
                $stmt->execute([$user_id]);
                $finalUser = $stmt->fetch();
                sendResponse(['success' => true, 'message' => 'Profile updated successfully', 'user' => ['id' => $user_id, 'username' => $finalUser['username'], 'profilePicture' => $finalUser['profile_picture']]]);
            } else {
                sendError('Failed to update profile', 500);
            }
        } else {
            sendResponse(['success' => true, 'message' => 'No changes made']);
        }
        break;

    case 'get_data':
        if ($method !== 'GET') sendError('Method not allowed', 405);
        try {
            $stmt = $pdo->prepare("SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC");
            $stmt->execute([$user_id]);
            $accounts = $stmt->fetchAll();
            foreach ($accounts as &$a) {
                if (isset($a['initial_balance'])) {
                    $a['initial_balance'] = (float)$a['initial_balance'];
                }
            }

            $stmt = $pdo->prepare("
                SELECT t.* FROM transactions t
                JOIN accounts a ON t.accountId = a.id
                WHERE a.user_id = ? ORDER BY t.date DESC, t.created_at DESC
            ");
            $stmt->execute([$user_id]);
            $transactions = $stmt->fetchAll();

            $stmt = $pdo->prepare("SELECT * FROM budgets WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $budgets = $stmt->fetchAll();

            $stmt = $pdo->prepare("SELECT * FROM subscriptions WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $subscriptions = $stmt->fetchAll();

            $stmt = $pdo->prepare("SELECT * FROM loans WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $loans = $stmt->fetchAll();

            foreach ($transactions as &$t) $t['amount'] = (float)$t['amount'];
            foreach ($budgets as &$b) $b['amount'] = (float)$b['amount'];
            foreach ($subscriptions as &$s) $s['amount'] = (float)$s['amount'];
            foreach ($loans as &$l) {
                $l['amount'] = (float)$l['amount'];
                $l['amount_paid'] = (float)$l['amount_paid'];
            }

            sendResponse([
                'success' => true,
                'accounts' => $accounts,
                'transactions' => $transactions,
                'budgets' => $budgets,
                'subscriptions' => $subscriptions,
                'loans' => $loans
            ]);
        } catch (PDOException $e) {
            sendError('Failed to fetch data: ' . $e->getMessage(), 500);
        }
        break;

    case 'add_account':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $name = isset($input['name']) ? trim($input['name']) : '';
        $bank_name = isset($input['bank_name']) ? trim($input['bank_name']) : null;
        $account_number = isset($input['account_number']) ? trim($input['account_number']) : null;
        $type = isset($input['type']) ? trim($input['type']) : 'Checking';
        $initial_balance = isset($input['initial_balance']) ? (float)$input['initial_balance'] : 0.0;

        if (empty($id) || empty($name)) sendError('Account ID and Name required');

        $stmt = $pdo->prepare("INSERT INTO accounts (id, user_id, name, bank_name, account_number, type, initial_balance) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $user_id, $name, $bank_name, $account_number, $type, $initial_balance]);
        sendResponse(['success' => true, 'message' => 'Account created']);
        break;

    case 'update_account':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $name = isset($input['name']) ? trim($input['name']) : '';
        $bank_name = isset($input['bank_name']) ? trim($input['bank_name']) : null;
        $account_number = isset($input['account_number']) ? trim($input['account_number']) : null;
        $type = isset($input['type']) ? trim($input['type']) : 'Checking';
        $initial_balance = isset($input['initial_balance']) ? (float)$input['initial_balance'] : 0.0;

        if (empty($id) || empty($name)) sendError('Account ID and Name required');

        $stmt = $pdo->prepare("UPDATE accounts SET name = ?, bank_name = ?, account_number = ?, type = ?, initial_balance = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$name, $bank_name, $account_number, $type, $initial_balance, $id, $user_id]);
        sendResponse(['success' => true]);
        break;

    case 'delete_account':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        if (empty($id)) sendError('Account ID required');

        $stmt = $pdo->prepare("DELETE FROM accounts WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        sendResponse(['success' => true]);
        break;

    case 'add_transaction':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $accountId = isset($input['accountId']) ? trim($input['accountId']) : '';
        $type = isset($input['type']) ? trim($input['type']) : '';
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;
        $date = isset($input['date']) ? trim($input['date']) : '';
        $reason = isset($input['reason']) ? trim($input['reason']) : null;
        $category = isset($input['category']) ? trim($input['category']) : 'Other';

        // Verify account belongs to user
        $stmt = $pdo->prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?");
        $stmt->execute([$accountId, $user_id]);
        if (!$stmt->fetch()) sendError('Invalid account', 403);

        $stmt = $pdo->prepare("INSERT INTO transactions (id, accountId, type, amount, date, reason, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $accountId, $type, $amount, $date, $reason, $category]);
        sendResponse(['success' => true, 'transaction' => $input]);
        break;

    case 'add_transfer':
        $input = getJSONInput();
        $sourceAccountId = isset($input['sourceAccountId']) ? trim($input['sourceAccountId']) : '';
        $targetAccountId = isset($input['targetAccountId']) ? trim($input['targetAccountId']) : '';
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;
        $date = isset($input['date']) ? trim($input['date']) : '';
        $reason = isset($input['reason']) ? trim($input['reason']) : 'Transfer';
        
        if (empty($sourceAccountId) || empty($targetAccountId) || $amount <= 0 || empty($date)) {
            sendError('Invalid transfer details');
        }

        // Verify both accounts belong to the user
        $stmt = $pdo->prepare("SELECT id, name FROM accounts WHERE id IN (?, ?) AND user_id = ?");
        $stmt->execute([$sourceAccountId, $targetAccountId, $user_id]);
        $accs = $stmt->fetchAll();
        if (count($accs) !== 2) sendError('One or both accounts are invalid', 403);

        $sourceName = $accs[0]['id'] === $sourceAccountId ? $accs[0]['name'] : $accs[1]['name'];
        $targetName = $accs[0]['id'] === $targetAccountId ? $accs[0]['name'] : $accs[1]['name'];

        try {
            $pdo->beginTransaction();

            $w_id = 't_' . uniqid();
            $d_id = 't_' . uniqid();

            // Withdrawal from source
            $stmt = $pdo->prepare("INSERT INTO transactions (id, accountId, type, amount, date, reason, category) VALUES (?, ?, 'withdrawal', ?, ?, ?, 'Transfer')");
            $stmt->execute([$w_id, $sourceAccountId, $amount, $date, "Transfer to " . $targetName]);

            // Deposit to target
            $stmt = $pdo->prepare("INSERT INTO transactions (id, accountId, type, amount, date, reason, category) VALUES (?, ?, 'deposit', ?, ?, ?, 'Transfer')");
            $stmt->execute([$d_id, $targetAccountId, $amount, $date, "Transfer from " . $sourceName]);

            $pdo->commit();
            sendResponse(['success' => true, 'message' => 'Transfer completed']);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendError('Transfer failed: ' . $e->getMessage(), 500);
        }
        break;
        
    case 'update_transaction':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $type = isset($input['type']) ? trim($input['type']) : '';
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;
        $date = isset($input['date']) ? trim($input['date']) : '';
        $reason = isset($input['reason']) ? trim($input['reason']) : null;
        $category = isset($input['category']) ? trim($input['category']) : 'Other';

        // Verify transaction belongs to user's account
        $stmt = $pdo->prepare("SELECT t.id FROM transactions t JOIN accounts a ON t.accountId = a.id WHERE t.id = ? AND a.user_id = ?");
        $stmt->execute([$id, $user_id]);
        if (!$stmt->fetch()) sendError('Invalid transaction or unauthorized', 403);

        $stmt = $pdo->prepare("UPDATE transactions SET type = ?, amount = ?, date = ?, reason = ?, category = ? WHERE id = ?");
        $stmt->execute([$type, $amount, $date, $reason, $category, $id]);
        sendResponse(['success' => true]);
        break;
        
    case 'delete_transaction':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        
        // Verify transaction belongs to user's account
        $stmt = $pdo->prepare("DELETE t FROM transactions t JOIN accounts a ON t.accountId = a.id WHERE t.id = ? AND a.user_id = ?");
        $stmt->execute([$id, $user_id]);
        sendResponse(['success' => true]);
        break;

    case 'add_budget':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $category = isset($input['category']) ? trim($input['category']) : '';
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;

        $stmt = $pdo->prepare("INSERT INTO budgets (id, user_id, category, amount) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount = VALUES(amount)");
        $stmt->execute([$id, $user_id, $category, $amount]);
        sendResponse(['success' => true]);
        break;

    case 'delete_budget':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $stmt = $pdo->prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        sendResponse(['success' => true]);
        break;

    case 'add_subscription':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $accountId = isset($input['accountId']) ? trim($input['accountId']) : '';
        $name = isset($input['name']) ? trim($input['name']) : '';
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;
        $frequency = isset($input['frequency']) ? trim($input['frequency']) : 'monthly';
        $next_due_date = isset($input['next_due_date']) ? trim($input['next_due_date']) : '';
        
        $stmt = $pdo->prepare("SELECT id FROM accounts WHERE id = ? AND user_id = ?");
        $stmt->execute([$accountId, $user_id]);
        if (!$stmt->fetch()) sendError('Invalid account', 403);

        $stmt = $pdo->prepare("INSERT INTO subscriptions (id, user_id, accountId, name, amount, frequency, next_due_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $user_id, $accountId, $name, $amount, $frequency, $next_due_date]);
        sendResponse(['success' => true]);
        break;
        
    case 'delete_subscription':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $stmt = $pdo->prepare("DELETE FROM subscriptions WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        sendResponse(['success' => true]);
        break;

    case 'add_loan':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $type = isset($input['type']) ? trim($input['type']) : '';
        $name = isset($input['name']) ? trim($input['name']) : '';
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;
        $amount_paid = isset($input['amount_paid']) ? (float)$input['amount_paid'] : 0.0;
        $due_date = isset($input['due_date']) ? trim($input['due_date']) : null;
        
        $stmt = $pdo->prepare("INSERT INTO loans (id, user_id, type, name, amount, amount_paid, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $user_id, $type, $name, $amount, $amount_paid, $due_date]);
        sendResponse(['success' => true]);
        break;

    case 'update_loan':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $type = isset($input['type']) ? trim($input['type']) : '';
        $name = isset($input['name']) ? trim($input['name']) : '';
        $amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;
        $amount_paid = isset($input['amount_paid']) ? (float)$input['amount_paid'] : 0.0;
        $due_date = isset($input['due_date']) ? trim($input['due_date']) : null;
        
        $stmt = $pdo->prepare("UPDATE loans SET type = ?, name = ?, amount = ?, amount_paid = ?, due_date = ? WHERE id = ? AND user_id = ?");
        $stmt->execute([$type, $name, $amount, $amount_paid, $due_date, $id, $user_id]);
        sendResponse(['success' => true]);
        break;

    case 'delete_loan':
        $input = getJSONInput();
        $id = isset($input['id']) ? trim($input['id']) : '';
        $stmt = $pdo->prepare("DELETE FROM loans WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        sendResponse(['success' => true]);
        break;

    case 'delete_user':
        if ($method !== 'POST') sendError('Method not allowed', 405);
        $input = getJSONInput();
        $password = isset($input['password']) ? trim($input['password']) : '';

        if (empty($password)) sendError('Password is required to delete your account');

        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            sendError('Incorrect password', 401);
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        if ($stmt->execute([$user_id])) {
            sendResponse(['success' => true, 'message' => 'Account deleted successfully']);
        } else {
            sendError('Failed to delete account', 500);
        }
        break;

    default:
        sendError('Invalid action requested', 404);
        break;
}
