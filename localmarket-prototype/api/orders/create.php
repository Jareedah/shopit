<?php
require_once '../core/DataManager.php';
require_once '../core/Validator.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');

$logger = new Logger();
$dataManager = new DataManager();
$validator = new Validator();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Check if user is logged in
    if (!isset($_SESSION['user'])) {
        throw new Exception('Authentication required');
    }
    
    $buyerId = $_SESSION['user']['id'];
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid input data');
    }
    
    // Validate required fields
    $requiredFields = ['listingId', 'sellerId', 'quantity', 'total_amount'];
    foreach ($requiredFields as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Load listings to verify availability
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    $listing = null;
    foreach ($listings as $l) {
        if ($l['id'] === $input['listingId']) {
            $listing = $l;
            break;
        }
    }
    
    if (!$listing) {
        throw new Exception('Listing not found');
    }
    
    if ($listing['status'] !== 'active') {
        throw new Exception('Listing is not available for purchase');
    }
    
    // Check if listing is a product with limited stock
    if (isset($listing['availability']['type']) && $listing['availability']['type'] === 'product' && isset($listing['availability']['stock'])) {
        if ($listing['availability']['stock'] < $input['quantity']) {
            throw new Exception('Insufficient stock available');
        }
    }
    
    // Create order
    $order = [
        'id' => uniqid('order_'),
        'buyerId' => $buyerId,
        'sellerId' => $input['sellerId'],
        'listingId' => $input['listingId'],
        'quantity' => $input['quantity'],
        'total_amount' => $input['total_amount'],
        'status' => 'confirmed',
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    // Save order
    $ordersData = $dataManager->readData('orders.json');
    $orders = $ordersData['data'] ?? [];
    $orders[] = $order;
    
    $ordersData['data'] = $orders;
    $ordersData['metadata'] = [
        'last_updated' => date('c'),
        'total_orders' => count($orders)
    ];
    
    $dataManager->writeData('orders.json', $ordersData);
    
    // Update listing stock if applicable
    if (isset($listing['availability']['type']) && $listing['availability']['type'] === 'product' && isset($listing['availability']['stock'])) {
        updateListingStock($listing['id'], $input['quantity']);
    }
    
    $logger->log("Order created: {$order['id']} by user {$buyerId}");
    
    echo json_encode([
        'success' => true,
        'order' => $order,
        'message' => 'Order created successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Order creation failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Update listing stock
function updateListingStock($listingId, $quantity) {
    $dataManager = new DataManager();
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    foreach ($listings as &$listing) {
        if ($listing['id'] === $listingId) {
            if (!isset($listing['availability'])) {
                $listing['availability'] = ['type' => 'product', 'stock' => 1];
            }
            
            $listing['availability']['stock'] -= $quantity;
            
            // Mark as sold out if stock reaches 0
            if ($listing['availability']['stock'] <= 0) {
                $listing['status'] = 'sold';
            }
            break;
        }
    }
    
    $listingsData['data'] = $listings;
    $dataManager->writeData('listings.json', $listingsData);
}
?>