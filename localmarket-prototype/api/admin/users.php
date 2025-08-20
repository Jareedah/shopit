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
    
    // Load users
    $usersData = $dataManager->readData('users.json');
    $users = $usersData['data'] ?? [];
    
    // Load listings to count per user
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    // Add listing counts to users
    foreach ($users as &$user) {
        $userListings = array_filter($listings, function($listing) use ($user) {
            return $listing['sellerId'] === $user['id'];
        });
        $user['listingsCount'] = count($userListings);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $users,
        'total' => count($users),
        'message' => 'Users retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Admin users error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>