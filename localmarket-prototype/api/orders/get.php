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
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('Order ID is required');
    }
    
    $orderId = $input['id'];
    
    // Load orders
    $ordersData = $dataManager->readData('orders.json');
    $orders = $ordersData['data'] ?? [];
    
    // Find the order
    $order = null;
    foreach ($orders as $o) {
        if ($o['id'] === $orderId) {
            $order = $o;
            break;
        }
    }
    
    if (!$order) {
        throw new Exception('Order not found');
    }
    
    // Check if user can access this order
    if ($order['buyerId'] !== $currentUserId && $order['sellerId'] !== $currentUserId && $_SESSION['user']['role'] !== 'admin') {
        throw new Exception('Access denied');
    }
    
    echo json_encode([
        'success' => true,
        'order' => $order,
        'message' => 'Order retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Get order failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>