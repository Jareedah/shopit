<?php
// API endpoint to update stock in global listings.json
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
    $dataManager = new DataManager();
    $logger = new Logger();
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid input data');
    }
    
    $listingId = $input['listingId'] ?? null;
    $quantityPurchased = $input['quantityPurchased'] ?? 0;
    
    if (!$listingId || $quantityPurchased <= 0) {
        throw new Exception('Invalid listing ID or quantity');
    }
    
    // Load current listings
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    $updated = false;
    foreach ($listings as &$listing) {
        if ($listing['id'] === $listingId) {
            $currentStock = $listing['stock'] ?? 0;
            $newStock = max(0, $currentStock - $quantityPurchased);
            
            $listing['stock'] = $newStock;
            $listing['updated_at'] = date('c');
            
            // Mark as sold out if stock reaches 0
            if ($newStock <= 0) {
                $listing['status'] = 'sold_out';
            }
            
            $updated = true;
            $logger->log("Stock updated for listing {$listingId}: {$currentStock} → {$newStock}");
            break;
        }
    }
    
    if (!$updated) {
        throw new Exception('Listing not found');
    }
    
    // Save updated listings
    $listingsData['data'] = $listings;
    $listingsData['metadata']['last_updated'] = date('c');
    $dataManager->writeData('listings.json', $listingsData);
    
    echo json_encode([
        'success' => true,
        'message' => 'Stock updated successfully',
        'listingId' => $listingId,
        'newStock' => $newStock
    ]);
    
} catch (Exception $e) {
    $logger->log("Stock update failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>