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
    
    // Check authentication
    if (!$auth->isLoggedIn()) {
        throw new Exception('Authentication required');
    }
    
    $currentUser = $auth->getCurrentUser();
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid input data');
    }
    
    $orderId = $input['orderId'] ?? null;
    $newStatus = $input['newStatus'] ?? null;
    $escrowStatus = $input['escrowStatus'] ?? null;
    
    if (!$orderId || !$newStatus) {
        throw new Exception('Invalid order ID or status');
    }
    
    // Load current orders
    $ordersData = $dataManager->readData('orders.json');
    $orders = $ordersData['data'] ?? [];
    
    // Find and update order
    $updated = false;
    foreach ($orders as &$order) {
        if ($order['id'] === $orderId) {
            // Verify user has permission to update this order
            if ($order['buyerId'] !== $currentUser['id'] && $order['sellerId'] !== $currentUser['id']) {
                throw new Exception('Unauthorized to update this order');
            }
            
            $order['status'] = $newStatus;
            if ($escrowStatus) {
                $order['escrow_status'] = $escrowStatus;
            }
            $order['updated_at'] = date('c');
            
            // Add completion timestamp when order is completed
            if ($newStatus === 'completed') {
                $order['completed_at'] = date('c');
            }
            
            // Store deny reason if provided
            if (isset($input['denyReason'])) {
                $order['deny_reason'] = $input['denyReason'];
                $order['denied_at'] = date('c');
            }
            
            $updated = true;
            $logger->log("Order status updated: {$orderId} → {$newStatus}" . ($escrowStatus ? " (escrow: {$escrowStatus})" : ""));
            break;
        }
    }
    
    if (!$updated) {
        throw new Exception('Order not found');
    }
    
    // Save updated orders
    $ordersData['data'] = $orders;
    $ordersData['metadata']['last_updated'] = date('c');
    $dataManager->writeData('orders.json', $ordersData);
    
    echo json_encode([
        'success' => true,
        'message' => 'Order status updated successfully',
        'orderId' => $orderId,
        'newStatus' => $newStatus,
        'escrowStatus' => $escrowStatus
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