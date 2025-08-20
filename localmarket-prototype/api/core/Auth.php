<?php
// api/core/Auth.php
require_once 'DataManager.php';

class Auth {
    private $dataManager;
    
    public function __construct() {
        $this->dataManager = new DataManager();
    }
    
    public function register($username, $userData) {
        // Validate input
        if (empty($username) || empty($userData)) {
            throw new Exception('Username and user data are required');
        }
        
        // Load existing users
        $usersData = $this->dataManager->readData('users.json');
        $users = $usersData['data'] ?? [];
        
        // Check if username already exists
        foreach ($users as $user) {
            if ($user['username'] === $username) {
                throw new Exception('Username already exists');
            }
        }
        
        // Create new user
        $newUser = [
            'id' => uniqid('user_'),
            'username' => $username,
            'role' => $this->isAdmin($username) ? 'admin' : 'user',
            'profile' => $userData,
            'created_at' => date('c'),
            'last_login' => null
        ];
        
        // Add to users array
        $users[] = $newUser;
        
        // Save updated users
        $usersData['data'] = $users;
        $usersData['metadata'] = [
            'last_updated' => date('c'),
            'total_users' => count($users)
        ];
        
        $this->dataManager->writeData('users.json', $usersData);
        
        return $newUser;
    }
    
    public function login($username) {
        $usersData = $this->dataManager->readData('users.json');
        $users = $usersData['data'] ?? [];
        
        foreach ($users as $key => $user) {
            if ($user['username'] === $username) {
                // Update last login
                $users[$key]['last_login'] = date('c');
                
                // Save updated user data
                $usersData['data'] = $users;
                $usersData['metadata']['last_updated'] = date('c');
                $this->dataManager->writeData('users.json', $usersData);
                
                // Start session with timeout tracking
                $_SESSION['user'] = $users[$key];
                $_SESSION['last_activity'] = time();
                $_SESSION['session_timeout'] = 3600; // 1 hour
                
                return $users[$key];
            }
        }
        
        throw new Exception('User not found');
    }
    
    public function isAdmin($username) {
        // Pre-configured admin accounts
        $adminAccounts = ['admin1', 'admin2'];
        return in_array($username, $adminAccounts);
    }
    
    public function validateSession() {
        if (!isset($_SESSION['user']) || !isset($_SESSION['last_activity'])) {
            return false;
        }
        
        $timeout = $_SESSION['session_timeout'] ?? 3600;
        if (time() - $_SESSION['last_activity'] > $timeout) {
            session_destroy();
            return false;
        }
        
        $_SESSION['last_activity'] = time();
        return true;
    }
    
    public function getCurrentUser() {
        if (!$this->validateSession()) {
            return null;
        }
        return $_SESSION['user'] ?? null;
    }
    
    public function isLoggedIn() {
        return $this->validateSession() && isset($_SESSION['user']);
    }
    
    public function logout() {
        session_destroy();
    }
    
    public function requireAuth() {
        if (!$this->isLoggedIn()) {
            throw new Exception('Authentication required');
        }
    }
    
    public function requireAdmin() {
        $this->requireAuth();
        $user = $this->getCurrentUser();
        if (!$user || $user['role'] !== 'admin') {
            throw new Exception('Admin privileges required');
        }
    }
}
?>