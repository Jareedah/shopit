<?php
// API endpoint to get seller orders from global orders.json
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
    $sellerId = $currentUser['id'];
    
    $dataManager = new DataManager();
    
    // Get all orders from global orders.json
    $ordersData = $dataManager->readData('orders.json');
    $allOrders = $ordersData['data'] ?? [];
    
    // Filter orders for this seller
    $sellerOrders = array_filter($allOrders, function($order) use ($sellerId) {
        return $order['sellerId'] === $sellerId;
    });
    
    // Get listings data to enrich order information
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    $listingsMap = [];
    foreach ($listings as $listing) {
        $listingsMap[$listing['id']] = $listing;
    }
    
    // Get users data to enrich buyer information
    $usersData = $dataManager->readData('users.json');
    $users = $usersData['data'] ?? [];
    $usersMap = [];
    foreach ($users as $user) {
        $usersMap[$user['id']] = $user;
    }
    
    // Enrich seller orders with additional information
    $enrichedOrders = [];
    foreach ($sellerOrders as $order) {
        $listing = $listingsMap[$order['listingId']] ?? null;
        $buyer = $usersMap[$order['buyerId']] ?? null;
        
        $enrichedOrder = $order;
        $enrichedOrder['listingTitle'] = $listing ? $listing['title'] : 'Unknown Item';
        $enrichedOrder['buyerName'] = $buyer ? $buyer['username'] : 'Unknown Buyer';
        $enrichedOrder['buyerEmail'] = $buyer ? ($buyer['email'] ?? $buyer['username'] . '@example.com') : 'unknown@example.com';
        $enrichedOrder['price'] = $listing ? $listing['price'] : 0;
        $enrichedOrder['seller_amount'] = ($listing ? $listing['price'] : 0) * $order['quantity'];
        $enrichedOrder['platform_fee'] = $order['total_amount'] - $enrichedOrder['seller_amount'];
        $enrichedOrder['escrow_status'] = 'funds_held';
        $enrichedOrder['payment_method'] = 'escrow';
        $enrichedOrder['buyer_message'] = 'Thank you for your item! Looking forward to receiving it.';
        $enrichedOrder['isNewOrder'] = true; // Mark as new for notification
        
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
        'message' => 'Seller orders loaded successfully'
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