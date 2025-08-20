<?php
require_once '../core/DataManager.php';
require_once '../core/Auth.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$logger = new Logger();
$auth = new Auth();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid input data');
    }
    
    $username = trim($input['username'] ?? '');
    
    if (empty($username)) {
        throw new Exception('Username is required');
    }
    
    // Attempt login
    $user = $auth->login($username);
    
    $logger->logActivity('user_login', $user['id'], [
        'username' => $username,
        'role' => $user['role']
    ]);
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'message' => 'Login successful'
    ]);
    
} catch (Exception $e) {
    $logger->error("Login failed for username: " . ($username ?? 'unknown') . " - " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>