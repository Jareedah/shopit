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
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? 'check';
    
    switch ($action) {
        case 'check':
            // Check session status
            if ($auth->isLoggedIn()) {
                $user = $auth->getCurrentUser();
                echo json_encode([
                    'success' => true,
                    'authenticated' => true,
                    'user' => $user,
                    'message' => 'Session active'
                ]);
            } else {
                echo json_encode([
                    'success' => true,
                    'authenticated' => false,
                    'message' => 'No active session'
                ]);
            }
            break;
            
        case 'refresh':
            // Refresh session
            if (!$auth->isLoggedIn()) {
                throw new Exception('Not authenticated');
            }
            
            $user = $auth->getCurrentUser();
            $logger->logActivity('session_refresh', $user['id']);
            
            echo json_encode([
                'success' => true,
                'user' => $user,
                'message' => 'Session refreshed'
            ]);
            break;
            
        case 'destroy':
            // Destroy session
            $currentUser = $auth->getCurrentUser();
            $auth->logout();
            
            if ($currentUser) {
                $logger->logActivity('session_destroy', $currentUser['id']);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Session destroyed'
            ]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
    
} catch (Exception $e) {
    $logger->error("Session error: " . $e->getMessage());
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>