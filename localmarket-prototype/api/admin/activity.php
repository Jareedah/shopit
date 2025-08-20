<?php
require_once '../core/DataManager.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');

$dataManager = new DataManager();
$logger = new Logger();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Check admin privileges
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        throw new Exception('Admin access required');
    }
    
    // Get recent activity from logs
    $recentLogs = $logger->getRecentLogs(20);
    
    // Convert logs to activity format
    $activities = [];
    foreach ($recentLogs as $log) {
        $activity = [
            'type' => 'system',
            'title' => 'System Activity',
            'description' => $log['message'],
            'timestamp' => $log['timestamp']
        ];
        
        // Categorize based on message content
        if (strpos($log['message'], 'User logged in') !== false) {
            $activity['type'] = 'user_login';
            $activity['title'] = 'User Login';
        } elseif (strpos($log['message'], 'User activity: user_register') !== false) {
            $activity['type'] = 'user_register';
            $activity['title'] = 'New User Registration';
        } elseif (strpos($log['message'], 'New listing created') !== false) {
            $activity['type'] = 'listing_create';
            $activity['title'] = 'New Listing Created';
        } elseif (strpos($log['message'], 'Order created') !== false) {
            $activity['type'] = 'order_create';
            $activity['title'] = 'New Order Placed';
        } elseif ($log['level'] === 'ERROR') {
            $activity['type'] = 'warning';
            $activity['title'] = 'System Error';
        }
        
        $activities[] = $activity;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $activities,
        'message' => 'Activity retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Activity error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>