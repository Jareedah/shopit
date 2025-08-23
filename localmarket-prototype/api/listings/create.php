<?php
require_once '../core/DataManager.php';
require_once '../core/Validator.php';
require_once '../core/Logger.php';
require_once '../core/UploadHelper.php';

session_start();
header('Content-Type: application/json');

$logger = new Logger();
$dataManager = new DataManager();
$validator = new Validator();
$uploadHelper = new UploadHelper();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Check if user is logged in
    if (!isset($_SESSION['user'])) {
        throw new Exception('Authentication required');
    }
    
    // Get listing data from form
    $listingData = json_decode($_POST['listingData'], true);
    
    // Validate listing data
    if (!$validator->validateListing($listingData)) {
        throw new Exception('Invalid listing data: ' . implode(', ', $validator->getErrors()));
    }
    
    // Process uploaded images
    $imagePaths = [];
    if (!empty($_FILES['images'])) {
        $imagePaths = $uploadHelper->processImages($_FILES['images']);
    }
    
    // Add image paths to listing data
    $listingData['images'] = $imagePaths;
    
    // Add metadata to match default listing structure
    $listingData['id'] = uniqid('listing_');
    $listingData['created_at'] = date('c');
    $listingData['updated_at'] = date('c');
    $listingData['status'] = 'active';
    $listingData['views'] = 0;
    
    // Save to listings.json
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    $listings[] = $listingData;
    
    $listingsData['data'] = $listings;
    $listingsData['metadata'] = [
        'last_updated' => date('c'),
        'total_listings' => count($listings)
    ];
    
    $dataManager->writeData('listings.json', $listingsData);
    
    $logger->log("New listing created: {$listingData['id']} by user {$_SESSION['user']['username']}");
    
    echo json_encode([
        'success' => true,
        'listingId' => $listingData['id'],
        'message' => 'Listing created successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Listing creation failed: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

?>