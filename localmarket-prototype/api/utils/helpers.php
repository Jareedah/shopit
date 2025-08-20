<?php
/**
 * Helper Functions
 * Common utility functions used across the application
 */

/**
 * Generate a unique ID with prefix
 * @param string $prefix The prefix for the ID
 * @return string Unique ID
 */
function generateId($prefix = 'id') {
    return $prefix . '_' . uniqid() . '_' . mt_rand(1000, 9999);
}

/**
 * Sanitize HTML output
 * @param string $text The text to sanitize
 * @return string Sanitized text
 */
function sanitizeOutput($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

/**
 * Format currency amount
 * @param float $amount The amount to format
 * @param string $currency The currency code
 * @return string Formatted currency
 */
function formatCurrency($amount, $currency = 'USD') {
    return '$' . number_format($amount, 2);
}

/**
 * Format date for display
 * @param string $date The date string
 * @param string $format The format string
 * @return string Formatted date
 */
function formatDate($date, $format = 'M j, Y') {
    return date($format, strtotime($date));
}

/**
 * Format date and time for display
 * @param string $date The date string
 * @param string $format The format string
 * @return string Formatted date and time
 */
function formatDateTime($date, $format = 'M j, Y g:i A') {
    return date($format, strtotime($date));
}

/**
 * Get relative time (e.g., "2 hours ago")
 * @param string $date The date string
 * @return string Relative time
 */
function getRelativeTime($date) {
    $time = time() - strtotime($date);
    
    if ($time < 60) return 'just now';
    if ($time < 3600) return floor($time / 60) . ' minutes ago';
    if ($time < 86400) return floor($time / 3600) . ' hours ago';
    if ($time < 2592000) return floor($time / 86400) . ' days ago';
    if ($time < 31536000) return floor($time / 2592000) . ' months ago';
    
    return floor($time / 31536000) . ' years ago';
}

/**
 * Truncate text to specified length
 * @param string $text The text to truncate
 * @param int $length Maximum length
 * @param string $suffix Suffix to add if truncated
 * @return string Truncated text
 */
function truncateText($text, $length = 100, $suffix = '...') {
    if (strlen($text) <= $length) {
        return $text;
    }
    
    return substr($text, 0, $length) . $suffix;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param float $lat1 First latitude
 * @param float $lon1 First longitude
 * @param float $lat2 Second latitude
 * @param float $lon2 Second longitude
 * @return float Distance in kilometers
 */
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371; // km
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    
    return $earthRadius * $c;
}

/**
 * Validate and sanitize image upload
 * @param array $file The $_FILES array element
 * @param string $uploadDir The upload directory
 * @return string|false The uploaded filename or false on failure
 */
function handleImageUpload($file, $uploadDir) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return false;
    }
    
    // Validate file size
    if ($file['size'] > $maxSize) {
        return false;
    }
    
    // Validate file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        return false;
    }
    
    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_') . '.' . strtolower($extension);
    $destination = $uploadDir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return $filename;
    }
    
    return false;
}

/**
 * Get file size in human readable format
 * @param int $bytes File size in bytes
 * @param int $precision Number of decimal places
 * @return string Formatted file size
 */
function formatFileSize($bytes, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    
    for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
        $bytes /= 1024;
    }
    
    return round($bytes, $precision) . ' ' . $units[$i];
}

/**
 * Check if user agent is mobile
 * @return bool True if mobile device
 */
