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
    
    // Create backup directory
    $backupDir = $dataManager->getDataPath() . 'backups/';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    // Create backup filename
    $timestamp = date('Y-m-d_H-i-s');
    $backupFile = $backupDir . "backup_{$timestamp}.zip";
    
    // Create ZIP archive
    $zip = new ZipArchive();
    if ($zip->open($backupFile, ZipArchive::CREATE) !== TRUE) {
        throw new Exception('Cannot create backup file');
    }
    
    // Add data files to backup
    $dataFiles = ['users.json', 'listings.json', 'orders.json', 'categories.json', 'config.json'];
    foreach ($dataFiles as $file) {
        $filePath = $dataManager->getDataPath() . $file;
        if (file_exists($filePath)) {
            $zip->addFile($filePath, $file);
        }
    }
    
    $zip->close();
    
    $logger->log("Backup created: {$backupFile} by admin: " . $_SESSION['user']['username']);
    
    echo json_encode([
        'success' => true,
        'backupFile' => basename($backupFile),
        'message' => 'Backup created successfully'
    ]);
    
} catch (Exception $e) {
    $logger->log("Backup error: " . $e->getMessage(), 'ERROR');
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>