<?php
// Minimal login test without complex dependencies
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Get input
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    
    if (empty($username)) {
        throw new Exception('Username required');
    }
    
    // Simple user check
    $dataPath = __DIR__ . '/../../data/users.json';
    
    if (!file_exists($dataPath)) {
        throw new Exception('Users file not found at: ' . $dataPath);
    }
    
    $usersData = json_decode(file_get_contents($dataPath), true);
    
    if (!$usersData) {
        throw new Exception('Failed to parse users.json');
    }
    
    $users = $usersData['data'] ?? [];
    
    // Find user
    $foundUser = null;
    foreach ($users as $user) {
        if ($user['username'] === $username) {
            $foundUser = $user;
            break;
        }
    }
    
    if (!$foundUser) {
        throw new Exception('User not found: ' . $username);
    }
    
    // Start session
    session_start();
    $_SESSION['user'] = $foundUser;
    
    echo json_encode([
        'success' => true,
        'user' => $foundUser,
        'message' => 'Simple login successful',
        'debug' => [
            'users_file_path' => $dataPath,
            'users_count' => count($users),
            'session_id' => session_id()
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'php_version' => PHP_VERSION,
            'data_dir' => __DIR__ . '/../../data/',
            'working_dir' => getcwd()
        ]
    ]);
}
?>