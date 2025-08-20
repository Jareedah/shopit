<?php
require_once '../core/DataManager.php';
require_once '../core/Validator.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');

$logger = new Logger();
$dataManager = new DataManager();
$validator = new Validator();

// Create uploads directory if it doesn't exist
$uploadDir = __DIR__ . '/../../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

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
        $imagePaths = processImages($_FILES['images']);
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

// Process uploaded images
function processImages($images) {
    global $uploadDir;
    $uploadedPaths = [];
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    for ($i = 0; $i < count($images['name']); $i++) {
        // Check for errors
        if ($images['error'][$i] !== UPLOAD_ERR_OK) {
            throw new Exception('File upload error: ' . $images['error'][$i]);
        }
        
        // Validate file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $images['tmp_name'][$i]);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            throw new Exception('Invalid file type: ' . $images['name'][$i]);
        }
        
        // Validate file size
        if ($images['size'][$i] > $maxSize) {
            throw new Exception('File too large: ' . $images['name'][$i]);
        }
        
        // Generate unique filename
        $extension = pathinfo($images['name'][$i], PATHINFO_EXTENSION);
        $filename = uniqid('img_') . '.' . $extension;
        $destination = $uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($images['tmp_name'][$i], $destination)) {
            throw new Exception('Failed to move uploaded file: ' . $images['name'][$i]);
        }
        
        $uploadedPaths[] = $filename;
    }
    
    return $uploadedPaths;
}
?>