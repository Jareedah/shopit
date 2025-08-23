<?php
require_once '../core/DataManager.php';
require_once '../core/Logger.php';

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataManager = new DataManager();
$logger = new Logger();

try {
    // Check admin privileges
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        throw new Exception('Admin access required');
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch settings
        $configData = $dataManager->readData('config.json');
        $settings = $configData['settings'] ?? [];
        
        echo json_encode([
            'success' => true,
            'data' => $settings,
            'message' => 'Settings retrieved successfully'
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Save settings
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            throw new Exception('Settings data is required');
        }
        
        // Load current configuration
        $configData = $dataManager->readData('config.json');
        
        // Update settings
        $configData['settings'] = array_merge($configData['settings'] ?? [], $input);
        $configData['metadata']['last_updated'] = date('c');
        
        // Save updated configuration
        $dataManager->writeData('config.json', $configData);
        
        $logger->log("System settings updated by admin: " . $_SESSION['user']['username']);
        
        echo json_encode([
            'success' => true,
            'data' => $configData['settings'],
            'message' => 'Settings saved successfully'
        ]);
        
    } else {
        throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    $logger->log("Settings API error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>