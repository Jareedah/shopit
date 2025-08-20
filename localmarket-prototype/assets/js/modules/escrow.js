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
    
    return {
        // Simulate payment processing
        simulatePayment(orderId, amount, currency = 'USD') {
            return new Promise((resolve) => {
                showNotification('💳 Processing payment...', 'info');
                
                // Show loading state
                this.showPaymentLoading();
                
                setTimeout(() => {
                    // Show confirmation
                    this.showPaymentConfirmation(amount, currency);
                    
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
        
        // Show payment confirmation screen
        showPaymentConfirmation(amount, currency = 'USD') {
            const confirmationHtml = `
                <div class="payment-confirmation">
                    <h3>Payment Secured!</h3>
                    <p>Your payment has been successfully secured in escrow</p>
                    <div class="payment-amount">$${amount} ${currency}</div>
                    <p>Funds will be released to the seller upon completion</p>
                </div>
            `;
            
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
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    };
}