<?php
// API endpoint to get buyer orders from global orders.json
require_once '../core/DataManager.php';
require_once '../core/Auth.php';

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
    
    // Check if user is logged in
    if (!$auth->isLoggedIn()) {
        throw new Exception('Authentication required');
    }
    
    $currentUser = $auth->getCurrentUser();
    $buyerId = $currentUser['id'];
    
    $dataManager = new DataManager();
    
    // Get all orders from global orders.json
    $ordersData = $dataManager->readData('orders.json');
    $allOrders = $ordersData['data'] ?? [];
    
    // Filter orders for this buyer
    $buyerOrders = array_filter($allOrders, function($order) use ($buyerId) {
        return $order['buyerId'] === $buyerId;
    });
    
    // Get listings data to enrich order information
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    $listingsMap = [];
    foreach ($listings as $listing) {
        $listingsMap[$listing['id']] = $listing;
    }
    
    // Get users data to enrich seller information
    $usersData = $dataManager->readData('users.json');
    $users = $usersData['data'] ?? [];
    $usersMap = [];
    foreach ($users as $user) {
        $usersMap[$user['id']] = $user;
    }
    
    // Enrich buyer orders with additional information
    $enrichedOrders = [];
    foreach ($buyerOrders as $order) {
        $listing = $listingsMap[$order['listingId']] ?? null;
        $seller = $usersMap[$order['sellerId']] ?? null;
        
        $enrichedOrder = $order;
        $enrichedOrder['listingTitle'] = $listing ? $listing['title'] : 'Unknown Item';
        $enrichedOrder['sellerName'] = $seller ? $seller['username'] : 'Unknown Seller';
        $enrichedOrder['price'] = $listing ? $listing['price'] : 0;
        $enrichedOrder['escrow_status'] = 'funds_held';
        $enrichedOrder['payment_method'] = 'escrow';
        $enrichedOrder['escrow_id'] = 'escrow_' . $order['id'];
        
        $enrichedOrders[] = $enrichedOrder;
    }
    
    // Sort by creation date (newest first)
    usort($enrichedOrders, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    echo json_encode([
        'success' => true,
        'orders' => $enrichedOrders,
        'total' => count($enrichedOrders),
        'message' => 'Buyer orders loaded successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'orders' => []
    ]);
}
?>