<?php
/**
 * UploadHelper - Unified image upload processing
 * Handles file uploads with validation, security checks, and consistent path management
 */

class UploadHelper {
    
    private $uploadDir;
    private $allowedTypes;
    private $maxSize;
    
    public function __construct($uploadDir = null) {
        $this->uploadDir = $uploadDir ?: __DIR__ . '/../../uploads/';
        $this->allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $this->maxSize = 5 * 1024 * 1024; // 5MB
        
        // Ensure upload directory exists
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    /**
     * Process uploaded images with validation and security checks
     * @param array $images - $_FILES['images'] array
     * @param bool $strictMode - If true, throw exceptions on errors; if false, skip invalid files
     * @return array - Array of successfully uploaded filenames
     * @throws Exception - In strict mode, throws on any validation failure
     */
    public function processImages($images, $strictMode = true) {
        $uploadedPaths = [];
        
        if (!$images || !is_array($images['name'])) {
            if ($strictMode) {
                throw new Exception('No images provided');
            }
            return $uploadedPaths;
        }
        
        $imageCount = is_array($images['name']) ? count($images['name']) : 1;
        
        for ($i = 0; $i < $imageCount; $i++) {
            try {
                $filename = $this->processImage($images, $i);
                if ($filename) {
                    $uploadedPaths[] = $filename;
                }
            } catch (Exception $e) {
                if ($strictMode) {
                    throw $e;
                } else {
                    // In non-strict mode, log error and continue
                    error_log("Image upload error: " . $e->getMessage());
                    continue;
                }
            }
        }
        
        return $uploadedPaths;
    }
    
    /**
     * Process a single image
     * @param array $images - $_FILES array
     * @param int $index - Index of the image to process
     * @return string|null - Filename if successful, null if skipped
     * @throws Exception - On validation failures
     */
    private function processImage($images, $index) {
        // Handle single vs multiple file upload
        $name = is_array($images['name']) ? $images['name'][$index] : $images['name'];
        $tmpName = is_array($images['tmp_name']) ? $images['tmp_name'][$index] : $images['tmp_name'];
        $error = is_array($images['error']) ? $images['error'][$index] : $images['error'];
        $size = is_array($images['size']) ? $images['size'][$index] : $images['size'];
        
        // Check for upload errors
        if ($error !== UPLOAD_ERR_OK) {
            throw new Exception($this->getUploadErrorMessage($error, $name));
        }
        
        // Validate file type using finfo (more secure than mime type from client)
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tmpName);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $this->allowedTypes)) {
            throw new Exception("Invalid file type for '{$name}'. Allowed types: " . implode(', ', $this->allowedTypes));
        }
        
        // Validate file size
        if ($size > $this->maxSize) {
            $maxMB = $this->maxSize / (1024 * 1024);
            throw new Exception("File '{$name}' is too large. Maximum size: {$maxMB}MB");
        }
        
        // Additional security checks
        if (!$this->isValidImage($tmpName)) {
            throw new Exception("File '{$name}' failed security validation");
        }
        
        // Generate secure filename
        $filename = $this->generateSecureFilename($name);
        $destination = $this->uploadDir . $filename;
        
        // Move uploaded file
        if (!move_uploaded_file($tmpName, $destination)) {
            throw new Exception("Failed to save file '{$name}'");
        }
        
        // Set proper file permissions
        chmod($destination, 0644);
        
        return $filename;
    }
    
    /**
     * Additional security validation for image files
     * @param string $tmpPath - Temporary file path
     * @return bool - True if valid image
     */
    private function isValidImage($tmpPath) {
        // Try to get image info - this will fail for non-images
        $imageInfo = getimagesize($tmpPath);
        if ($imageInfo === false) {
            return false;
        }
        
        // Check for valid image types
        $validTypes = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF, IMAGETYPE_WEBP];
        return in_array($imageInfo[2], $validTypes);
    }
    
    /**
     * Generate secure filename with timestamp and random component
     * @param string $originalName - Original filename
     * @return string - Secure filename
     */
    private function generateSecureFilename($originalName) {
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
        $timestamp = date('Ymd_His');
        $random = bin2hex(random_bytes(4));
        return "img_{$timestamp}_{$random}.{$extension}";
    }
    
    /**
     * Get human-readable error message for upload errors
     * @param int $errorCode - PHP upload error code
     * @param string $filename - Original filename
     * @return string - Error message
     */
    private function getUploadErrorMessage($errorCode, $filename) {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return "File '{$filename}' is too large";
            case UPLOAD_ERR_PARTIAL:
                return "File '{$filename}' was only partially uploaded";
            case UPLOAD_ERR_NO_FILE:
                return "No file was uploaded";
            case UPLOAD_ERR_NO_TMP_DIR:
                return "Missing temporary folder";
            case UPLOAD_ERR_CANT_WRITE:
                return "Failed to write file to disk";
            case UPLOAD_ERR_EXTENSION:
                return "File upload stopped by extension";
            default:
                return "Unknown upload error for file '{$filename}'";
        }
    }
    
    /**
     * Delete uploaded images
     * @param array $filenames - Array of filenames to delete
     * @return array - Array of results ['deleted' => [], 'failed' => []]
     */
    public function deleteImages($filenames) {
        $results = ['deleted' => [], 'failed' => []];
        
        foreach ($filenames as $filename) {
            $filepath = $this->uploadDir . $filename;
            if (file_exists($filepath) && unlink($filepath)) {
                $results['deleted'][] = $filename;
            } else {
                $results['failed'][] = $filename;
            }
        }
        
        return $results;
    }
    
    /**
     * Get upload directory path
     * @return string - Upload directory path
     */
    public function getUploadDir() {
        return $this->uploadDir;
    }
    
    /**
     * Get allowed file types
     * @return array - Array of allowed MIME types
     */
    public function getAllowedTypes() {
        return $this->allowedTypes;
    }
    
    /**
     * Get maximum file size in bytes
     * @return int - Maximum file size
     */
    public function getMaxSize() {
        return $this->maxSize;
    }
}
?>