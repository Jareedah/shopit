<?php
require_once '../core/Auth.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');

$auth = new Auth();
$logger = new Logger();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Require authentication
    $auth->requireAuth();
    
    $user = $auth->getCurrentUser();
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'message' => 'User data retrieved successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>