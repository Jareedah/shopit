<?php
// Update order status API endpoint
require_once '../core/DataManager.php';
require_once '../core/Auth.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $auth = new Auth();
    $dataManager = new DataManager();
    $logger = new Logger();
    
    if (!$auth->isLoggedIn()) {
        throw new Exception('Authentication required');
    }
    
    $currentUser = $auth->getCurrentUser();
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['orderId']) || !isset($input['newStatus'])) {
        throw new Exception('Invalid input: orderId and newStatus are required');
    }
    
    $orderId = $input['orderId'];
    $newStatus = $input['newStatus'];
    $escrowStatus = $input['escrowStatus'] ?? null;
    
    $logger->log("Update status request received for OrderID: {$orderId}, NewStatus: {$newStatus}, By User: {$currentUser['username']}");
    
    $ordersData = $dataManager->readData('orders.json');
    $orders = $ordersData['data'] ?? [];
    
    $updated = false;
    $orderIndex = -1;

    foreach ($orders as $index => $order) {
        if ($order['id'] === $orderId) {
            $orderIndex = $index;
            break;
        }
    }
    
    if ($orderIndex === -1) {
        throw new Exception('Order not found');
    }

    // Directly modify the array by reference
    $orderToUpdate = &$orders[$orderIndex];

    // Verify user has permission to update this order
    if ($orderToUpdate['buyerId'] !== $currentUser['id'] && $orderToUpdate['sellerId'] !== $currentUser['id']) {
        throw new Exception('Unauthorized to update this order');
    }
    
    // Update the order details
    $orderToUpdate['status'] = $newStatus;
    if ($escrowStatus) {
        $orderToUpdate['escrow_status'] = $escrowStatus;
    }
    $orderToUpdate['updated_at'] = date('c');

    if ($newStatus === 'completed') {
        $orderToUpdate['completed_at'] = date('c');
    }
    
    $logger->log("Order {$orderId} status updated to '{$newStatus}'.");
    
    // Save updated orders
    $ordersData['data'] = $orders;
    $dataManager->writeData('orders.json', $ordersData);
    
    echo json_encode([
        'success' => true,
        'message' => 'Order status updated successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Order status update failed: " . $e->getMessage(), 'ERROR');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>