<?php
// Update listing API endpoint
require_once '../core/DataManager.php';
require_once '../core/Auth.php';
require_once '../core/Validator.php';
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
    $validator = new Validator();
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
        $newImages = processImages($_FILES['images']);
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

// Process uploaded images (same as create.php)
function processImages($images) {
    $uploadDir = __DIR__ . '/../../uploads/';
    $uploadedPaths = [];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    for ($i = 0; $i < count($images['name']); $i++) {
        if ($images['error'][$i] !== UPLOAD_ERR_OK) {
            continue; // Skip files with errors
        }
        
        // Validate file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $images['tmp_name'][$i]);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            continue; // Skip invalid file types
        }
        
        // Validate file size
        if ($images['size'][$i] > $maxSize) {
            continue; // Skip files too large
        }
        
        // Generate unique filename
        $extension = pathinfo($images['name'][$i], PATHINFO_EXTENSION);
        $filename = uniqid('img_') . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($images['tmp_name'][$i], $filepath)) {
            $uploadedPaths[] = $filename;
        }
    }
    
    return $uploadedPaths;
}
?>