function isMobile() {
    return preg_match("/(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}

/**
 * Get client IP address
 * @return string Client IP address
 */
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Generate CSRF token
 * @return string CSRF token
 */
function generateCSRFToken() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    
    return $_SESSION['csrf_token'];
}

/**
 * Validate CSRF token
 * @param string $token The token to validate
 * @return bool True if valid
 */
function validateCSRFToken($token) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Create thumbnail from image
 * @param string $source Source image path
 * @param string $destination Destination path
 * @param int $width Thumbnail width
 * @param int $height Thumbnail height
 * @return bool True on success
 */
function createThumbnail($source, $destination, $width = 150, $height = 150) {
    $imageInfo = getimagesize($source);
    if (!$imageInfo) {
        return false;
    }
    
    $sourceWidth = $imageInfo[0];
    $sourceHeight = $imageInfo[1];
    $mimeType = $imageInfo['mime'];
    
    // Create source image resource
    switch ($mimeType) {
        case 'image/jpeg':
            $sourceImage = imagecreatefromjpeg($source);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($source);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($source);
            break;
        default:
            return false;
    }
    
    if (!$sourceImage) {
        return false;
    }
    
    // Calculate dimensions
    $aspectRatio = $sourceWidth / $sourceHeight;
    
    if ($aspectRatio > 1) {
        $newWidth = $width;
        $newHeight = $width / $aspectRatio;
    } else {
        $newHeight = $height;
        $newWidth = $height * $aspectRatio;
    }
    
    // Create thumbnail
    $thumbnail = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preserve transparency for PNG and GIF
    if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
        imagealphablending($thumbnail, false);
        imagesavealpha($thumbnail, true);
        $transparent = imagecolorallocatealpha($thumbnail, 255, 255, 255, 127);
        imagefilledrectangle($thumbnail, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // Resize image
    imagecopyresampled($thumbnail, $sourceImage, 0, 0, 0, 0, $newWidth, $newHeight, $sourceWidth, $sourceHeight);
    
    // Save thumbnail
    $result = false;
    switch ($mimeType) {
        case 'image/jpeg':
            $result = imagejpeg($thumbnail, $destination, 85);
            break;
        case 'image/png':
            $result = imagepng($thumbnail, $destination, 8);
            break;
        case 'image/gif':
            $result = imagegif($thumbnail, $destination);
            break;
    }
    
    // Clean up
    imagedestroy($sourceImage);
    imagedestroy($thumbnail);
    
    return $result;
}

/**
 * Send JSON response
 * @param array $data Response data
 * @param int $httpCode HTTP status code
 */
function sendJsonResponse($data, $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Log API request
 * @param string $endpoint The endpoint called
 * @param array $data Request data
 * @param string $method HTTP method
 */
function logApiRequest($endpoint, $data = [], $method = 'POST') {
    $logger = new Logger();
    $logger->logActivity('api_request', $_SESSION['user']['id'] ?? null, [
        'endpoint' => $endpoint,
        'method' => $method,
        'data_size' => strlen(json_encode($data)),
        'ip' => getClientIP(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);
}

/**
 * Validate required fields
 * @param array $data Input data
 * @param array $required Required field names
 * @return array Array of missing fields
 */
function validateRequiredFields($data, $required) {
    $missing = [];
    
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $missing[] = $field;
        }
    }
    
    return $missing;
}

/**
 * Clean filename for safe storage
 * @param string $filename Original filename
 * @return string Cleaned filename
 */
function cleanFilename($filename) {
    // Remove special characters and spaces
    $clean = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename);
    
    // Remove multiple underscores
    $clean = preg_replace('/_+/', '_', $clean);
    
    // Trim underscores from ends
    return trim($clean, '_');
}

/**
 * Check if request is AJAX
 * @return bool True if AJAX request
 */
function isAjaxRequest() {
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Get pagination info
 * @param int $total Total items
 * @param int $page Current page
 * @param int $limit Items per page
 * @return array Pagination info
 */
function getPaginationInfo($total, $page, $limit) {
    $totalPages = ceil($total / $limit);
    $offset = ($page - 1) * $limit;
    
    return [
        'total' => $total,
        'page' => $page,
        'limit' => $limit,
        'totalPages' => $totalPages,
        'offset' => $offset,
        'hasNext' => $page < $totalPages,
        'hasPrev' => $page > 1
    ];
}

/**
 * Sort array by multiple criteria
 * @param array $array Array to sort
 * @param array $criteria Sort criteria
 * @return array Sorted array
 */
function multiSort($array, $criteria) {
    usort($array, function($a, $b) use ($criteria) {
        foreach ($criteria as $field => $direction) {
            $direction = strtoupper($direction);
            
            if ($a[$field] == $b[$field]) {
                continue;
            }
            
            if ($direction === 'DESC') {
                return $a[$field] < $b[$field] ? 1 : -1;
            } else {
                return $a[$field] > $b[$field] ? 1 : -1;
            }
        }
        return 0;
    });
    
    return $array;
}

/**
 * Filter array by multiple criteria
 * @param array $array Array to filter
 * @param array $filters Filter criteria
 * @return array Filtered array
 */
function multiFilter($array, $filters) {
    return array_filter($array, function($item) use ($filters) {
        foreach ($filters as $field => $value) {
            if (isset($item[$field])) {
                if (is_array($value)) {
                    if (!in_array($item[$field], $value)) {
                        return false;
                    }
                } else {
                    if ($item[$field] != $value) {
                        return false;
                    }
                }
            }
        }
        return true;
    });
}

/**
 * Search array by text
 * @param array $array Array to search
 * @param string $query Search query
 * @param array $fields Fields to search in
 * @return array Filtered array
 */
function textSearch($array, $query, $fields) {
    if (empty($query)) {
        return $array;
    }
    
    $searchTerms = explode(' ', strtolower(trim($query)));
    
    return array_filter($array, function($item) use ($searchTerms, $fields) {
        $searchText = '';
        
        foreach ($fields as $field) {
            if (isset($item[$field])) {
                if (is_array($item[$field])) {
                    $searchText .= ' ' . implode(' ', $item[$field]);
                } else {
                    $searchText .= ' ' . $item[$field];
                }
            }
        }
        
        $searchText = strtolower($searchText);
        
        foreach ($searchTerms as $term) {
            if (strpos($searchText, $term) === false) {
                return false;
            }
        }
        
        return true;
    });
}

/**
 * Generate slug from text
 * @param string $text Text to convert
 * @return string URL-friendly slug
 */
function generateSlug($text) {
    $slug = strtolower($text);
    $slug = preg_replace('/[^a-z0-9\s-]/', '', $slug);
    $slug = preg_replace('/[\s-]+/', '-', $slug);
    return trim($slug, '-');
}

/**
 * Check if value is empty (but allow 0)
 * @param mixed $value Value to check
 * @return bool True if empty
 */
function isEmpty($value) {
    return $value === null || $value === '' || $value === [];
}

/**
 * Get array value with default
 * @param array $array Source array
 * @param string $key Array key
 * @param mixed $default Default value
 * @return mixed Array value or default
 */
function arrayGet($array, $key, $default = null) {
    return isset($array[$key]) ? $array[$key] : $default;
}

/**
 * Set nested array value using dot notation
 * @param array $array Target array
 * @param string $key Dot notation key
 * @param mixed $value Value to set
 */
function arraySet(&$array, $key, $value) {
    $keys = explode('.', $key);
    $current = &$array;
    
    foreach ($keys as $k) {
        if (!isset($current[$k]) || !is_array($current[$k])) {
            $current[$k] = [];
        }
        $current = &$current[$k];
    }
    
    $current = $value;
}

/**
 * Get nested array value using dot notation
 * @param array $array Source array
 * @param string $key Dot notation key
 * @param mixed $default Default value
 * @return mixed Array value or default
 */
function arrayDotGet($array, $key, $default = null) {
    $keys = explode('.', $key);
    $current = $array;
    
    foreach ($keys as $k) {
        if (!isset($current[$k])) {
            return $default;
        }
        $current = $current[$k];
    }
    
    return $current;
}

/**
 * Validate JSON string
 * @param string $json JSON string to validate
 * @return bool True if valid JSON
 */
function isValidJson($json) {
    json_decode($json);
    return json_last_error() === JSON_ERROR_NONE;
}

/**
 * Generate random password
 * @param int $length Password length
 * @return string Random password
 */
function generateRandomPassword($length = 12) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    return substr(str_shuffle($chars), 0, $length);
}

/**
 * Check if string contains only allowed characters
 * @param string $string String to check
 * @param string $pattern Regex pattern
 * @return bool True if valid
 */
function isValidString($string, $pattern = '/^[a-zA-Z0-9\s\-_\.]+$/') {
    return preg_match($pattern, $string);
}