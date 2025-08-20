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
    
    // Check if user is logged in
    if (!isset($_SESSION['user'])) {
        throw new Exception('Authentication required');
    }
    
    $currentUserId = $_SESSION['user']['id'];
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['userId'] ?? $currentUserId;
    
    // Check if user can access this data
    if ($userId !== $currentUserId && $_SESSION['user']['role'] !== 'admin') {
        throw new Exception('Access denied');
    }
    
    // Load orders
    $ordersData = $dataManager->readData('orders.json');
    $orders = $ordersData['data'] ?? [];
    
    // Filter orders for the specific user
    $userOrders = array_filter($orders, function($order) use ($userId) {
        return $order['buyerId'] === $userId || $order['sellerId'] === $userId;
    });
    
    // Sort by date (newest first)
    usort($userOrders, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    echo json_encode([
        'success' => true,
        'orders' => array_values($userOrders),
        'total' => count($userOrders),
        'message' => 'Orders retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Get orders failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>