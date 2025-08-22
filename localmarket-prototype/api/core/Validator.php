<?php
/**
 * Validator - Input validation and sanitization class
 * Provides methods for validating and sanitizing user input
 */
class Validator {
    private $errors = [];
    
    /**
     * Get validation errors
     * @return array Array of error messages
     */
    public function getErrors() {
        return $this->errors;
    }
    
    /**
     * Clear validation errors
     */
    public function clearErrors() {
        $this->errors = [];
    }
    
    /**
     * Add an error message
     * @param string $field The field name
     * @param string $message The error message
     */
    private function addError($field, $message) {
        $this->errors[$field] = $message;
    }
    
    /**
     * Check if validation passed
     * @return bool True if no errors
     */
    public function isValid() {
        return empty($this->errors);
    }
    
    /**
     * Validate required field
     * @param mixed $value The value to validate
     * @param string $field The field name
     * @return bool True if valid
     */
    public function required($value, $field) {
        if (empty($value) && $value !== '0') {
            $this->addError($field, ucfirst($field) . ' is required');
            return false;
        }
        return true;
    }
    
    /**
     * Validate email format
     * @param string $email The email to validate
     * @param string $field The field name
     * @return bool True if valid
     */
    public function email($email, $field = 'email') {
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, 'Invalid email format');
            return false;
        }
        return true;
    }
    
    /**
     * Validate string length
     * @param string $value The value to validate
     * @param int $min Minimum length
     * @param int $max Maximum length
     * @param string $field The field name
     * @return bool True if valid
     */
    public function length($value, $min, $max, $field) {
        $length = strlen($value);
        if ($length < $min || $length > $max) {
            $this->addError($field, ucfirst($field) . " must be between $min and $max characters");
            return false;
        }
        return true;
    }
    
    /**
     * Validate numeric value
     * @param mixed $value The value to validate
     * @param string $field The field name
     * @return bool True if valid
     */
    public function numeric($value, $field) {
        if (!is_numeric($value)) {
            $this->addError($field, ucfirst($field) . ' must be a number');
            return false;
        }
        return true;
    }
    
    /**
     * Validate numeric range
     * @param mixed $value The value to validate
     * @param float $min Minimum value
     * @param float $max Maximum value
     * @param string $field The field name
     * @return bool True if valid
     */
    public function range($value, $min, $max, $field) {
        if (!$this->numeric($value, $field)) {
            return false;
        }
        
        $numValue = (float)$value;
        if ($numValue < $min || $numValue > $max) {
            $this->addError($field, ucfirst($field) . " must be between $min and $max");
            return false;
        }
        return true;
    }
    
    /**
     * Validate username format
     * @param string $username The username to validate
     * @param string $field The field name
     * @return bool True if valid
     */
    public function username($username, $field = 'username') {
        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
            $this->addError($field, 'Username must be 3-20 characters long and contain only letters, numbers, and underscores');
            return false;
        }
        return true;
    }
    
    /**
     * Validate listing data
     * @param array $data The listing data to validate
     * @return bool True if valid
     */
    public function validateListing($data) {
        $this->clearErrors();
        
        // Required fields
        $this->required($data['title'] ?? '', 'title');
        $this->required($data['description'] ?? '', 'description');
        $this->required($data['category'] ?? '', 'category');
        $this->required($data['price'] ?? '', 'price');
        $this->required($data['stock'] ?? '', 'stock');
        
        // Field validation
        if (!empty($data['title'])) {
            $this->length($data['title'], 1, 100, 'title');
        }
        
        if (!empty($data['description'])) {
            $this->length($data['description'], 10, 1000, 'description');
        }
        
        if (!empty($data['price'])) {
            $this->numeric($data['price'], 'price');
            if ($this->numeric($data['price'], 'price')) {
                $this->range($data['price'], 0, 999999.99, 'price');
            }
        }
        
        // Stock validation
        if (!empty($data['stock'])) {
            $this->numeric($data['stock'], 'stock');
            if ($this->numeric($data['stock'], 'stock')) {
                $this->range($data['stock'], 1, 9999, 'stock');
            }
        }
        
        // Sale type validation
        if (!empty($data['sale_type'])) {
            $validSaleTypes = ['immediate', 'delivery_based'];
            if (!in_array($data['sale_type'], $validSaleTypes)) {
                $this->addError('sale_type', 'Invalid sale type selected');
            }
        }
        
        // Category validation
        $validCategories = ['electronics', 'clothing', 'home', 'vehicles', 'services', 'furniture', 'other'];
        if (!empty($data['category']) && !in_array($data['category'], $validCategories)) {
            $this->addError('category', 'Invalid category selected');
        }
        
        // Tags validation
        if (!empty($data['tags'])) {
            if (is_array($data['tags'])) {
                if (count($data['tags']) > 5) {
                    $this->addError('tags', 'Maximum 5 tags allowed');
                }
                foreach ($data['tags'] as $tag) {
                    if (strlen($tag) > 20) {
                        $this->addError('tags', 'Each tag must be 20 characters or less');
                        break;
                    }
                }
            }
        }
        
        return $this->isValid();
    }
    
    /**
     * Validate user registration data
     * @param array $data The user data to validate
     * @return bool True if valid
     */
    public function validateUserRegistration($data) {
        $this->clearErrors();
        
        // Required fields
        $this->required($data['username'] ?? '', 'username');
        
        // Username validation
        if (!empty($data['username'])) {
            $this->username($data['username']);
        }
        
        // Optional field validation
        if (!empty($data['userData']['email'])) {
            $this->email($data['userData']['email']);
        }
        
        if (!empty($data['userData']['name'])) {
            $this->length($data['userData']['name'], 1, 50, 'name');
        }
        
        if (!empty($data['userData']['phone'])) {
            if (!preg_match('/^[\d\s\-\+\(\)]+$/', $data['userData']['phone'])) {
                $this->addError('phone', 'Invalid phone number format');
            }
        }
        
        return $this->isValid();
    }
    
    /**
     * Validate order data
     * @param array $data The order data to validate
     * @return bool True if valid
     */
    public function validateOrder($data) {
        $this->clearErrors();
        
        // Required fields
        $this->required($data['listingId'] ?? '', 'listingId');
        $this->required($data['quantity'] ?? '', 'quantity');
        $this->required($data['total_amount'] ?? '', 'total_amount');
        
        // Quantity validation
        if (!empty($data['quantity'])) {
            $this->numeric($data['quantity'], 'quantity');
            if ($this->numeric($data['quantity'], 'quantity')) {
                $this->range($data['quantity'], 1, 99, 'quantity');
            }
        }
        
        // Total amount validation
        if (!empty($data['total_amount'])) {
            $this->numeric($data['total_amount'], 'total_amount');
            if ($this->numeric($data['total_amount'], 'total_amount')) {
                $this->range($data['total_amount'], 0.01, 999999.99, 'total_amount');
            }
        }
        
        return $this->isValid();
    }
    
    /**
     * Sanitize string input
     * @param string $input The input to sanitize
     * @return string The sanitized string
     */
    public function sanitizeString($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    /**
     * Sanitize HTML input (allow basic formatting)
     * @param string $input The input to sanitize
     * @return string The sanitized HTML
     */
    public function sanitizeHtml($input) {
        $allowedTags = '<p><br><strong><em><u><ol><ul><li>';
        return strip_tags(trim($input), $allowedTags);
    }
    
    /**
     * Sanitize numeric input
     * @param mixed $input The input to sanitize
     * @return float The sanitized number
     */
    public function sanitizeNumber($input) {
        return (float)filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
    }
    
    /**
     * Sanitize integer input
     * @param mixed $input The input to sanitize
     * @return int The sanitized integer
     */
    public function sanitizeInt($input) {
        return (int)filter_var($input, FILTER_SANITIZE_NUMBER_INT);
    }
    
    /**
     * Sanitize email input
     * @param string $input The input to sanitize
     * @return string The sanitized email
     */
    public function sanitizeEmail($input) {
        return filter_var(trim($input), FILTER_SANITIZE_EMAIL);
    }
    
    /**
     * Validate file upload
     * @param array $file The $_FILES array element
     * @param array $allowedTypes Array of allowed MIME types
     * @param int $maxSize Maximum file size in bytes
     * @param string $field The field name
     * @return bool True if valid
     */
    public function validateFile($file, $allowedTypes, $maxSize, $field = 'file') {
        if (!isset($file['error']) || is_array($file['error'])) {
            $this->addError($field, 'Invalid file upload');
            return false;
        }
        
        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                $this->addError($field, 'No file was uploaded');
                return false;
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $this->addError($field, 'File is too large');
                return false;
            default:
                $this->addError($field, 'Unknown file upload error');
                return false;
        }
        
        if ($file['size'] > $maxSize) {
            $this->addError($field, 'File is too large (max ' . number_format($maxSize / 1024 / 1024, 1) . 'MB)');
            return false;
        }
        
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        
        if (!in_array($mimeType, $allowedTypes)) {
            $this->addError($field, 'Invalid file type');
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate image file
     * @param array $file The $_FILES array element
     * @param string $field The field name
     * @return bool True if valid
     */
    public function validateImage($file, $field = 'image') {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        return $this->validateFile($file, $allowedTypes, $maxSize, $field);
    }
    
    /**
     * Validate array of values against allowed values
     * @param array $values The values to validate
     * @param array $allowed The allowed values
     * @param string $field The field name
     * @return bool True if valid
     */
    public function validateArray($values, $allowed, $field) {
        if (!is_array($values)) {
            $this->addError($field, ucfirst($field) . ' must be an array');
            return false;
        }
        
        foreach ($values as $value) {
            if (!in_array($value, $allowed)) {
                $this->addError($field, 'Invalid value in ' . $field);
                return false;
            }
        }
        
        return true;
    }
}