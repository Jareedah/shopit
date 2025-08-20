<?php
/**
 * DataManager - JSON file-based data storage manager
 * Handles reading and writing data to JSON files with file locking for concurrent access
 */
class DataManager {
    private $dataPath;
    
    public function __construct() {
        $this->dataPath = __DIR__ . '/../../data/';
    }
    
    /**
     * Read data from a JSON file
     * @param string $filename The JSON file name
     * @return array The decoded data
     * @throws Exception If file cannot be read or JSON is invalid
     */
    public function readData($filename) {
        $filepath = $this->dataPath . $filename;
        
        if (!file_exists($filepath)) {
            return ['data' => [], 'metadata' => []];
        }
        
        $jsonData = file_get_contents($filepath);
        if ($jsonData === false) {
            throw new Exception('Failed to read data file: ' . $filename);
        }
        
        $data = json_decode($jsonData, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('JSON decode error in ' . $filename . ': ' . json_last_error_msg());
        }
        
        return $data;
    }
    
    /**
     * Write data to a JSON file with file locking
     * @param string $filename The JSON file name
     * @param array $data The data to write
     * @return bool True on success
     * @throws Exception If file cannot be written
     */
    public function writeData($filename, $data) {
        $filepath = $this->dataPath . $filename;
        
        // Create data directory if it doesn't exist
        if (!is_dir($this->dataPath)) {
            if (!mkdir($this->dataPath, 0755, true)) {
                throw new Exception('Failed to create data directory');
            }
        }
        
        $jsonData = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
        if ($jsonData === false) {
            throw new Exception('JSON encode error: ' . json_last_error_msg());
        }
        
        // Use file locking for concurrent access protection
        $lockFile = $filepath . '.lock';
        $lockHandle = fopen($lockFile, 'w');
        
        if (!$lockHandle) {
            throw new Exception('Could not create lock file');
        }
        
        if (flock($lockHandle, LOCK_EX)) {
            try {
                $result = file_put_contents($filepath, $jsonData, LOCK_EX);
                if ($result === false) {
                    throw new Exception('Failed to write data file: ' . $filename);
                }
                return true;
            } finally {
                flock($lockHandle, LOCK_UN);
                fclose($lockHandle);
                if (file_exists($lockFile)) {
                    unlink($lockFile);
                }
            }
        } else {
            fclose($lockHandle);
            throw new Exception('Could not acquire file lock for: ' . $filename);
        }
    }
    
    /**
     * Append data to an existing array in a JSON file
     * @param string $filename The JSON file name
     * @param string $arrayKey The key of the array to append to
     * @param mixed $newItem The item to append
     * @return bool True on success
     */
    public function appendData($filename, $arrayKey, $newItem) {
        $data = $this->readData($filename);
        
        if (!isset($data[$arrayKey])) {
            $data[$arrayKey] = [];
        }
        
        if (!is_array($data[$arrayKey])) {
            throw new Exception("Key '$arrayKey' is not an array in $filename");
        }
        
        $data[$arrayKey][] = $newItem;
        $data['metadata']['last_updated'] = date('c');
        $data['metadata']['total_' . $arrayKey] = count($data[$arrayKey]);
        
        return $this->writeData($filename, $data);
    }
    
    /**
     * Update a specific item in an array by ID
     * @param string $filename The JSON file name
     * @param string $arrayKey The key of the array containing the item
     * @param string $itemId The ID of the item to update
     * @param array $updates The updates to apply
     * @return bool True on success, false if item not found
     */
    public function updateItem($filename, $arrayKey, $itemId, $updates) {
        $data = $this->readData($filename);
        
        if (!isset($data[$arrayKey]) || !is_array($data[$arrayKey])) {
            return false;
        }
        
        foreach ($data[$arrayKey] as &$item) {
            if (isset($item['id']) && $item['id'] === $itemId) {
                foreach ($updates as $key => $value) {
                    $item[$key] = $value;
                }
                $item['updated_at'] = date('c');
                
                $data['metadata']['last_updated'] = date('c');
                $this->writeData($filename, $data);
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Delete an item from an array by ID
     * @param string $filename The JSON file name
     * @param string $arrayKey The key of the array containing the item
     * @param string $itemId The ID of the item to delete
     * @return bool True on success, false if item not found
     */
    public function deleteItem($filename, $arrayKey, $itemId) {
        $data = $this->readData($filename);
        
        if (!isset($data[$arrayKey]) || !is_array($data[$arrayKey])) {
            return false;
        }
        
        $originalCount = count($data[$arrayKey]);
        $data[$arrayKey] = array_filter($data[$arrayKey], function($item) use ($itemId) {
            return !isset($item['id']) || $item['id'] !== $itemId;
        });
        
        // Re-index array to maintain proper JSON structure
        $data[$arrayKey] = array_values($data[$arrayKey]);
        
        if (count($data[$arrayKey]) < $originalCount) {
            $data['metadata']['last_updated'] = date('c');
            $data['metadata']['total_' . $arrayKey] = count($data[$arrayKey]);
            $this->writeData($filename, $data);
            return true;
        }
        
        return false;
    }
    
    /**
     * Find an item by ID
     * @param string $filename The JSON file name
     * @param string $arrayKey The key of the array to search
     * @param string $itemId The ID to search for
     * @return array|null The found item or null
     */
    public function findById($filename, $arrayKey, $itemId) {
        $data = $this->readData($filename);
        
        if (!isset($data[$arrayKey]) || !is_array($data[$arrayKey])) {
            return null;
        }
        
        foreach ($data[$arrayKey] as $item) {
            if (isset($item['id']) && $item['id'] === $itemId) {
                return $item;
            }
        }
        
        return null;
    }
    
    /**
     * Search items by criteria
     * @param string $filename The JSON file name
     * @param string $arrayKey The key of the array to search
     * @param array $criteria Key-value pairs to match
     * @return array Array of matching items
     */
    public function findBy($filename, $arrayKey, $criteria) {
        $data = $this->readData($filename);
        
        if (!isset($data[$arrayKey]) || !is_array($data[$arrayKey])) {
            return [];
        }
        
        return array_filter($data[$arrayKey], function($item) use ($criteria) {
            foreach ($criteria as $key => $value) {
                if (!isset($item[$key]) || $item[$key] !== $value) {
                    return false;
                }
            }
            return true;
        });
    }
    
    /**
     * Get data path
     * @return string The data directory path
     */
    public function getDataPath() {
        return $this->dataPath;
    }
    
    /**
     * Check if a file exists
     * @param string $filename The JSON file name
     * @return bool True if file exists
     */
    public function fileExists($filename) {
        return file_exists($this->dataPath . $filename);
    }
    
    /**
     * Create a backup of a data file
     * @param string $filename The JSON file name
     * @return string The backup filename
     * @throws Exception If backup cannot be created
     */
    public function createBackup($filename) {
        $filepath = $this->dataPath . $filename;
        if (!file_exists($filepath)) {
            throw new Exception("File $filename does not exist");
        }
        
        $backupFilename = pathinfo($filename, PATHINFO_FILENAME) . '_backup_' . date('Y-m-d_H-i-s') . '.json';
        $backupPath = $this->dataPath . 'backups/';
        
        if (!is_dir($backupPath)) {
            if (!mkdir($backupPath, 0755, true)) {
                throw new Exception('Failed to create backup directory');
            }
        }
        
        if (!copy($filepath, $backupPath . $backupFilename)) {
            throw new Exception('Failed to create backup');
        }
        
        return $backupFilename;
    }
}