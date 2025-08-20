<?php
require_once '../core/DataManager.php';
require_once '../core/Auth.php';
require_once '../core/Validator.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$logger = new Logger();
$auth = new Auth();
$validator = new Validator();

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
    
    // Validate registration data
    if (!$validator->validateUserRegistration($input)) {
        $errors = $validator->getErrors();
        throw new Exception('Validation failed: ' . implode(', ', $errors));
    }
    
    $username = trim($input['username']);
    $userData = $input['userData'] ?? [];
    
    // Sanitize user data
    $sanitizedUserData = [
        'name' => $validator->sanitizeString($userData['name'] ?? ''),
        'email' => $validator->sanitizeEmail($userData['email'] ?? ''),
        'location' => $validator->sanitizeString($userData['location'] ?? ''),
        'phone' => $validator->sanitizeString($userData['phone'] ?? ''),
        'bio' => $validator->sanitizeString($userData['bio'] ?? '')
    ];
    
    // Register user
    $user = $auth->register($username, $sanitizedUserData);
    
    $logger->logActivity('user_register', $user['id'], [
        'username' => $username,
        'role' => $user['role']
    ]);
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'message' => 'Registration successful'
    ]);
    
} catch (Exception $e) {
    $logger->error("Registration failed: " . $e->getMessage(), [
        'username' => $input['username'] ?? 'unknown',
        'input_data' => $input
    ]);
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>