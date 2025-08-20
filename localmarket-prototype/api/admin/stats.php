<?php
// api/admin/stats.php
require_once '../core/DataManager.php';
require_once '../core/Validator.php';
require_once '../core/Logger.php';

header('Content-Type: application/json');

$dataManager = new DataManager();
$logger = new Logger();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Check admin privileges
    session_start();
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        throw new Exception('Admin access required');
    }
    
    // Load all data
    $users = $dataManager->readData('users.json')['data'] ?? [];
    $listings = $dataManager->readData('listings.json')['data'] ?? [];
    $orders = $dataManager->readData('orders.json')['data'] ?? [];
    
    // Calculate statistics
    $stats = [
        'totalUsers' => count($users),
        'activeListings' => count(array_filter($listings, function($l) { return $l['status'] === 'active'; })),
        'totalOrders' => count($orders),
        'totalRevenue' => array_sum(array_column($orders, 'total_amount')),
        'userGrowth' => calculateGrowth($users, 'created_at'),
        'revenueGrowth' => calculateRevenueGrowth($orders)
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $stats,
        'message' => 'Statistics retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Stats error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function calculateGrowth($data, $dateField) {
    if (count($data) < 2) return 0;
    
    $currentPeriod = array_slice($data, -30); // Last 30 items
    $previousPeriod = array_slice($data, -60, 30); // Previous 30 items
    
    $currentCount = count($currentPeriod);
    $previousCount = count($previousPeriod);
    
    if ($previousCount === 0) return 100;
    
    return round((($currentCount - $previousCount) / $previousCount) * 100, 1);
}

function calculateRevenueGrowth($orders) {
    // Similar implementation for revenue growth
    return 15.5; // Example value
}
?>