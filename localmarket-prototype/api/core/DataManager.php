<?php
// api/core/DataManager.php
class DataManager {
    private $dataPath;
    
    public function __construct() {
        $this->dataPath = __DIR__ . '/../../data/';
    }
    
    public function readData($filename) {
        $filepath = $this->dataPath . $filename;
        if (!file_exists($filepath)) {
            return ['data' => [], 'metadata' => []];
        }
        
        $jsonData = file_get_contents($filepath);
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('JSON decode error: ' . json_last_error_msg());
        }
        
        return $data;
    }
    
    public function writeData($filename, $data) {
        $filepath = $this->dataPath . $filename;
        $jsonData = json_encode($data, JSON_PRETTY_PRINT);
        
        if ($jsonData === false) {
            throw new Exception('JSON encode error: ' . json_last_error_msg());
        }
        
        // Create data directory if it doesn't exist
        if (!is_dir($this->dataPath)) {
            mkdir($this->dataPath, 0755, true);
        }
        
        // Use file locking for concurrent access
        $lockFile = $filepath . '.lock';
        $lockHandle = fopen($lockFile, 'w');
        
        if (flock($lockHandle, LOCK_EX)) {
            try {
                $result = file_put_contents($filepath, $jsonData, LOCK_EX);
                if ($result === false) {
                    throw new Exception('Failed to write data file');
                }
                return true;
            } finally {
                flock($lockHandle, LOCK_UN);
                fclose($lockHandle);
                unlink($lockFile);
            }
        }
        
        throw new Exception('Could not acquire file lock');
    }
}
?>