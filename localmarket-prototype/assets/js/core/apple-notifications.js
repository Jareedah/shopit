/**
 * Apple-Themed Notification System
 * Unified popup and notification system with Apple aesthetics
 */

class AppleNotifications {
    constructor() {
        this.activeNotifications = new Set();
        this.notificationContainer = null;
        this.init();
    }

    init() {
        // Create notification container
        this.createNotificationContainer();
        
        // Add Apple notification styles
        this.addAppleStyles();
    }

    createNotificationContainer() {
        if (document.getElementById('apple-notification-container')) return;
        
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'apple-notification-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(this.notificationContainer);
    }

    addAppleStyles() {
        if (document.getElementById('apple-notification-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'apple-notification-styles';
        styles.textContent = `
            .apple-notification {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border-radius: var(--apple-radius-lg, 14px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                border: 1px solid rgba(0, 0, 0, 0.05);
                padding: 16px 20px;
                font-family: var(--apple-font-family, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif);
                font-size: 15px;
                font-weight: 500;
                color: var(--apple-text-primary, #1C1C1E);
                pointer-events: auto;
                transform: translateX(100%);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                max-width: 400px;
            }
            
            .apple-notification.show {
                transform: translateX(0);
            }
            
            .apple-notification.success {
                background: rgba(52, 199, 89, 0.9);
                color: white;
            }
            
            .apple-notification.error {
                background: rgba(255, 59, 48, 0.9);
                color: white;
            }
            
            .apple-notification.warning {
                background: rgba(255, 149, 0, 0.9);
                color: white;
            }
            
            .apple-notification.info {
                background: rgba(0, 122, 255, 0.9);
                color: white;
            }
            
            .apple-notification-icon {
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .apple-notification-content {
                flex: 1;
            }
            
            .apple-notification-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .apple-notification-message {
                font-size: 14px;
                opacity: 0.9;
            }
            
            .apple-notification-actions {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }
            
            .apple-notification-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .apple-notification-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }
            
            /* Modal Styles */
            .apple-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                pointer-events: none;
            }
            
            .apple-modal-overlay.show {
                opacity: 1;
                pointer-events: auto;
            }
            
            .apple-modal {
                background: white;
                border-radius: var(--apple-radius-xl, 18px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                max-width: 400px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: scale(0.9);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }
            
            .apple-modal-overlay.show .apple-modal {
                transform: scale(1);
            }
            
            .apple-modal-header {
                padding: 24px 24px 16px;
                text-align: center;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .apple-modal-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .apple-modal-title {
                font-size: 20px;
                font-weight: 700;
                color: var(--apple-text-primary, #1C1C1E);
                margin-bottom: 8px;
            }
            
            .apple-modal-subtitle {
                font-size: 15px;
                color: var(--apple-text-secondary, #3A3A3C);
            }
            
            .apple-modal-content {
                padding: 20px 24px;
            }
            
            .apple-modal-actions {
                padding: 16px 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: center;
            }
            
            .apple-modal-btn {
                flex: 1;
                padding: 12px 20px;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                min-height: 44px;
            }
            
            .apple-modal-btn.primary {
                background: var(--apple-blue, #007AFF);
                color: white;
            }
            
            .apple-modal-btn.secondary {
                background: var(--apple-gray-light, #F2F2F7);
                color: var(--apple-text-primary, #1C1C1E);
            }
            
            .apple-modal-btn:hover {
                transform: scale(1.02);
            }
            
            @media (max-width: 768px) {
                .apple-notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    right: 10px;
                }
                
                .apple-notification {
                    min-width: auto;
                    max-width: none;
                }
                
                .apple-modal {
                    width: 95%;
                    margin: 20px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Success notification
    success(title, message, options = {}) {
        return this.show({
            type: 'success',
            icon: 'ph-check-circle',
            title,
            message,
            duration: options.duration || 4000,
            ...options
        });
    }

    // Error notification
    error(title, message, options = {}) {
        return this.show({
            type: 'error',
            icon: 'ph-x-circle',
            title,
            message,
            duration: options.duration || 6000,
            ...options
        });
    }

    // Warning notification
    warning(title, message, options = {}) {
        return this.show({
            type: 'warning',
            icon: 'ph-warning-circle',
            title,
            message,
            duration: options.duration || 5000,
            ...options
        });
    }

    // Info notification
    info(title, message, options = {}) {
        return this.show({
            type: 'info',
            icon: 'ph-info',
            title,
            message,
            duration: options.duration || 4000,
            ...options
        });
    }

    // Generic notification
    show(options) {
        const notification = document.createElement('div');
        notification.className = `apple-notification ${options.type || 'info'}`;
        
        const iconHtml = options.icon ? `<i class="${options.icon} apple-notification-icon"></i>` : '';
        const titleHtml = options.title ? `<div class="apple-notification-title">${options.title}</div>` : '';
        const messageHtml = options.message ? `<div class="apple-notification-message">${options.message}</div>` : '';
        
        notification.innerHTML = `
            ${iconHtml}
            <div class="apple-notification-content">
                ${titleHtml}
                ${messageHtml}
            </div>
        `;

        this.notificationContainer.appendChild(notification);
        this.activeNotifications.add(notification);

        // Show with animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide
        if (options.duration > 0) {
            setTimeout(() => {
                this.hide(notification);
            }, options.duration);
        }

        return notification;
    }

    // Hide notification
    hide(notification) {
        if (!notification || !this.activeNotifications.has(notification)) return;
        
        notification.classList.remove('show');
        this.activeNotifications.delete(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Confirmation modal
    confirm(options) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'apple-modal-overlay';
            
            const iconHtml = options.icon ? `<i class="${options.icon} apple-modal-icon" style="color: ${options.iconColor || 'var(--apple-blue, #007AFF)'}"></i>` : '';
            
            overlay.innerHTML = `
                <div class="apple-modal">
                    <div class="apple-modal-header">
                        ${iconHtml}
                        <div class="apple-modal-title">${options.title || 'Confirm Action'}</div>
                        <div class="apple-modal-subtitle">${options.message || 'Are you sure you want to continue?'}</div>
                    </div>
                    ${options.content ? `<div class="apple-modal-content">${options.content}</div>` : ''}
                    <div class="apple-modal-actions">
                        <button class="apple-modal-btn secondary" data-action="cancel">
                            ${options.cancelText || 'Cancel'}
                        </button>
                        <button class="apple-modal-btn primary" data-action="confirm">
                            ${options.confirmText || 'Confirm'}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Show with animation
            requestAnimationFrame(() => {
                overlay.classList.add('show');
            });

            // Handle actions
            overlay.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'confirm') {
                    resolve(true);
                    this.hideModal(overlay);
                } else if (action === 'cancel' || e.target === overlay) {
                    resolve(false);
                    this.hideModal(overlay);
                }
            });
        });
    }

    // Progress modal
    progress(options) {
        const overlay = document.createElement('div');
        overlay.className = 'apple-modal-overlay';
        
        overlay.innerHTML = `
            <div class="apple-modal">
                <div class="apple-modal-header">
                    <i class="ph-spinner apple-modal-icon" style="color: var(--apple-blue, #007AFF); animation: spin 1s linear infinite;"></i>
                    <div class="apple-modal-title">${options.title || 'Processing'}</div>
                    <div class="apple-modal-subtitle">${options.message || 'Please wait...'}</div>
                </div>
                ${options.showProgress ? `
                    <div class="apple-modal-content">
                        <div style="background: var(--apple-gray-light, #F2F2F7); height: 4px; border-radius: 2px; overflow: hidden;">
                            <div id="apple-progress-bar" style="background: var(--apple-blue, #007AFF); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(overlay);

        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        return {
            overlay,
            updateProgress: (percent) => {
                const bar = overlay.querySelector('#apple-progress-bar');
                if (bar) bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
            },
            close: () => this.hideModal(overlay)
        };
    }

    hideModal(overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }

    // Clear all notifications
    clearAll() {
        this.activeNotifications.forEach(notification => {
            this.hide(notification);
        });
    }
}

// Global instance
window.AppleNotifications = new AppleNotifications();

// Convenience functions
window.showAppleNotification = {
    success: (title, message, options) => window.AppleNotifications.success(title, message, options),
    error: (title, message, options) => window.AppleNotifications.error(title, message, options),
    warning: (title, message, options) => window.AppleNotifications.warning(title, message, options),
    info: (title, message, options) => window.AppleNotifications.info(title, message, options),
    confirm: (options) => window.AppleNotifications.confirm(options),
    progress: (options) => window.AppleNotifications.progress(options)
};

// Backward compatibility - replace old showNotification calls
window.showNotification = (message, type = 'info') => {
    const title = type === 'success' ? 'Success' : 
                  type === 'error' ? 'Error' : 
                  type === 'warning' ? 'Warning' : 'Info';
    window.AppleNotifications[type](title, message);
};

// Add spinner animation
const spinnerStyles = document.createElement('style');
spinnerStyles.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(spinnerStyles);