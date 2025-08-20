/**
 * API - HTTP client for making API requests
 * Provides methods for GET, POST, PUT, DELETE requests with error handling
 */

const API = (function() {
    // Configuration
    const config = {
        baseUrl: '',
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000
    };
    
    // Request interceptors
    const requestInterceptors = [];
    const responseInterceptors = [];
    
    /**
     * Make HTTP request
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise} Response promise
     */
    async function makeRequest(url, options = {}) {
        const fullUrl = config.baseUrl + url;
        
        // Default options
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: config.timeout
        };
        
        // Merge options
        const requestOptions = { ...defaultOptions, ...options };
        
        // Apply request interceptors
        for (const interceptor of requestInterceptors) {
            await interceptor(requestOptions);
        }
        
        // Add session handling
        if (typeof fetch !== 'undefined') {
            requestOptions.credentials = 'same-origin';
        }
        
        let lastError;
        
        // Retry logic
        for (let attempt = 0; attempt <= config.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);
                
                requestOptions.signal = controller.signal;
                
                const response = await fetch(fullUrl, requestOptions);
                clearTimeout(timeoutId);
                
                // Apply response interceptors
                for (const interceptor of responseInterceptors) {
                    await interceptor(response);
                }
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                return data;
                
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.name === 'AbortError' || error.message.includes('400') || error.message.includes('401') || error.message.includes('403')) {
                    break;
                }
                
                // Wait before retry
                if (attempt < config.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, config.retryDelay * (attempt + 1)));
                }
            }
        }
        
        throw lastError;
    }
    
    return {
        /**
         * Configure API client
         * @param {Object} newConfig - Configuration options
         */
        configure(newConfig) {
            Object.assign(config, newConfig);
        },
        
        /**
         * Add request interceptor
         * @param {Function} interceptor - Interceptor function
         */
        addRequestInterceptor(interceptor) {
            requestInterceptors.push(interceptor);
        },
        
        /**
         * Add response interceptor
         * @param {Function} interceptor - Interceptor function
         */
        addResponseInterceptor(interceptor) {
            responseInterceptors.push(interceptor);
        },
        
        /**
         * Make GET request
         * @param {string} url - Request URL
         * @param {Object} params - Query parameters
         * @returns {Promise} Response promise
         */
        async get(url, params = {}) {
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = queryString ? `${url}?${queryString}` : url;
            
            return makeRequest(fullUrl, {
                method: 'GET'
            });
        },
        
        /**
         * Make POST request
         * @param {string} url - Request URL
         * @param {Object} data - Request body data
         * @param {Object} options - Additional options
         * @returns {Promise} Response promise
         */
        async post(url, data = {}, options = {}) {
            return makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(data),
                ...options
            });
        },
        
        /**
         * Make PUT request
         * @param {string} url - Request URL
         * @param {Object} data - Request body data
         * @param {Object} options - Additional options
         * @returns {Promise} Response promise
         */
        async put(url, data = {}, options = {}) {
            return makeRequest(url, {
                method: 'PUT',
                body: JSON.stringify(data),
                ...options
            });
        },
        
        /**
         * Make DELETE request
         * @param {string} url - Request URL
         * @param {Object} options - Additional options
         * @returns {Promise} Response promise
         */
        async delete(url, options = {}) {
            return makeRequest(url, {
                method: 'DELETE',
                ...options
            });
        },
        
        /**
         * Upload file(s)
         * @param {string} url - Upload URL
         * @param {FormData|File} data - File data
         * @param {Function} onProgress - Progress callback
         * @returns {Promise} Response promise
         */
        async upload(url, data, onProgress = null) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                // Handle progress
                if (onProgress && xhr.upload) {
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            onProgress(percentComplete);
                        }
                    });
                }
                
                // Handle completion
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (error) {
                            resolve({ success: true, data: xhr.responseText });
                        }
                    } else {
                        try {
                            const error = JSON.parse(xhr.responseText);
                            reject(new Error(error.message || `Upload failed: ${xhr.status}`));
                        } catch (e) {
                            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                        }
                    }
                });
                
                // Handle errors
                xhr.addEventListener('error', () => {
                    reject(new Error('Upload failed: Network error'));
                });
                
                xhr.addEventListener('timeout', () => {
                    reject(new Error('Upload failed: Timeout'));
                });
                
                // Setup request
                xhr.open('POST', config.baseUrl + url);
                xhr.timeout = config.timeout;
                xhr.withCredentials = true;
                
                // Send data
                if (data instanceof FormData) {
                    xhr.send(data);
                } else {
                    const formData = new FormData();
                    formData.append('file', data);
                    xhr.send(formData);
                }
            });
        },
        
        /**
         * Make request with custom options
         * @param {string} url - Request URL
         * @param {Object} options - Request options
         * @returns {Promise} Response promise
         */
        async request(url, options) {
            return makeRequest(url, options);
        },
        
        /**
         * Cancel all pending requests
         */
        cancelAll() {
            // This would be implemented with a request registry
            console.warn('Cancel all requests not implemented yet');
        },
        
        /**
         * Get current configuration
         * @returns {Object} Current configuration
         */
        getConfig() {
            return { ...config };
        }
    };
})();

// Add default error handling interceptor
API.addResponseInterceptor(async (response) => {
    if (response.status === 401) {
        // Unauthorized - redirect to login
        if (window.location.pathname !== '/auth/login.html') {
            window.location.href = '/auth/login.html';
        }
    } else if (response.status === 403) {
        // Forbidden
        showNotification('Access denied', 'error');
    } else if (response.status >= 500) {
        // Server error
        showNotification('Server error occurred', 'error');
    }
});

// Add loading indicator interceptor
let activeRequests = 0;
API.addRequestInterceptor(async (options) => {
    activeRequests++;
    document.body.classList.add('api-loading');
});

API.addResponseInterceptor(async (response) => {
    activeRequests--;
    if (activeRequests === 0) {
        document.body.classList.remove('api-loading');
    }
});

// Add loading styles
const style = document.createElement('style');
style.textContent = `
    .api-loading {
        cursor: wait;
    }
    
    .api-loading * {
        pointer-events: none;
    }
    
    .api-loading .btn {
        opacity: 0.7;
    }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}

// Make available globally
window.API = API;