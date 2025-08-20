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
        'settings' => $configData['settings'],
        'message' => 'Settings saved successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Save settings error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>