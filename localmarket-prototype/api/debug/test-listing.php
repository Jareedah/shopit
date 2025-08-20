<?php
// Debug endpoint for testing listing creation
require_once '../core/DataManager.php';
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
    $debug = [
        'method' => $_SERVER['REQUEST_METHOD'],
        'session_user' => isset($_SESSION['user']) ? $_SESSION['user']['username'] : 'Not logged in',
        'post_data' => $_POST,
        'files_data' => $_FILES,
        'raw_input' => file_get_contents('php://input'),
        'uploads_dir_exists' => is_dir(__DIR__ . '/../../uploads/'),
        'uploads_dir_writable' => is_writable(__DIR__ . '/../../uploads/'),
        'listings_file_exists' => file_exists(__DIR__ . '/../../data/listings.json'),
        'data_dir_writable' => is_writable(__DIR__ . '/../../data/')
    ];
    
    // Test basic listing creation without complex validation
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $listingData = null;
        
        // Try to get listing data from different sources
        if (isset($_POST['listingData'])) {
            $listingData = json_decode($_POST['listingData'], true);
            $debug['listing_data_source'] = 'POST';
        } else {
            $input = json_decode(file_get_contents('php://input'), true);
            if ($input) {
                $listingData = $input;
                $debug['listing_data_source'] = 'raw_input';
            }
        }
        
        $debug['parsed_listing_data'] = $listingData;
        
        if ($listingData) {
            // Test basic validation
            $required = ['title', 'description', 'category', 'price'];
            $missing = [];
            foreach ($required as $field) {
                if (empty($listingData[$field])) {
                    $missing[] = $field;
                }
            }
            $debug['missing_fields'] = $missing;
            $debug['validation_passed'] = empty($missing);
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Listing creation debug info',
        'debug' => $debug
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => $debug ?? []
    ]);
}
?>