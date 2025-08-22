<?php
require_once '../core/DataManager.php';
require_once '../core/Validator.php';
require_once '../core/Logger.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$logger = new Logger();
$dataManager = new DataManager();
$validator = new Validator();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }
    
    // Get input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid input data');
    }
    
    // Extract filters
    $query = $input['query'] ?? '';
    $category = $input['category'] ?? '';
    $priceMin = $input['priceMin'] ?? null;
    $priceMax = $input['priceMax'] ?? null;
    $sellerId = $input['sellerId'] ?? null;
    $radius = $input['radius'] ?? 10;
    $sortBy = $input['sortBy'] ?? 'distance';
    $page = $input['page'] ?? 1;
    $limit = $input['limit'] ?? 10;
    $userLocation = $input['userLocation'] ?? null;
    
    // Load listings
    $listingsData = $dataManager->readData('listings.json');
    $listings = $listingsData['data'] ?? [];
    
    // Listings loaded successfully
    
    // Filter active listings only
    $listings = array_filter($listings, function($listing) {
        return $listing['status'] === 'active';
    });
    
    // Apply filters
    $filteredListings = array_filter($listings, function($listing) use ($query, $category, $priceMin, $priceMax, $radius, $userLocation, $sellerId) {
        // Text search
        if ($query && !matchesQuery($listing, $query)) {
            return false;
        }
        
        // Category filter
        if ($category && $listing['category'] !== $category) {
            return false;
        }
        
        // Price filter
        if ($priceMin !== null && $listing['price'] < $priceMin) {
            return false;
        }
        
        if ($priceMax !== null && $listing['price'] > $priceMax) {
            return false;
        }
        
        // Seller filter (for dashboard listings)
        if ($sellerId && $listing['sellerId'] !== $sellerId) {
            return false;
        }
        
        // Location filter
        if ($userLocation && $radius > 0 && isset($listing['location'])) {
            $distance = calculateDistance(
                $userLocation['lat'], $userLocation['lng'],
                $listing['location']['lat'] ?? 0,
                $listing['location']['lng'] ?? 0
            );
            
            $listing['distance'] = $distance;
            
            if ($distance > $radius) {
                return false;
            }
        }
        
        return true;
    });
    
    // Sort results
    $filteredListings = sortListings($filteredListings, $sortBy);
    
    // Pagination
    $totalItems = count($filteredListings);
    $totalPages = ceil($totalItems / $limit);
    $offset = ($page - 1) * $limit;
    $paginatedResults = array_slice($filteredListings, $offset, $limit);
    
    $logger->log("Search performed: {$totalItems} results found");
    
    echo json_encode([
        'success' => true,
        'data' => array_values($paginatedResults),
        'total' => $totalItems,
        'page' => $page,
        'totalPages' => $totalPages,
        'message' => 'Search completed successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Search error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

// Check if listing matches search query
function matchesQuery($listing, $query) {
    $searchTerms = explode(' ', strtolower($query));
    $listingText = strtolower($listing['title'] . ' ' . $listing['description'] . ' ' . implode(' ', $listing['tags'] ?? []));
    
    foreach ($searchTerms as $term) {
        if (strpos($listingText, $term) === false) {
            return false;
        }
    }
    
    return true;
}

// Calculate distance between two points (Haversine formula)
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

// Sort listings based on criteria
function sortListings($listings, $sortBy) {
    switch ($sortBy) {
        case 'price_low':
            usort($listings, function($a, $b) {
                return $a['price'] <=> $b['price'];
            });
            break;
            
        case 'price_high':
            usort($listings, function($a, $b) {
                return $b['price'] <=> $a['price'];
            });
            break;
            
        case 'newest':
            usort($listings, function($a, $b) {
                return strtotime($b['created_at']) <=> strtotime($a['created_at']);
            });
            break;
            
        case 'distance':
        default:
            usort($listings, function($a, $b) {
                return ($a['distance'] ?? PHP_INT_MAX) <=> ($b['distance'] ?? PHP_INT_MAX);
            });
            break;
    }
    
    return $listings;
}
?>