<?php
// Simple test endpoint to verify PHP is working
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    echo json_encode([
        'success' => true,
        'message' => 'PHP is working correctly',
        'timestamp' => date('c'),
        'method' => $_SERVER['REQUEST_METHOD'],
        'data_dir_exists' => is_dir(__DIR__ . '/../../data/'),
        'users_file_exists' => file_exists(__DIR__ . '/../../data/users.json')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>