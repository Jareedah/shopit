/**
 * Auth - Authentication module
 * Handles user authentication, session management, and user state
 */

const Auth = (function() {
    // Private variables
    let currentUser = null;
    let authListeners = [];
    
    // Storage keys
    const STORAGE_KEY = 'localmarket_user';
    const SESSION_KEY = 'localmarket_session';
    
    /**
     * Initialize authentication module
     */
    function init() {
        // Check for stored user session
        checkStoredSession();
        
        // Set up periodic session validation
        setInterval(validateSession, 5 * 60 * 1000); // Every 5 minutes
    }
    
    /**
     * Check for stored user session
     */
    function checkStoredSession() {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEY);
            const sessionData = sessionStorage.getItem(SESSION_KEY);
            
            if (storedUser && sessionData) {
                currentUser = JSON.parse(storedUser);
                notifyAuthListeners('login', currentUser);
            }
        } catch (error) {
            console.error('Error checking stored session:', error);
            clearStoredSession();
        }
    }
    
    /**
     * Clear stored session data
     */
    function clearStoredSession() {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        currentUser = null;
    }
    
    /**
     * Store user session
     * @param {Object} user - User data
     */
    function storeSession(user) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            sessionStorage.setItem(SESSION_KEY, Date.now().toString());
            currentUser = user;
        } catch (error) {
            console.error('Error storing session:', error);
        }
    }
    
    /**
     * Validate current session
     */
    async function validateSession() {
        if (!currentUser) return;
        
        try {
            const response = await API.post('/api/auth/validate.php');
            if (!response.success) {
                await logout();
            }
        } catch (error) {
            console.error('Session validation failed:', error);
            await logout();
        }
    }
    
    /**
     * Notify authentication listeners
     * @param {string} event - Event type (login, logout, update)
     * @param {Object} data - Event data
     */
    function notifyAuthListeners(event, data) {
        authListeners.forEach(listener => {
            try {
                listener(event, data);
            } catch (error) {
                console.error('Auth listener error:', error);
            }
        });
    }
    
    // Public API
    return {
        /**
         * Initialize authentication
         */
        init,
        
        /**
         * Login user
         * @param {string} username - Username
         * @returns {Promise<Object>} User data
         */
        async login(username) {
            try {
                const response = await API.post('/api/auth/login.php', { username });
                
                if (response.success) {
                    storeSession(response.user);
                    notifyAuthListeners('login', response.user);
                    return response;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        
        /**
         * Register new user
         * @param {string} username - Username
         * @param {Object} userData - User profile data
         * @returns {Promise<Object>} Registration result
         */
        async register(username, userData) {
            try {
                const response = await API.post('/api/auth/register.php', {
                    username,
                    userData
                });
                
                if (response.success) {
                    return response;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        
        /**
         * Logout user
         * @returns {Promise<void>}
         */
        async logout() {
            try {
                // Call logout endpoint
                await API.post('/api/auth/logout.php');
            } catch (error) {
                console.error('Logout API error:', error);
            } finally {
                // Clear local session regardless of API response
                const wasLoggedIn = !!currentUser;
                clearStoredSession();
                
                if (wasLoggedIn) {
                    notifyAuthListeners('logout', null);
                }
            }
        },
        
        /**
         * Check if user is logged in
         * @returns {boolean} True if logged in
         */
        isLoggedIn() {
            return !!currentUser;
        },
        
        /**
         * Get current user
         * @returns {Object|null} Current user data or null
         */
        getCurrentUser() {
            return currentUser;
        },
        
        /**
         * Check if current user is admin
         * @returns {boolean} True if admin
         */
        isAdmin() {
            return currentUser && currentUser.role === 'admin';
        },
        
        /**
         * Check if user can access resource
         * @param {string} resourceUserId - User ID that owns the resource
         * @returns {boolean} True if can access
         */
        canAccessResource(resourceUserId) {
            if (!currentUser) return false;
            return currentUser.id === resourceUserId || currentUser.role === 'admin';
        },
        
        /**
         * Update user profile
         * @param {Object} profileData - Profile data to update
         * @returns {Promise<Object>} Updated user data
         */
        async updateProfile(profileData) {
            if (!currentUser) {
                throw new Error('User not logged in');
            }
            
            try {
                const response = await API.post('/api/auth/update-profile.php', {
                    userId: currentUser.id,
                    profileData
                });
                
                if (response.success) {
                    // Update stored user data
                    currentUser.profile = { ...currentUser.profile, ...profileData };
                    storeSession(currentUser);
                    notifyAuthListeners('update', currentUser);
                    return response;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Profile update error:', error);
                throw error;
            }
        },
        
        /**
         * Change password
         * @param {string} currentPassword - Current password
         * @param {string} newPassword - New password
         * @returns {Promise<Object>} Change result
         */
        async changePassword(currentPassword, newPassword) {
            if (!currentUser) {
                throw new Error('User not logged in');
            }
            
            try {
                const response = await API.post('/api/auth/change-password.php', {
                    userId: currentUser.id,
                    currentPassword,
                    newPassword
                });
                
                if (response.success) {
                    return response;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Password change error:', error);
                throw error;
            }
        },
        
        /**
         * Request password reset
         * @param {string} username - Username
         * @returns {Promise<Object>} Reset result
         */
        async requestPasswordReset(username) {
            try {
                const response = await API.post('/api/auth/reset-password.php', { username });
                
                if (response.success) {
                    return response;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Password reset error:', error);
                throw error;
            }
        },
        
        /**
         * Add authentication event listener
         * @param {Function} listener - Listener function (event, data) => void
         */
        addAuthListener(listener) {
            if (typeof listener === 'function') {
                authListeners.push(listener);
            }
        },
        
        /**
         * Remove authentication event listener
         * @param {Function} listener - Listener function to remove
         */
        removeAuthListener(listener) {
            const index = authListeners.indexOf(listener);
            if (index > -1) {
                authListeners.splice(index, 1);
            }
        },
        
        /**
         * Require authentication (throws if not logged in)
         * @throws {Error} If user is not authenticated
         */
        requireAuth() {
            if (!this.isLoggedIn()) {
                throw new Error('Authentication required');
            }
        },
        
        /**
         * Require admin privileges (throws if not admin)
         * @throws {Error} If user is not admin
         */
        requireAdmin() {
            this.requireAuth();
            if (!this.isAdmin()) {
                throw new Error('Admin privileges required');
            }
        },
        
        /**
         * Get user permissions
         * @returns {Array} Array of user permissions
         */
        getUserPermissions() {
            if (!currentUser) return [];
            
            const permissions = ['read'];
            
            if (currentUser.role === 'admin') {
                permissions.push('admin', 'write', 'delete', 'moderate');
            } else {
                permissions.push('write');
            }
            
            return permissions;
        },
        
        /**
         * Check if user has permission
         * @param {string} permission - Permission to check
         * @returns {boolean} True if has permission
         */
        hasPermission(permission) {
            const userPermissions = this.getUserPermissions();
            return userPermissions.includes(permission);
        },
        
        /**
         * Get user display name
         * @returns {string} User display name
         */
        getUserDisplayName() {
            if (!currentUser) return '';
            
            if (currentUser.profile && currentUser.profile.name) {
                return currentUser.profile.name;
            }
            
            return currentUser.username;
        },
        
        /**
         * Get user avatar URL or initials
         * @returns {string} Avatar URL or initials
         */
        getUserAvatar() {
            if (!currentUser) return '';
            
            if (currentUser.profile && currentUser.profile.avatar) {
                return currentUser.profile.avatar;
            }
            
            // Return initials if no avatar
            const displayName = this.getUserDisplayName();
            const initials = displayName
                .split(' ')
                .map(name => name.charAt(0).toUpperCase())
                .join('')
                .substring(0, 2);
            
            return initials || currentUser.username.charAt(0).toUpperCase();
        },
        
        /**
         * Refresh user data from server
         * @returns {Promise<Object>} Updated user data
         */
        async refreshUser() {
            if (!currentUser) {
                throw new Error('User not logged in');
            }
            
            try {
                const response = await API.post('/api/auth/me.php');
                
                if (response.success) {
                    storeSession(response.user);
                    notifyAuthListeners('update', response.user);
                    return response.user;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('User refresh error:', error);
                throw error;
            }
        }
    };
})();

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    Auth.init();
});

// Add global auth state management
Auth.addAuthListener(function(event, data) {
    // Update body class based on auth state
    document.body.classList.toggle('user-logged-in', event === 'login');
    document.body.classList.toggle('user-admin', data && data.role === 'admin');
    
    // Update navigation elements
    const userElements = document.querySelectorAll('[data-auth-user]');
    const guestElements = document.querySelectorAll('[data-auth-guest]');
    const adminElements = document.querySelectorAll('[data-auth-admin]');
    
    userElements.forEach(el => {
        el.style.display = (event === 'login') ? '' : 'none';
    });
    
    guestElements.forEach(el => {
        el.style.display = (event === 'logout' || !Auth.isLoggedIn()) ? '' : 'none';
    });
    
    adminElements.forEach(el => {
        el.style.display = (Auth.isAdmin()) ? '' : 'none';
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}

// Make available globally
window.Auth = Auth;