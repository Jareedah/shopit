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
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['userId'])) {
        throw new Exception('User ID is required');
    }
    
    $userId = $input['userId'];
    
    // Load user data
    $usersData = $dataManager->readData('users.json');
    $users = $usersData['data'] ?? [];
    
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
    
    // Load additional statistics
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    $ordersData = $dataManager->readData('orders.json');
    $orders = $ordersData['data'] ?? [];
    
    // Count user's listings
    $userListings = array_filter($listings, function($listing) use ($userId) {
        return $listing['sellerId'] === $userId;
    });
    
    // Count user's orders
    $userOrders = array_filter($orders, function($order) use ($userId) {
        return $order['buyerId'] === $userId || $order['sellerId'] === $userId;
    });
    
    $user['listingsCount'] = count($userListings);
    $user['ordersCount'] = count($userOrders);
    $user['reviewsCount'] = 0; // Placeholder for future feature
    
    echo json_encode([
        'success' => true,
        'user' => $user,
        'message' => 'User details retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("User detail error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>