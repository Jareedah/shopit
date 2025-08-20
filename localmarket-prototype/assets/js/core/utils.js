/**
 * Utils - Utility functions and helpers
 * Provides common utility functions used throughout the application
 */

const Utils = (function() {
    return {
        /**
         * Debounce function execution
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @param {boolean} immediate - Execute immediately on first call
         * @returns {Function} Debounced function
         */
        debounce(func, wait, immediate = false) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    timeout = null;
                    if (!immediate) func(...args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func(...args);
            };
        },
        
        /**
         * Throttle function execution
         * @param {Function} func - Function to throttle
         * @param {number} limit - Time limit in milliseconds
         * @returns {Function} Throttled function
         */
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        /**
         * Deep clone an object
         * @param {Object} obj - Object to clone
         * @returns {Object} Cloned object
         */
        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        },
        
        /**
         * Merge objects deeply
         * @param {Object} target - Target object
         * @param {...Object} sources - Source objects
         * @returns {Object} Merged object
         */
        deepMerge(target, ...sources) {
            if (!sources.length) return target;
            const source = sources.shift();
            
            if (this.isObject(target) && this.isObject(source)) {
                for (const key in source) {
                    if (this.isObject(source[key])) {
                        if (!target[key]) Object.assign(target, { [key]: {} });
                        this.deepMerge(target[key], source[key]);
                    } else {
                        Object.assign(target, { [key]: source[key] });
                    }
                }
            }
            
            return this.deepMerge(target, ...sources);
        },
        
        /**
         * Check if value is an object
         * @param {*} item - Item to check
         * @returns {boolean} True if object
         */
        isObject(item) {
            return item && typeof item === 'object' && !Array.isArray(item);
        },
        
        /**
         * Format currency
         * @param {number} amount - Amount to format
         * @param {string} currency - Currency code
         * @param {string} locale - Locale string
         * @returns {string} Formatted currency
         */
        formatCurrency(amount, currency = 'USD', locale = 'en-US') {
            return new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currency
            }).format(amount);
        },
        
        /**
         * Format number
         * @param {number} number - Number to format
         * @param {number} decimals - Number of decimal places
         * @returns {string} Formatted number
         */
        formatNumber(number, decimals = 0) {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(number);
        },
        
        /**
         * Format date
         * @param {Date|string} date - Date to format
         * @param {Object} options - Formatting options
         * @returns {string} Formatted date
         */
        formatDate(date, options = {}) {
            const defaultOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            };
            
            const formatOptions = { ...defaultOptions, ...options };
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            
            return dateObj.toLocaleDateString('en-US', formatOptions);
        },
        
        /**
         * Format date and time
         * @param {Date|string} date - Date to format
         * @param {Object} options - Formatting options
         * @returns {string} Formatted date and time
         */
        formatDateTime(date, options = {}) {
            const defaultOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            
            const formatOptions = { ...defaultOptions, ...options };
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            
            return dateObj.toLocaleString('en-US', formatOptions);
        },
        
        /**
         * Get relative time (e.g., "2 hours ago")
         * @param {Date|string} date - Date to compare
         * @returns {string} Relative time string
         */
        getRelativeTime(date) {
            const now = new Date();
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const diffInSeconds = Math.floor((now - dateObj) / 1000);
            
            const intervals = [
                { label: 'year', seconds: 31536000 },
                { label: 'month', seconds: 2592000 },
                { label: 'week', seconds: 604800 },
                { label: 'day', seconds: 86400 },
                { label: 'hour', seconds: 3600 },
                { label: 'minute', seconds: 60 },
                { label: 'second', seconds: 1 }
            ];
            
            for (const interval of intervals) {
                const count = Math.floor(diffInSeconds / interval.seconds);
                if (count >= 1) {
                    return count === 1 
                        ? `1 ${interval.label} ago`
                        : `${count} ${interval.label}s ago`;
                }
            }
            
            return 'just now';
        },
        
        /**
         * Truncate text
         * @param {string} text - Text to truncate
         * @param {number} length - Maximum length
         * @param {string} suffix - Suffix to add
         * @returns {string} Truncated text
         */
        truncate(text, length = 100, suffix = '...') {
            if (!text || text.length <= length) return text;
            return text.substring(0, length).trim() + suffix;
        },
        
        /**
         * Capitalize first letter
         * @param {string} text - Text to capitalize
         * @returns {string} Capitalized text
         */
        capitalize(text) {
            if (!text) return text;
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        },
        
        /**
         * Convert to title case
         * @param {string} text - Text to convert
         * @returns {string} Title case text
         */
        toTitleCase(text) {
            if (!text) return text;
            return text.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },
        
        /**
         * Generate random string
         * @param {number} length - Length of string
         * @param {string} charset - Character set to use
         * @returns {string} Random string
         */
        randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
            let result = '';
            for (let i = 0; i < length; i++) {
                result += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return result;
        },
        
        /**
         * Generate UUID
         * @returns {string} UUID string
         */
        generateUUID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        
        /**
         * Validate email format
         * @param {string} email - Email to validate
         * @returns {boolean} True if valid
         */
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        /**
         * Validate phone number format
         * @param {string} phone - Phone number to validate
         * @returns {boolean} True if valid
         */
        isValidPhone(phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
        },
        
        /**
         * Validate URL format
         * @param {string} url - URL to validate
         * @returns {boolean} True if valid
         */
        isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
        
        /**
         * Get query parameters
         * @param {string} url - URL to parse (optional, uses current URL)
         * @returns {Object} Query parameters object
         */
        getQueryParams(url = window.location.href) {
            const params = {};
            const urlObj = new URL(url);
            
            for (const [key, value] of urlObj.searchParams) {
                params[key] = value;
            }
            
            return params;
        },
        
        /**
         * Set query parameter
         * @param {string} key - Parameter key
         * @param {string} value - Parameter value
         * @param {boolean} updateHistory - Whether to update browser history
         */
        setQueryParam(key, value, updateHistory = true) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            
            if (updateHistory) {
                window.history.pushState({}, '', url);
            } else {
                window.history.replaceState({}, '', url);
            }
        },
        
        /**
         * Remove query parameter
         * @param {string} key - Parameter key to remove
         * @param {boolean} updateHistory - Whether to update browser history
         */
        removeQueryParam(key, updateHistory = true) {
            const url = new URL(window.location);
            url.searchParams.delete(key);
            
            if (updateHistory) {
                window.history.pushState({}, '', url);
            } else {
                window.history.replaceState({}, '', url);
            }
        },
        
        /**
         * Calculate distance between two coordinates (Haversine formula)
         * @param {number} lat1 - First latitude
         * @param {number} lon1 - First longitude
         * @param {number} lat2 - Second latitude
         * @param {number} lon2 - Second longitude
         * @returns {number} Distance in kilometers
         */
        calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth's radius in kilometers
            const dLat = this.toRadians(lat2 - lat1);
            const dLon = this.toRadians(lon2 - lon1);
            
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            return R * c;
        },
        
        /**
         * Convert degrees to radians
         * @param {number} degrees - Degrees to convert
         * @returns {number} Radians
         */
        toRadians(degrees) {
            return degrees * (Math.PI / 180);
        },
        
        /**
         * Format file size
         * @param {number} bytes - File size in bytes
         * @param {number} decimals - Number of decimal places
         * @returns {string} Formatted file size
         */
        formatFileSize(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        },
        
        /**
         * Scroll to element smoothly
         * @param {Element|string} element - Element or selector
         * @param {Object} options - Scroll options
         */
        scrollTo(element, options = {}) {
            const target = typeof element === 'string' ? document.querySelector(element) : element;
            
            if (target) {
                const defaultOptions = {
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                };
                
                target.scrollIntoView({ ...defaultOptions, ...options });
            }
        },
        
        /**
         * Copy text to clipboard
         * @param {string} text - Text to copy
         * @returns {Promise} Promise that resolves when copied
         */
        async copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                return new Promise((resolve, reject) => {
                    if (document.execCommand('copy')) {
                        resolve();
                    } else {
                        reject();
                    }
                    document.body.removeChild(textArea);
                });
            }
        }
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Make available globally
window.Utils = Utils;