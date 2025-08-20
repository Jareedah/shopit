<?php
require_once 'DataManager.php';

/**
 * Auth - Authentication and user management class
 * Handles user registration, login, and session management
 */
class Auth {
    private $dataManager;
    
    public function __construct() {
        $this->dataManager = new DataManager();
    }
    
    /**
     * Register a new user
     * @param string $username The username
     * @param array $userData Additional user profile data
     * @return array The created user data
     * @throws Exception If registration fails
     */
    public function register($username, $userData = []) {
        // Validate input
        if (empty($username)) {
            throw new Exception('Username is required');
        }
        
        if (!$this->isValidUsername($username)) {
            throw new Exception('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
        }
        
        // Load existing users
        $usersData = $this->dataManager->readData('users.json');
        $users = $usersData['data'] ?? [];
        
        // Check if username already exists
        foreach ($users as $user) {
            if (strtolower($user['username']) === strtolower($username)) {
                throw new Exception('Username already exists');
            }
        }
        
        // Create new user
        $newUser = [
            'id' => uniqid('user_'),
            'username' => $username,
            'role' => $this->isAdmin($username) ? 'admin' : 'user',
            'status' => 'active',
            'profile' => [
                'name' => $userData['name'] ?? '',
                'email' => $userData['email'] ?? '',
                'location' => $userData['location'] ?? '',
                'phone' => $userData['phone'] ?? '',
                'bio' => $userData['bio'] ?? ''
            ],
            'stats' => [
                'listingsCount' => 0,
                'ordersCount' => 0,
                'reviewsCount' => 0,
                'rating' => 0
            ],
            'created_at' => date('c'),
            'last_login' => null,
            'updated_at' => date('c')
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
    
    /**
     * Login a user
     * @param string $username The username
     * @return array The user data
     * @throws Exception If login fails
     */
    public function login($username) {
        if (empty($username)) {
            throw new Exception('Username is required');
        }
        
        $usersData = $this->dataManager->readData('users.json');
        $users = $usersData['data'] ?? [];
        
        foreach ($users as $key => $user) {
            if (strtolower($user['username']) === strtolower($username)) {
                if ($user['status'] === 'suspended') {
                    throw new Exception('Account is suspended');
                }
                
                // Update last login
                $users[$key]['last_login'] = date('c');
                $usersData['data'] = $users;
                $usersData['metadata']['last_updated'] = date('c');
                $this->dataManager->writeData('users.json', $usersData);
                
                // Start session
                if (session_status() === PHP_SESSION_NONE) {
                    session_start();
                }
                $_SESSION['user'] = $users[$key];
                
                return $users[$key];
            }
        }
        
        throw new Exception('User not found');
    }
    
    /**
     * Logout the current user
     */
    public function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        unset($_SESSION['user']);
        session_destroy();
    }
    
    /**
     * Get the currently logged-in user
     * @return array|null The user data or null if not logged in
     */
    public function getCurrentUser() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        return $_SESSION['user'] ?? null;
    }
    
    /**
     * Check if user is logged in
     * @return bool True if logged in
     */
    public function isLoggedIn() {
        return $this->getCurrentUser() !== null;
    }
    
    /**
     * Check if the current user is an admin
     * @return bool True if admin
     */
    public function isCurrentUserAdmin() {
        $user = $this->getCurrentUser();
        return $user && $user['role'] === 'admin';
    }
    
    /**
     * Check if a username belongs to an admin account
     * @param string $username The username to check
     * @return bool True if admin
     */
    public function isAdmin($username) {
        // Pre-configured admin accounts
        $adminAccounts = ['admin1', 'admin2'];
        return in_array(strtolower($username), array_map('strtolower', $adminAccounts));
    }
    
    /**
     * Validate username format
     * @param string $username The username to validate
     * @return bool True if valid
     */
    private function isValidUsername($username) {
        return preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username);
    }
    
    /**
     * Update user profile
     * @param string $userId The user ID
     * @param array $profileData The profile data to update
     * @return bool True on success
     * @throws Exception If update fails
     */
    public function updateProfile($userId, $profileData) {
        $user = $this->dataManager->findById('users.json', 'data', $userId);
        if (!$user) {
            throw new Exception('User not found');
        }
        
        // Merge profile data
        $updatedProfile = array_merge($user['profile'], $profileData);
        
        $updates = [
            'profile' => $updatedProfile,
            'updated_at' => date('c')
        ];
        
        $success = $this->dataManager->updateItem('users.json', 'data', $userId, $updates);
        
        if ($success) {
            // Update session if this is the current user
            $currentUser = $this->getCurrentUser();
            if ($currentUser && $currentUser['id'] === $userId) {
                $_SESSION['user']['profile'] = $updatedProfile;
                $_SESSION['user']['updated_at'] = date('c');
            }
        }
        
        return $success;
    }
    
    /**
     * Get user by ID
     * @param string $userId The user ID
     * @return array|null The user data or null if not found
     */
    public function getUserById($userId) {
        return $this->dataManager->findById('users.json', 'data', $userId);
    }
    
    /**
     * Get user by username
     * @param string $username The username
     * @return array|null The user data or null if not found
     */
    public function getUserByUsername($username) {
        $usersData = $this->dataManager->readData('users.json');
        $users = $usersData['data'] ?? [];
        
        foreach ($users as $user) {
            if (strtolower($user['username']) === strtolower($username)) {
                return $user;
            }
        }
        
        return null;
    }
    
    /**
     * Update user status (for admin use)
     * @param string $userId The user ID
     * @param string $status The new status (active, suspended, etc.)
     * @return bool True on success
     */
    public function updateUserStatus($userId, $status) {
        $validStatuses = ['active', 'suspended', 'inactive'];
        if (!in_array($status, $validStatuses)) {
            throw new Exception('Invalid status');
        }
        
        return $this->dataManager->updateItem('users.json', 'data', $userId, [
            'status' => $status,
            'updated_at' => date('c')
        ]);
    }
    
    /**
     * Get all users (for admin use)
     * @return array Array of all users
     */
    public function getAllUsers() {
        $usersData = $this->dataManager->readData('users.json');
        return $usersData['data'] ?? [];
    }
    
    /**
     * Update user statistics
     * @param string $userId The user ID
     * @param array $stats Statistics to update
     * @return bool True on success
     */
    public function updateUserStats($userId, $stats) {
        $user = $this->dataManager->findById('users.json', 'data', $userId);
        if (!$user) {
            return false;
        }
        
        $updatedStats = array_merge($user['stats'] ?? [], $stats);
        
        return $this->dataManager->updateItem('users.json', 'data', $userId, [
            'stats' => $updatedStats,
            'updated_at' => date('c')
        ]);
    }
    
    /**
     * Require authentication (middleware function)
     * @throws Exception If user is not authenticated
     */
    public function requireAuth() {
        if (!$this->isLoggedIn()) {
            throw new Exception('Authentication required');
        }
    }
    
    /**
     * Require admin privileges (middleware function)
     * @throws Exception If user is not an admin
     */
    public function requireAdmin() {
        $this->requireAuth();
        if (!$this->isCurrentUserAdmin()) {
            throw new Exception('Admin privileges required');
        }
    }
    
    /**
     * Check if user owns a resource
     * @param string $resourceUserId The user ID associated with the resource
     * @return bool True if current user owns the resource or is admin
     */
    public function canAccessResource($resourceUserId) {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser) {
            return false;
        }
        
        return $currentUser['id'] === $resourceUserId || $currentUser['role'] === 'admin';
    }
}