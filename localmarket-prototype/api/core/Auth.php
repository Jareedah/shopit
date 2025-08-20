<?php
// api/core/Auth.php
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
            'role' => 'user',
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
        
        foreach ($users as $user) {
            if ($user['username'] === $username) {
                // Update last login
                $user['last_login'] = date('c');
                
                // Start session
                $_SESSION['user'] = $user;
                
                return $user;
            }
        }
        
        throw new Exception('User not found');
    }
    
    public function isAdmin($username) {
        // Pre-configured admin accounts
        $adminAccounts = ['admin1', 'admin2'];
        return in_array($username, $adminAccounts);
    }
}
?>