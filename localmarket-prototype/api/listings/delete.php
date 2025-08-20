<?php
// Delete listing API endpoint
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
    
    $listingId = $input['listingId'] ?? null;
    $sellerId = $input['sellerId'] ?? null;
    
    if (!$listingId || $sellerId !== $currentUser['id']) {
        throw new Exception('Invalid listing ID or unauthorized access');
    }
    
    // Load current listings
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    // Find and verify ownership
    $listingIndex = -1;
    $listingToDelete = null;
    
    foreach ($listings as $index => $listing) {
        if ($listing['id'] === $listingId) {
            if ($listing['sellerId'] !== $currentUser['id']) {
                throw new Exception('You can only delete your own listings');
            }
            $listingIndex = $index;
            $listingToDelete = $listing;
            break;
        }
    }
    
    if ($listingIndex === -1) {
        throw new Exception('Listing not found');
    }
    
    // Check for pending orders and handle them
    $ordersData = $dataManager->readData('orders.json');
    $allOrders = $ordersData['data'] ?? [];
    
    $affectedOrders = [];
    $updatedOrders = [];
    
    foreach ($allOrders as $order) {
        if ($order['listingId'] === $listingId && 
            in_array($order['status'], ['pending', 'confirmed', 'processing', 'shipped'])) {
            
            // Mark order as cancelled due to listing deletion
            $order['status'] = 'cancelled';
            $order['cancellation_reason'] = 'Listing deleted by seller';
            $order['cancelled_at'] = date('c');
            
            $affectedOrders[] = $order;
        }
        $updatedOrders[] = $order;
    }
    
    // Save updated orders if any were affected
    if (count($affectedOrders) > 0) {
        $ordersData['data'] = $updatedOrders;
        $ordersData['metadata']['last_updated'] = date('c');
        $dataManager->writeData('orders.json', $ordersData);
        
        $logger->log("Cancelled {count($affectedOrders)} orders due to listing deletion: {$listingId}");
    }
    
    // Remove listing from array
    array_splice($listings, $listingIndex, 1);
    
    // Save updated listings
    $listingsData['data'] = $listings;
    $listingsData['metadata'] = [
        'last_updated' => date('c'),
        'total_listings' => count($listings)
    ];
    
    $dataManager->writeData('listings.json', $listingsData);
    
    // Delete associated images
    if (!empty($listingToDelete['images'])) {
        $uploadDir = __DIR__ . '/../../uploads/';
        foreach ($listingToDelete['images'] as $image) {
            $imagePath = $uploadDir . $image;
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
    }
    
    $logger->log("Listing deleted: {$listingId} by user {$currentUser['username']}");
    
    echo json_encode([
        'success' => true,
        'message' => 'Listing deleted successfully',
        'affectedOrders' => count($affectedOrders),
        'deletedImages' => count($listingToDelete['images'] ?? [])
    ]);
    
} catch (Exception $e) {
    $logger->log("Listing deletion failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>