/**
 * Main Application JavaScript
 * Initializes the application and provides global utilities
 */

// Global app configuration
window.LocalMarket = {
    config: {
        apiBaseUrl: '',
        version: '1.0.0',
        debug: true
    },
    
    // Initialize the application
    init: function() {
        console.log('LocalMarket v' + this.config.version + ' initialized');
        
        // Initialize global event listeners
        this.initGlobalEvents();
        
        // Check authentication status
        this.checkAuthStatus();
    },
    
    // Initialize global event listeners
    initGlobalEvents: function() {
        // Handle modal close buttons
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            }
        });
        
        // Handle modal backdrop clicks
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.classList.add('hidden');
            }
        });
        
        // Handle escape key for modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const visibleModals = document.querySelectorAll('.modal:not(.hidden)');
                visibleModals.forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
        
        // Handle notification auto-hide
        this.setupNotifications();
    },
    
    // Setup notification system
    setupNotifications: function() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 0.5rem;
                color: white;
                font-weight: 500;
                z-index: 9999;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 400px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .notification:not(.hidden) {
                transform: translateX(0);
            }
            
            .notification.info {
                background-color: #3b82f6;
            }
            
            .notification.success {
                background-color: #10b981;
            }
            
            .notification.warning {
                background-color: #f59e0b;
            }
            
            .notification.error {
                background-color: #ef4444;
            }
            
            @media (max-width: 640px) {
                .notification {
                    left: 20px;
                    right: 20px;
                    top: 20px;
                    transform: translateY(-100px);
                    max-width: none;
                }
                
                .notification:not(.hidden) {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    // Check authentication status
    checkAuthStatus: function() {
        // This will be implemented when Auth module is loaded
        if (window.Auth && typeof Auth.isLoggedIn === 'function') {
            const isLoggedIn = Auth.isLoggedIn();
            document.body.classList.toggle('user-logged-in', isLoggedIn);
        }
    },
    
    // Utility functions
    utils: {
        // Format currency
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        },
        
        // Format date
        formatDate: function(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        // Format date and time
        formatDateTime: function(dateString) {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        
        // Truncate text
        truncate: function(text, length = 100) {
            if (text.length <= length) return text;
            return text.substring(0, length) + '...';
        },
        
        // Debounce function
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function
        throttle: function(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Show loading state
        showLoading: function(element, text = 'Loading...') {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            if (element) {
                element.innerHTML = `<div class="loading-state"><p>${text}</p></div>`;
            }
        },
        
        // Show error state
        showError: function(element, message = 'An error occurred') {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            if (element) {
                element.innerHTML = `<div class="error-state"><p>${message}</p></div>`;
            }
        },
        
        // Show empty state
        showEmpty: function(element, message = 'No items found') {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            if (element) {
                element.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
            }
        },
        
        // Generate unique ID
        generateId: function(prefix = 'id') {
            return prefix + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        // Validate email format
        isValidEmail: function(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        // Get query parameter
        getQueryParam: function(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        },
        
        // Set query parameter
        setQueryParam: function(param, value) {
            const url = new URL(window.location);
            url.searchParams.set(param, value);
            window.history.pushState({}, '', url);
        },
        
        // Remove query parameter
        removeQueryParam: function(param) {
            const url = new URL(window.location);
            url.searchParams.delete(param);
            window.history.pushState({}, '', url);
        }
    }
};

// Global notification function
window.showNotification = function(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.remove('hidden');
    }, 100);
    
    // Auto-hide notification
    setTimeout(() => {
        notification.classList.add('hidden');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    LocalMarket.init();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalMarket;
}