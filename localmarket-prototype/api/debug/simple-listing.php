<?php
// Simplified listing creation for debugging
require_once '../core/DataManager.php';

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Check if user is logged in
    if (!isset($_SESSION['user'])) {
        throw new Exception('Authentication required');
    }
    
    $dataManager = new DataManager();
    
    // Get listing data from FormData
    $listingData = null;
    if (isset($_POST['listingData'])) {
        $listingData = json_decode($_POST['listingData'], true);
    } else {
        // Fallback to JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        $listingData = $input;
    }
    
    if (!$listingData) {
        throw new Exception('No listing data received');
    }
    
    // Basic validation
    $required = ['title', 'description', 'category', 'price'];
    foreach ($required as $field) {
        if (empty($listingData[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    // Create simple listing
    $listing = [
        'id' => uniqid('listing_'),
        'title' => $listingData['title'],
        'description' => $listingData['description'],
        'category' => $listingData['category'],
        'price' => (float)$listingData['price'],
        'tags' => $listingData['tags'] ?? [],
        'location' => $listingData['location'] ?? ['address' => 'Unknown', 'lat' => 0, 'lng' => 0],
        'images' => [],
        'sellerId' => $_SESSION['user']['id'],
        'status' => 'active',
        'views' => 0,
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    // Handle image uploads
    if (!empty($_FILES['images'])) {
        $uploadDir = __DIR__ . '/../../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $imageFiles = [];
        for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $filename = uniqid('img_') . '_' . basename($_FILES['images']['name'][$i]);
                $destination = $uploadDir . $filename;
                
                if (move_uploaded_file($_FILES['images']['tmp_name'][$i], $destination)) {
                    $imageFiles[] = $filename;
                }
            }
        }
        $listing['images'] = $imageFiles;
    }
    
    // Save to listings.json
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    $listings[] = $listing;
    
    $listingsData['data'] = $listings;
    $listingsData['metadata'] = [
        'last_updated' => date('c'),
        'total_listings' => count($listings)
    ];
    
    $dataManager->writeData('listings.json', $listingsData);
    
    echo json_encode([
        'success' => true,
        'listing' => $listing,
        'message' => 'Listing created successfully'
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'post_data' => $_POST,
            'files_data' => $_FILES,
            'session_user' => $_SESSION['user']['username'] ?? 'Not logged in'
        ]
    ]);
}
?>