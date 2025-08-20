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
    $range = $input['range'] ?? 30;
    
    // Load all data
    $users = $dataManager->readData('users.json')['data'] ?? [];
    $listings = $dataManager->readData('listings.json')['data'] ?? [];
    $orders = $dataManager->readData('orders.json')['data'] ?? [];
    
    // Calculate date range
    $cutoffDate = new DateTime();
    $cutoffDate->sub(new DateInterval("P{$range}D"));
    
    // Filter data by date range
    $recentUsers = array_filter($users, function($user) use ($cutoffDate) {
        return new DateTime($user['created_at']) >= $cutoffDate;
    });
    
    $recentListings = array_filter($listings, function($listing) use ($cutoffDate) {
        return new DateTime($listing['created_at']) >= $cutoffDate;
    });
    
    $recentOrders = array_filter($orders, function($order) use ($cutoffDate) {
        return new DateTime($order['created_at']) >= $cutoffDate;
    });
    
    // Generate analytics data
    $analyticsData = [
        'registrations' => generateTimeSeriesData($recentUsers, 'created_at', $range),
        'listings' => generateTimeSeriesData($recentListings, 'created_at', $range),
        'transactions' => generateTimeSeriesData($recentOrders, 'created_at', $range),
        'categories' => generateCategoryData($listings)
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $analyticsData,
        'message' => 'Analytics data retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Analytics error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function generateTimeSeriesData($data, $dateField, $days) {
    $series = [];
    $today = new DateTime();
    
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = clone $today;
        $date->sub(new DateInterval("P{$i}D"));
        $dateStr = $date->format('Y-m-d');
        
        $count = 0;
        foreach ($data as $item) {
            $itemDate = new DateTime($item[$dateField]);
            if ($itemDate->format('Y-m-d') === $dateStr) {
                $count++;
            }
        }
        
        $series[] = [
            'label' => $date->format('M j'),
            'value' => $count
        ];
    }
    
    return $series;
}

function generateCategoryData($listings) {
    $categories = [];
    $total = count($listings);
    
    if ($total === 0) {
        return [];
    }
    
    // Count by category
    $categoryCounts = [];
    foreach ($listings as $listing) {
        $category = $listing['category'] ?? 'other';
        $categoryCounts[$category] = ($categoryCounts[$category] ?? 0) + 1;
    }
    
    // Convert to percentage
    foreach ($categoryCounts as $category => $count) {
        $categories[] = [
            'label' => ucfirst($category),
            'value' => $count,
            'percentage' => round(($count / $total) * 100, 1)
        ];
    }
    
    // Sort by count (descending)
    usort($categories, function($a, $b) {
        return $b['value'] - $a['value'];
    });
    
    return $categories;
}
?>