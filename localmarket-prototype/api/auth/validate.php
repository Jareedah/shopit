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
    
    // Check if user is logged in
    if (!$auth->isLoggedIn()) {
        throw new Exception('Not authenticated');
    }
    
    $user = $auth->getCurrentUser();
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'message' => 'Session valid'
    ]);
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>