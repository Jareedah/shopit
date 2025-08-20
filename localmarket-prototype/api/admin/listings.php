<?php
require_once '../core/DataManager.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');

$dataManager = new DataManager();
$logger = new Logger();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Check admin privileges
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        throw new Exception('Admin access required');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $statusFilter = $input['status'] ?? 'all';
    
    // Load listings
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    // Load users to get seller usernames
    $usersData = $dataManager->readData('users.json');
    $users = $usersData['data'] ?? [];
    
    // Create user lookup
    $userLookup = [];
    foreach ($users as $user) {
        $userLookup[$user['id']] = $user['username'];
    }
    
    // Filter listings by status
    if ($statusFilter !== 'all') {
        $listings = array_filter($listings, function($listing) use ($statusFilter) {
            return $listing['status'] === $statusFilter;
        });
    }
    
    // Add seller username to each listing
    foreach ($listings as &$listing) {
        $listing['sellerUsername'] = $userLookup[$listing['sellerId']] ?? 'Unknown';
    }
    
    // Sort by creation date (newest first)
    usort($listings, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    echo json_encode([
        'success' => true,
        'data' => array_values($listings),
        'total' => count($listings),
        'message' => 'Listings retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Admin listings error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>