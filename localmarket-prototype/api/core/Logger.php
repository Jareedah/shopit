<?php
/**
 * Logger - Simple file-based logging system
 * Provides methods for logging application events and errors
 */
class Logger {
    private $logPath;
    private $logFile;
    
    public function __construct($logFile = 'app.log') {
        $this->logPath = __DIR__ . '/../../data/logs/';
        $this->logFile = $logFile;
        
        // Create logs directory if it doesn't exist
        if (!is_dir($this->logPath)) {
            mkdir($this->logPath, 0755, true);
        }
    }
    
    /**
     * Log a message
     * @param string $message The message to log
     * @param string $level The log level (INFO, ERROR, WARNING, DEBUG)
     * @param array $context Additional context data
     */
    public function log($message, $level = 'INFO', $context = []) {
        $timestamp = date('Y-m-d H:i:s');
        $logEntry = [
            'timestamp' => $timestamp,
            'level' => strtoupper($level),
            'message' => $message,
            'context' => $context,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ];
        
        // Format log entry
        $formattedEntry = sprintf(
            "[%s] %s: %s %s\n",
            $logEntry['timestamp'],
            $logEntry['level'],
            $logEntry['message'],
            !empty($context) ? json_encode($context) : ''
        );
        
        // Write to file
        $this->writeToFile($formattedEntry);
        
        // Also write to JSON log for structured data
        $this->writeToJsonLog($logEntry);
    }
    
    /**
     * Log an info message
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function info($message, $context = []) {
        $this->log($message, 'INFO', $context);
    }
    
    /**
     * Log an error message
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function error($message, $context = []) {
        $this->log($message, 'ERROR', $context);
    }
    
    /**
     * Log a warning message
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function warning($message, $context = []) {
        $this->log($message, 'WARNING', $context);
    }
    
    /**
     * Log a debug message
     * @param string $message The message to log
     * @param array $context Additional context data
     */
    public function debug($message, $context = []) {
        $this->log($message, 'DEBUG', $context);
    }
    
    /**
     * Log an exception
     * @param Exception $exception The exception to log
     * @param string $level The log level
     */
    public function logException($exception, $level = 'ERROR') {
        $context = [
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ];
        
        $this->log($exception->getMessage(), $level, $context);
    }
    
    /**
     * Log user activity
     * @param string $action The action performed
     * @param string $userId The user ID
     * @param array $details Additional details
     */
    public function logActivity($action, $userId = null, $details = []) {
        $context = array_merge([
            'user_id' => $userId,
            'action' => $action
        ], $details);
        
        $this->log("User activity: $action", 'INFO', $context);
    }
    
    /**
     * Log API request
     * @param string $endpoint The API endpoint
     * @param string $method The HTTP method
     * @param array $params Request parameters
     * @param string $response Response data
     */
    public function logApiRequest($endpoint, $method, $params = [], $response = '') {
        $context = [
            'endpoint' => $endpoint,
            'method' => $method,
            'params' => $params,
            'response_length' => strlen($response)
        ];
        
        $this->log("API request: $method $endpoint", 'INFO', $context);
    }
    
    /**
     * Write log entry to file
     * @param string $entry The formatted log entry
     */
    private function writeToFile($entry) {
        $filepath = $this->logPath . $this->logFile;
        file_put_contents($filepath, $entry, FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Write log entry to JSON file for structured logging
     * @param array $entry The log entry data
     */
    private function writeToJsonLog($entry) {
        $jsonLogFile = str_replace('.log', '.json', $this->logFile);
        $filepath = $this->logPath . $jsonLogFile;
        
        // Read existing logs
        $logs = [];
        if (file_exists($filepath)) {
            $content = file_get_contents($filepath);
            if ($content) {
                $logs = json_decode($content, true) ?: [];
            }
        }
        
        // Add new entry
        $logs[] = $entry;
        
        // Keep only last 1000 entries to prevent file from growing too large
        if (count($logs) > 1000) {
            $logs = array_slice($logs, -1000);
        }
        
        // Write back to file
        file_put_contents($filepath, json_encode($logs, JSON_PRETTY_PRINT), LOCK_EX);
    }
    
    /**
     * Get recent log entries
     * @param int $limit Number of entries to retrieve
     * @param string $level Filter by log level
     * @return array Array of log entries
     */
    public function getRecentLogs($limit = 50, $level = null) {
        $jsonLogFile = str_replace('.log', '.json', $this->logFile);
        $filepath = $this->logPath . $jsonLogFile;
        
        if (!file_exists($filepath)) {
            return [];
        }
        
        $content = file_get_contents($filepath);
        if (!$content) {
            return [];
        }
        
        $logs = json_decode($content, true) ?: [];
        
        // Filter by level if specified
        if ($level) {
            $logs = array_filter($logs, function($log) use ($level) {
                return strtoupper($log['level']) === strtoupper($level);
            });
        }
        
        // Get most recent entries
        $logs = array_slice($logs, -$limit);
        
        // Reverse to show newest first
        return array_reverse($logs);
    }
    
    /**
     * Clear log files
     */
    public function clearLogs() {
        $textLogPath = $this->logPath . $this->logFile;
        $jsonLogPath = $this->logPath . str_replace('.log', '.json', $this->logFile);
        
        if (file_exists($textLogPath)) {
            unlink($textLogPath);
        }
        
        if (file_exists($jsonLogPath)) {
            unlink($jsonLogPath);
        }
    }
    
    /**
     * Rotate log files
     * @param int $maxSize Maximum file size in bytes before rotation
     */
    public function rotateLogs($maxSize = 10485760) { // 10MB default
        $filepath = $this->logPath . $this->logFile;
        
        if (file_exists($filepath) && filesize($filepath) > $maxSize) {
            $rotatedFile = $this->logPath . date('Y-m-d_H-i-s') . '_' . $this->logFile;
            rename($filepath, $rotatedFile);
            
            // Also rotate JSON log
            $jsonLogFile = str_replace('.log', '.json', $this->logFile);
            $jsonFilepath = $this->logPath . $jsonLogFile;
            if (file_exists($jsonFilepath)) {
                $rotatedJsonFile = $this->logPath . date('Y-m-d_H-i-s') . '_' . $jsonLogFile;
                rename($jsonFilepath, $rotatedJsonFile);
            }
        }
    }
    
    /**
     * Get log file path
     * @return string The log file path
     */
    public function getLogPath() {
        return $this->logPath . $this->logFile;
    }
    
    /**
     * Get log statistics
     * @return array Log statistics
     */
    public function getLogStats() {
        $jsonLogFile = str_replace('.log', '.json', $this->logFile);
        $filepath = $this->logPath . $jsonLogFile;
        
        if (!file_exists($filepath)) {
            return [
                'total_entries' => 0,
                'by_level' => [],
                'file_size' => 0
            ];
        }
        
        $content = file_get_contents($filepath);
        $logs = json_decode($content, true) ?: [];
        
        $stats = [
            'total_entries' => count($logs),
            'by_level' => [],
            'file_size' => filesize($filepath)
        ];
        
        // Count by level
        foreach ($logs as $log) {
            $level = $log['level'];
            $stats['by_level'][$level] = ($stats['by_level'][$level] ?? 0) + 1;
        }
        
        return $stats;
    }
}