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
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('Listing ID is required');
    }
    
    $listingId = $input['id'];
    
    // Load listings
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    // Find the listing
    $listing = null;
    foreach ($listings as $l) {
        if ($l['id'] === $listingId) {
            $listing = $l;
            break;
        }
    }
    
    if (!$listing) {
        throw new Exception('Listing not found');
    }
    
    // Increment view count
    $listing['views'] = ($listing['views'] ?? 0) + 1;
    
    // Update the listing in the array
    foreach ($listings as &$l) {
        if ($l['id'] === $listingId) {
            $l = $listing;
            break;
        }
    }
    
    // Save updated listings
    $listingsData['data'] = $listings;
    $listingsData['metadata']['last_updated'] = date('c');
    $dataManager->writeData('listings.json', $listingsData);
    
    $logger->log("Listing viewed: {$listingId}");
    
    echo json_encode([
        'success' => true,
        'listing' => $listing,
        'message' => 'Listing retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Get listing failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>