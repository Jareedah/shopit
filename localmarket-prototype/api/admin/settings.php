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
    
    // Load current configuration
    $configData = $dataManager->readData('config.json');
    $settings = $configData['settings'] ?? [];
    
    echo json_encode([
        'success' => true,
        'data' => $settings,
        'message' => 'Settings retrieved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Settings error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>