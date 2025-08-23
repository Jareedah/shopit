<?php
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
    
    // Get current user before logout
    $currentUser = $auth->getCurrentUser();
    
    // Logout user
    $auth->logout();
    
    if ($currentUser) {
        $logger->logActivity('user_logout', $currentUser['id'], [
            'username' => $currentUser['username']
        ]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Logout successful',
        'redirect' => '/localmarket-prototype/auth/login.html'
    ]);
    
} catch (Exception $e) {
    $logger->error("Logout failed: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>