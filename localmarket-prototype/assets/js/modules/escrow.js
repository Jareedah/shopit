// Escrow Payment Playacting Module
const EscrowPlayacting = (function() {
    'use strict';
    
    // Escrow status constants
    const ESCROW_STATUS = {
        PENDING: 'pending',
        FUNDS_HELD: 'funds_held',
        DISPUTED: 'disputed',
        RELEASED: 'released',
        CANCELLED: 'cancelled'
    };
    
    // Escrow timeline steps
    const TIMELINE_STEPS = {
        PAYMENT_INITIATED: 'payment_initiated',
        FUNDS_SECURED: 'funds_secured', 
        ITEM_DELIVERED: 'item_delivered',
        CONFIRMATION_PENDING: 'confirmation_pending',
        FUNDS_RELEASED: 'funds_released'
    };
    
    return {
        // Simulate payment processing
        simulatePayment(orderId, amount, currency = 'USD') {
            return new Promise((resolve) => {
                showNotification('💳 Processing payment...', 'info');
                
                // Show loading state
                this.showPaymentLoading();
                
                setTimeout(() => {
                    // Update order status
                    this.updateOrderEscrowStatus(orderId, ESCROW_STATUS.FUNDS_HELD);
                    
                    // Show confirmation
                    this.showPaymentConfirmation(amount, currency);
                    
                    // Start countdown timer
                    this.startEscrowCountdown(orderId, 72); // 72 hours
                    
                    showNotification(`✅ $${amount} secured in escrow!`, 'success');
                    resolve({
                        success: true,
                        orderId: orderId,
                        amount: amount,
                        status: ESCROW_STATUS.FUNDS_HELD,
                        escrowId: 'escrow_' + Date.now()
                    });
                }, 2000);
            });
        },
        
        // Simulate funds release
        simulateRelease(orderId, sellerId) {
            return new Promise((resolve) => {
                showNotification('🔄 Processing fund release...', 'info');
                
                setTimeout(() => {
                    this.updateOrderEscrowStatus(orderId, ESCROW_STATUS.RELEASED);
                    this.triggerCelebrationAnimation();
                    showNotification('🎉 Funds released to seller!', 'success');
                    
                    resolve({
                        success: true,
                        orderId: orderId,
                        status: ESCROW_STATUS.RELEASED,
                        releasedAt: new Date().toISOString()
                    });
                }, 1500);
            });
        },
        
        // Simulate dispute initiation
        simulateDispute(orderId, reason) {
            return new Promise((resolve) => {
                showNotification('⚠️ Dispute initiated...', 'warning');
                
                setTimeout(() => {
                    this.updateOrderEscrowStatus(orderId, ESCROW_STATUS.DISPUTED);
                    this.showDisputeInterface(orderId, reason);
                    showNotification('🔍 Admin team notified for review', 'info');
                    
                    resolve({
                        success: true,
                        orderId: orderId,
                        status: ESCROW_STATUS.DISPUTED,
                        disputeId: 'dispute_' + Date.now(),
                        reason: reason
                    });
                }, 1000);
            });
        },
        
        // Show payment confirmation screen
        showPaymentConfirmation(amount, currency = 'USD') {
            const confirmationHtml = `
                <div class="payment-confirmation">
                    <div class="payment-confirmation-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <h3>Payment Secured!</h3>
                    <p>Your payment has been successfully secured in escrow</p>
                    <div class="payment-amount">$${amount} ${currency}</div>
                    <p class="text-sm">Funds will be released to the seller upon completion</p>
                </div>
            `;
            
            // Find container and insert confirmation
            const container = document.getElementById('paymentConfirmation') || 
                            document.querySelector('.checkout-summary');
            
            if (container) {
                container.innerHTML = confirmationHtml;
            }
        },
        
        // Show payment loading state
        showPaymentLoading() {
            const loadingHtml = `
                <div class="payment-loading">
                    <div class="loading-spinner"></div>
                    <p>Securing your payment...</p>
                </div>
            `;
            
            const container = document.getElementById('paymentConfirmation') || 
                            document.querySelector('.checkout-summary');
            
            if (container) {
                container.innerHTML = loadingHtml;
            }
        },
        
        // Create escrow status badge
        createStatusBadge(status) {
            const badges = {
                [ESCROW_STATUS.PENDING]: { text: 'Payment Pending', icon: '⏳' },
                [ESCROW_STATUS.FUNDS_HELD]: { text: 'Funds Secured', icon: '🔒' },
                [ESCROW_STATUS.DISPUTED]: { text: 'Under Dispute', icon: '⚠️' },
                [ESCROW_STATUS.RELEASED]: { text: 'Completed', icon: '✅' },
                [ESCROW_STATUS.CANCELLED]: { text: 'Cancelled', icon: '❌' }
            };
            
            const badge = badges[status] || badges[ESCROW_STATUS.PENDING];
            
            return `
                <span class="escrow-badge ${status}">
                    <span>${badge.icon}</span>
                    <span>${badge.text}</span>
                </span>
            `;
        },
        
        // Create escrow timeline
        createEscrowTimeline(orderId, currentStatus) {
            const steps = [
                {
                    id: TIMELINE_STEPS.PAYMENT_INITIATED,
                    title: 'Payment Initiated',
                    description: 'Customer submitted payment for escrow',
                    icon: '💳',
                    timestamp: new Date().toISOString()
                },
                {
                    id: TIMELINE_STEPS.FUNDS_SECURED,
                    title: 'Funds Secured',
                    description: 'Payment held safely in escrow account',
                    icon: '🔒',
                    timestamp: currentStatus === ESCROW_STATUS.FUNDS_HELD ? new Date().toISOString() : null
                },
                {
                    id: TIMELINE_STEPS.ITEM_DELIVERED,
                    title: 'Item Delivered',
                    description: 'Seller marked item as delivered',
                    icon: '📦',
                    timestamp: null
                },
                {
                    id: TIMELINE_STEPS.CONFIRMATION_PENDING,
                    title: 'Confirmation Pending',
                    description: 'Waiting for buyer confirmation (72h window)',
                    icon: '⏰',
                    timestamp: null
                },
                {
                    id: TIMELINE_STEPS.FUNDS_RELEASED,
                    title: 'Funds Released',
                    description: 'Payment released to seller',
                    icon: '🎉',
                    timestamp: currentStatus === ESCROW_STATUS.RELEASED ? new Date().toISOString() : null
                }
            ];
            
            let timelineHtml = '<div class="escrow-timeline">';
            
            steps.forEach((step, index) => {
                let iconClass = 'future';
                
                if (step.timestamp) {
                    iconClass = 'completed';
                } else if (this.isCurrentStep(step.id, currentStatus)) {
                    iconClass = 'current';
                }
                
                timelineHtml += `
                    <div class="timeline-item">
                        <div class="timeline-icon ${iconClass}">
                            ${step.icon}
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">${step.title}</div>
                            <div class="timeline-description">${step.description}</div>
                            ${step.timestamp ? `<div class="timeline-timestamp">${this.formatTimestamp(step.timestamp)}</div>` : ''}
                        </div>
                    </div>
                `;
            });
            
            timelineHtml += '</div>';
            return timelineHtml;
        },
        
        // Start escrow countdown timer
        startEscrowCountdown(orderId, hours) {
            const endTime = new Date(Date.now() + (hours * 60 * 60 * 1000));
            const countdownContainer = document.getElementById('escrowCountdown');
            
            if (!countdownContainer) return;
            
            const updateCountdown = () => {
                const now = new Date().getTime();
                const timeLeft = endTime.getTime() - now;
                
                if (timeLeft <= 0) {
                    this.handleCountdownExpired(orderId);
                    return;
                }
                
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                countdownContainer.innerHTML = `
                    <div class="escrow-countdown">
                        <div class="countdown-item">
                            <span class="countdown-number">${hoursLeft}</span>
                            <span class="countdown-label">Hours</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${minutesLeft}</span>
                            <span class="countdown-label">Minutes</span>
                        </div>
                        <div class="countdown-item">
                            <span class="countdown-number">${secondsLeft}</span>
                            <span class="countdown-label">Seconds</span>
                        </div>
                    </div>
                    <p class="text-center text-sm text-gray-600 mt-2">
                        Auto-release countdown (unless disputed)
                    </p>
                `;
            };
            
            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            
            // Store interval for cleanup
            window.escrowCountdowns = window.escrowCountdowns || {};
            window.escrowCountdowns[orderId] = interval;
        },
        
        // Show dispute interface
        showDisputeInterface(orderId, reason) {
            const disputeHtml = `
                <div class="dispute-panel">
                    <div class="dispute-header">
                        <div class="dispute-icon">⚠️</div>
                        <h4 class="dispute-title">Dispute Initiated</h4>
                    </div>
                    <div class="dispute-description">
                        <strong>Reason:</strong> ${reason}
                    </div>
                    <p class="text-sm text-gray-600 mb-4">
                        Our admin team has been notified and will review this dispute within 24 hours.
                        Both parties will be contacted for additional information if needed.
                    </p>
                    <div class="dispute-actions">
                        <button class="btn btn-secondary" onclick="EscrowPlayacting.viewDisputeDetails('${orderId}')">
                            View Details
                        </button>
                        <button class="btn btn-primary" onclick="EscrowPlayacting.contactSupport('${orderId}')">
                            Contact Support
                        </button>
                    </div>
                </div>
            `;
            
            const container = document.getElementById('disputeContainer') ||
                            document.querySelector('.order-details');
            
            if (container) {
                container.insertAdjacentHTML('beforeend', disputeHtml);
            }
        },
        
        // Trigger celebration animation
        triggerCelebrationAnimation() {
            const elements = document.querySelectorAll('.payment-confirmation, .escrow-badge.released');
            elements.forEach(element => {
                element.classList.add('celebration-animation');
                setTimeout(() => {
                    element.classList.remove('celebration-animation');
                }, 2000);
            });
        },
        
        // Update order escrow status (simulate database update)
        updateOrderEscrowStatus(orderId, status) {
            // In real implementation, this would call API
            // For playacting, we just update UI and local storage
            const orderData = {
                orderId: orderId,
                escrowStatus: status,
                updatedAt: new Date().toISOString()
            };
            
            localStorage.setItem(`escrow_${orderId}`, JSON.stringify(orderData));
            
            // Update any status badges on the page
            const badges = document.querySelectorAll(`[data-order-id="${orderId}"] .escrow-badge`);
            badges.forEach(badge => {
                badge.outerHTML = this.createStatusBadge(status);
            });
        },
        
        // Utility functions
        isCurrentStep(stepId, currentStatus) {
            const statusStepMap = {
                [ESCROW_STATUS.PENDING]: TIMELINE_STEPS.PAYMENT_INITIATED,
                [ESCROW_STATUS.FUNDS_HELD]: TIMELINE_STEPS.FUNDS_SECURED,
                [ESCROW_STATUS.DISPUTED]: TIMELINE_STEPS.CONFIRMATION_PENDING,
                [ESCROW_STATUS.RELEASED]: TIMELINE_STEPS.FUNDS_RELEASED
            };
            
            return statusStepMap[currentStatus] === stepId;
        },
        
        formatTimestamp(timestamp) {
            return new Date(timestamp).toLocaleString();
        },
        
        handleCountdownExpired(orderId) {
            showNotification('⏰ Escrow period expired - Auto-releasing funds', 'info');
            this.simulateRelease(orderId, 'auto_release');
        },
        
        // Placeholder functions for UI interactions
        viewDisputeDetails(orderId) {
            showNotification('📋 Dispute details would open here', 'info');
        },
        
        contactSupport(orderId) {
            showNotification('📞 Support contact form would open here', 'info');
        }
    };
})();

// Global notification function (if not already defined)
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    };
}