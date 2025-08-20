<?php
require_once '../core/DataManager.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');

$logger = new Logger();
$dataManager = new DataManager();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('User ID is required');
    }
    
    $userId = $input['id'];
    
    // Load users
    $usersData = $dataManager->readData('users.json');
    $users = $usersData['data'] ?? [];
    
    // Find the user
    $user = null;
    foreach ($users as $u) {
        if ($u['id'] === $userId) {
            $user = $u;
            break;
        }
    }
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Remove sensitive information
    unset($user['password']);
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'message' => 'User retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Get user failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>