<?php
// Update listing API endpoint
require_once '../core/DataManager.php';
require_once '../core/Auth.php';
require_once '../core/Validator.php';
require_once '../core/Logger.php';
require_once '../core/UploadHelper.php';

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
    $validator = new Validator();
    $uploadHelper = new UploadHelper();
    $logger = new Logger();
    
    // Check authentication
    if (!$auth->isLoggedIn()) {
        throw new Exception('Authentication required');
    }
    
    $currentUser = $auth->getCurrentUser();
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Get listing data from form
    $listingData = json_decode($_POST['listingData'], true);
    
    if (!$listingData) {
        throw new Exception('Invalid listing data');
    }
    
    $listingId = $listingData['id'];
    
    // Load current listings
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    // Find and verify ownership
    $listingIndex = -1;
    $currentListing = null;
    
    foreach ($listings as $index => $listing) {
        if ($listing['id'] === $listingId) {
            if ($listing['sellerId'] !== $currentUser['id']) {
                throw new Exception('You can only edit your own listings');
            }
            $listingIndex = $index;
            $currentListing = $listing;
            break;
        }
    }
    
    if ($listingIndex === -1) {
        throw new Exception('Listing not found');
    }
    
    // Validate updated data
    if (!$validator->validateListing($listingData)) {
        throw new Exception('Validation failed: ' . implode(', ', $validator->getErrors()));
    }
    
    // Process uploaded images if any
    $imagePaths = $currentListing['images'] ?? [];
    if (!empty($_FILES['images'])) {
        $newImages = $uploadHelper->processImages($_FILES['images'], false); // Non-strict mode for updates
        $imagePaths = array_merge($imagePaths, $newImages);
    }
    
    // Update listing data
    $updatedListing = array_merge($currentListing, $listingData);
    $updatedListing['images'] = $imagePaths;
    $updatedListing['updated_at'] = date('c');
    
    // Update in array
    $listings[$listingIndex] = $updatedListing;
    
    // Save updated listings
    $listingsData['data'] = $listings;
    $listingsData['metadata']['last_updated'] = date('c');
    $dataManager->writeData('listings.json', $listingsData);
    
    $logger->log("Listing updated: {$listingId} by user {$currentUser['username']}");
    
    echo json_encode([
        'success' => true,
        'listingId' => $listingId,
        'message' => 'Listing updated successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Listing update failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}


?>