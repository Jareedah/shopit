<?php
// Debug endpoint for testing search functionality
require_once '../core/DataManager.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $dataManager = new DataManager();
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Load listings
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    $debug = [
        'total_listings' => count($listings),
        'input_received' => $input,
        'user_location' => $input['userLocation'] ?? null,
        'radius' => $input['radius'] ?? 10,
        'listings_with_location' => 0,
        'listings_sample' => []
    ];
    
    // Analyze listings for location data
    foreach ($listings as $listing) {
        if (isset($listing['location']) && isset($listing['location']['lat']) && isset($listing['location']['lng'])) {
            $debug['listings_with_location']++;
        }
        
        // Add first 3 listings as samples
        if (count($debug['listings_sample']) < 3) {
            $debug['listings_sample'][] = [
                'id' => $listing['id'],
                'title' => $listing['title'],
                'location' => $listing['location'] ?? 'No location data',
                'has_coordinates' => isset($listing['location']['lat']) && isset($listing['location']['lng'])
            ];
        }
    }
    
    // Test distance calculation if user location provided
    if ($input && isset($input['userLocation']) && $input['userLocation']) {
        $userLat = $input['userLocation']['lat'];
        $userLng = $input['userLocation']['lng'];
        
        $debug['distance_calculations'] = [];
        
        foreach ($listings as $listing) {
            if (isset($listing['location']['lat']) && isset($listing['location']['lng'])) {
                $distance = calculateDistance(
                    $userLat, $userLng,
                    $listing['location']['lat'], $listing['location']['lng']
                );
                
                $debug['distance_calculations'][] = [
                    'listing_title' => $listing['title'],
                    'listing_location' => $listing['location'],
                    'distance_km' => round($distance, 2)
                ];
                
                if (count($debug['distance_calculations']) >= 5) break;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Search debug complete',
        'debug' => $debug
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => $debug ?? []
    ]);
}

// Distance calculation function (same as in search API)
function calculateDistance($lat1, $lng1, $lat2, $lng2) {
    $earthRadius = 6371; // km
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLng/2) * sin($dLng/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    
    return $earthRadius * $c;
}
?>