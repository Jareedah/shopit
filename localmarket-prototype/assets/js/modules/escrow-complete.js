// Complete Escrow System with Delivery-Based and Instant Completion Flows
const EscrowComplete = (function() {
    'use strict';
    
    // Escrow completion types
    const COMPLETION_TYPES = {
        DELIVERY_BASED: 'delivery_based',    // Buyer confirms delivery
        INSTANT: 'instant'                   // Immediate completion after payment
    };
    
    // Complete escrow stages
    const ESCROW_STAGES = {
        // Payment stages
        PAYMENT_RECEIVED: 'payment_received',
        FUNDS_LOCKED: 'funds_locked',
        
        // Delivery-based flow
        AWAITING_DELIVERY: 'awaiting_delivery',
        ITEM_SHIPPED: 'item_shipped',
        DELIVERY_CONFIRMED: 'delivery_confirmed',
        RELEASE_REQUESTED: 'release_requested',
        FUNDS_RELEASED: 'funds_released',
        
        // Instant completion flow
        INSTANT_COMPLETE: 'instant_complete',
        
        // Dispute flow
        DISPUTE_INITIATED: 'dispute_initiated',
        DISPUTE_RESPONSE_PENDING: 'dispute_response_pending',
        DISPUTE_UNDER_REVIEW: 'dispute_under_review',
        DISPUTE_RESOLVED: 'dispute_resolved',
        
        // Final states
        TRANSACTION_COMPLETE: 'transaction_complete',
        REFUNDED: 'refunded'
    };
    
    return {
        // Initialize escrow for order based on completion type
        initializeEscrow(order, completionType = COMPLETION_TYPES.DELIVERY_BASED) {
            const escrowData = {
                orderId: order.id,
                completionType: completionType,
                stage: ESCROW_STAGES.PAYMENT_RECEIVED,
                fundsAmount: order.total_amount,
                sellerAmount: order.seller_amount || (order.total_amount * 0.98), // 2% platform fee
                platformFee: order.total_amount - (order.seller_amount || (order.total_amount * 0.98)),
                createdAt: new Date().toISOString(),
                disputeDeadline: null,
                releaseDeadline: null
            };
            
            // Store escrow data
            this.storeEscrowData(escrowData);
            
            if (completionType === COMPLETION_TYPES.INSTANT) {
                // Instant completion - immediately release funds
                setTimeout(() => {
                    this.completeInstantTransaction(order.id);
                }, 2000);
            } else {
                // Delivery-based - advance to awaiting delivery
                setTimeout(() => {
                    this.advanceToAwaitingDelivery(order.id);
                }, 3000);
            }
            
            return escrowData;
        },
        
        // Advance to awaiting delivery stage
        async advanceToAwaitingDelivery(orderId) {
            try {
                await this.updateEscrowStage(orderId, ESCROW_STAGES.AWAITING_DELIVERY);
                showNotification('📦 Escrow secured! Seller can now manage the order.', 'success');
                
                // Refresh seller dashboard
                if (typeof SellerOrders !== 'undefined') {
                    SellerOrders.refreshOrders();
                }
            } catch (error) {
                console.error('Error advancing to awaiting delivery:', error);
            }
        },
        
        // Seller confirms order and starts fulfillment
        async sellerConfirmOrder(orderId) {
            try {
                showNotification('✅ Confirming order...', 'info');
                
                await this.updateEscrowStage(orderId, ESCROW_STAGES.AWAITING_DELIVERY);
                await this.updateOrderStatus(orderId, 'confirmed');
                
                showNotification('Order confirmed! You can now prepare and ship the item.', 'success');
                return { success: true };
            } catch (error) {
                showNotification('Error confirming order: ' + error.message, 'error');
                return { success: false, error: error.message };
            }
        },
        
        // Seller marks item as shipped
        async sellerMarkShipped(orderId, trackingNumber = null) {
            try {
                showNotification('🚚 Marking as shipped...', 'info');
                
                await this.updateEscrowStage(orderId, ESCROW_STAGES.ITEM_SHIPPED);
                await this.updateOrderStatus(orderId, 'shipped');
                
                // Set release deadline (72 hours from shipping)
                const releaseDeadline = new Date(Date.now() + (72 * 60 * 60 * 1000));
                await this.setReleaseDeadline(orderId, releaseDeadline);
                
                showNotification(`Item marked as shipped! ${trackingNumber ? 'Tracking: ' + trackingNumber : ''} Buyer has 72 hours to confirm delivery.`, 'success');
                return { success: true };
            } catch (error) {
                showNotification('Error marking as shipped: ' + error.message, 'error');
                return { success: false, error: error.message };
            }
        },
        
        // Buyer confirms delivery
        async buyerConfirmDelivery(orderId) {
            try {
                showNotification('✅ Confirming delivery...', 'info');
                
                await this.updateEscrowStage(orderId, ESCROW_STAGES.DELIVERY_CONFIRMED);
                await this.updateOrderStatus(orderId, 'delivered');
                
                // Start fund release process
                setTimeout(() => {
                    this.releaseFundsToSeller(orderId);
                }, 2000);
                
                showNotification('Delivery confirmed! Funds will be released to seller.', 'success');
                return { success: true };
            } catch (error) {
                showNotification('Error confirming delivery: ' + error.message, 'error');
                return { success: false, error: error.message };
            }
        },
        
        // Seller requests fund release
        async sellerRequestRelease(orderId) {
            try {
                showNotification('💰 Requesting fund release...', 'info');
                
                await this.updateEscrowStage(orderId, ESCROW_STAGES.RELEASE_REQUESTED);
                
                // Set deadline for buyer response (48 hours)
                const responseDeadline = new Date(Date.now() + (48 * 60 * 60 * 1000));
                await this.setDisputeDeadline(orderId, responseDeadline);
                
                showNotification('Fund release requested! Buyer has 48 hours to approve or dispute.', 'success');
                return { success: true };
            } catch (error) {
                showNotification('Error requesting fund release: ' + error.message, 'error');
                return { success: false, error: error.message };
            }
        },
        
        // Buyer approves fund release
        async buyerApproveRelease(orderId) {
            try {
                showNotification('✅ Approving fund release...', 'info');
                
                await this.releaseFundsToSeller(orderId);
                
                showNotification('Fund release approved! Payment is being processed to seller.', 'success');
                return { success: true };
            } catch (error) {
                showNotification('Error approving release: ' + error.message, 'error');
                return { success: false, error: error.message };
            }
        },
        
        // Release funds to seller
        async releaseFundsToSeller(orderId) {
            try {
                await this.updateEscrowStage(orderId, ESCROW_STAGES.FUNDS_RELEASED);
                await this.updateOrderStatus(orderId, 'completed');
                
                // Trigger celebration animation
                if (typeof EscrowPlayacting !== 'undefined') {
                    EscrowPlayacting.triggerCelebrationAnimation();
                }
                
                setTimeout(() => {
                    this.completeTransaction(orderId);
                }, 2000);
                
                showNotification('🎉 Funds released to seller! Transaction completing...', 'success');
            } catch (error) {
                console.error('Error releasing funds:', error);
            }
        },
        
        // Complete instant transaction
        async completeInstantTransaction(orderId) {
            try {
                await this.updateEscrowStage(orderId, ESCROW_STAGES.INSTANT_COMPLETE);
                await this.updateOrderStatus(orderId, 'completed');
                
                showNotification('🎉 Instant transaction completed! Funds released to seller.', 'success');
                
                setTimeout(() => {
                    this.completeTransaction(orderId);
                }, 1000);
            } catch (error) {
                console.error('Error completing instant transaction:', error);
            }
        },
        
        // Initiate dispute
        async initiateDispute(orderId, initiatedBy, reason) {
            try {
                showNotification('⚠️ Initiating dispute...', 'info');
                
                await this.updateEscrowStage(orderId, ESCROW_STAGES.DISPUTE_INITIATED);
                
                // Set deadline for other party response (48 hours)
                const responseDeadline = new Date(Date.now() + (48 * 60 * 60 * 1000));
                await this.setDisputeDeadline(orderId, responseDeadline);
                
                const disputeData = {
                    orderId: orderId,
                    initiatedBy: initiatedBy,
                    reason: reason,
                    initiatedAt: new Date().toISOString(),
                    responseDeadline: responseDeadline.toISOString(),
                    status: 'pending_response'
                };
                
                this.storeDisputeData(disputeData);
                
                showNotification('🔍 Dispute initiated! Other party has 48 hours to respond. Admin team notified.', 'info');
                return { success: true };
            } catch (error) {
                showNotification('Error initiating dispute: ' + error.message, 'error');
                return { success: false, error: error.message };
            }
        },
        
        // Get seller actions based on escrow stage
        getSellerActions(order) {
            const escrowData = this.getEscrowData(order.id);
            const stage = escrowData ? escrowData.stage : ESCROW_STAGES.PAYMENT_RECEIVED;
            const actions = [];
            
            switch (stage) {
                case ESCROW_STAGES.PAYMENT_RECEIVED:
                case ESCROW_STAGES.FUNDS_LOCKED:
                case ESCROW_STAGES.AWAITING_DELIVERY:
                    actions.push({
                        text: '✅ Confirm & Start Fulfillment',
                        action: `confirmOrder('${order.id}')`,
                        class: 'btn-success',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '❌ Cancel Order',
                        action: `cancelOrder('${order.id}')`,
                        class: 'btn-danger',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.ITEM_SHIPPED:
                    actions.push({
                        text: '🚚 Mark as Shipped',
                        action: `markAsShipped('${order.id}')`,
                        class: 'btn-primary',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '💬 Contact Buyer',
                        action: `contactBuyer('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.DELIVERY_CONFIRMED:
                    actions.push({
                        text: '💰 Request Fund Release',
                        action: `requestFundRelease('${order.id}')`,
                        class: 'btn-success',
                        priority: 'primary'
                    });
                    break;
                    
                case ESCROW_STAGES.RELEASE_REQUESTED:
                    actions.push({
                        text: '⏰ Awaiting Buyer Response',
                        action: 'null',
                        class: 'btn-disabled',
                        priority: 'primary',
                        disabled: true
                    });
                    actions.push({
                        text: '🔍 Initiate Dispute',
                        action: `initiateDispute('${order.id}', 'seller')`,
                        class: 'btn-warning',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.FUNDS_RELEASED:
                case ESCROW_STAGES.TRANSACTION_COMPLETE:
                    actions.push({
                        text: '🎉 Transaction Complete',
                        action: 'null',
                        class: 'btn-disabled',
                        priority: 'primary',
                        disabled: true
                    });
                    actions.push({
                        text: '📊 View Analytics',
                        action: `viewAnalytics('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.DISPUTE_INITIATED:
                    actions.push({
                        text: '🔍 Respond to Dispute',
                        action: `respondToDispute('${order.id}')`,
                        class: 'btn-warning',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '📞 Contact Admin',
                        action: `contactAdmin('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
            }
            
            return actions;
        },
        
        // Get buyer actions based on escrow stage
        getBuyerActions(order) {
            const escrowData = this.getEscrowData(order.id);
            const stage = escrowData ? escrowData.stage : ESCROW_STAGES.PAYMENT_RECEIVED;
            const actions = [];
            
            switch (stage) {
                case ESCROW_STAGES.PAYMENT_RECEIVED:
                case ESCROW_STAGES.FUNDS_LOCKED:
                    actions.push({
                        text: '🔒 Payment Secured',
                        action: 'null',
                        class: 'btn-disabled',
                        priority: 'primary',
                        disabled: true
                    });
                    break;
                    
                case ESCROW_STAGES.AWAITING_DELIVERY:
                    actions.push({
                        text: '⏳ Waiting for Seller',
                        action: 'null',
                        class: 'btn-disabled',
                        priority: 'primary',
                        disabled: true
                    });
                    actions.push({
                        text: '💬 Contact Seller',
                        action: `contactSeller('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.ITEM_SHIPPED:
                    actions.push({
                        text: '📦 Track Package',
                        action: `trackPackage('${order.id}')`,
                        class: 'btn-primary',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '✅ Confirm Delivery',
                        action: `confirmDelivery('${order.id}')`,
                        class: 'btn-success',
                        priority: 'primary'
                    });
                    break;
                    
                case ESCROW_STAGES.DELIVERY_CONFIRMED:
                    actions.push({
                        text: '🎉 Delivery Confirmed',
                        action: 'null',
                        class: 'btn-disabled',
                        priority: 'primary',
                        disabled: true
                    });
                    break;
                    
                case ESCROW_STAGES.RELEASE_REQUESTED:
                    actions.push({
                        text: '✅ Approve Release',
                        action: `approveRelease('${order.id}')`,
                        class: 'btn-success',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '⚠️ Dispute Release',
                        action: `initiateDispute('${order.id}', 'buyer')`,
                        class: 'btn-warning',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.FUNDS_RELEASED:
                case ESCROW_STAGES.TRANSACTION_COMPLETE:
                    actions.push({
                        text: '⭐ Leave Review',
                        action: `leaveReview('${order.id}')`,
                        class: 'btn-primary',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '🔄 Buy Again',
                        action: `buyAgain('${order.listingId}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.DISPUTE_INITIATED:
                    actions.push({
                        text: '🔍 Respond to Dispute',
                        action: `respondToDispute('${order.id}')`,
                        class: 'btn-warning',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '📞 Contact Admin',
                        action: `contactAdmin('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
            }
            
            return actions;
        },
        
        // Create escrow status badge
        createEscrowBadge(stage) {
            const stageInfo = {
                [ESCROW_STAGES.PAYMENT_RECEIVED]: { text: 'Payment Received', icon: '💳', color: '#3b82f6' },
                [ESCROW_STAGES.FUNDS_LOCKED]: { text: 'Funds Secured', icon: '🔒', color: '#059669' },
                [ESCROW_STAGES.AWAITING_DELIVERY]: { text: 'Awaiting Delivery', icon: '📦', color: '#f59e0b' },
                [ESCROW_STAGES.ITEM_SHIPPED]: { text: 'Item Shipped', icon: '🚚', color: '#06b6d4' },
                [ESCROW_STAGES.DELIVERY_CONFIRMED]: { text: 'Delivery Confirmed', icon: '✅', color: '#10b981' },
                [ESCROW_STAGES.RELEASE_REQUESTED]: { text: 'Release Requested', icon: '💰', color: '#f59e0b' },
                [ESCROW_STAGES.FUNDS_RELEASED]: { text: 'Funds Released', icon: '💰', color: '#059669' },
                [ESCROW_STAGES.INSTANT_COMPLETE]: { text: 'Instant Complete', icon: '⚡', color: '#059669' },
                [ESCROW_STAGES.TRANSACTION_COMPLETE]: { text: 'Complete', icon: '🎉', color: '#059669' },
                [ESCROW_STAGES.DISPUTE_INITIATED]: { text: 'Under Dispute', icon: '⚠️', color: '#dc2626' },
                [ESCROW_STAGES.REFUNDED]: { text: 'Refunded', icon: '💸', color: '#6b7280' }
            };
            
            const info = stageInfo[stage] || stageInfo[ESCROW_STAGES.PAYMENT_RECEIVED];
            
            return `
                <span class="escrow-badge" style="
                    background-color: ${info.color};
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                ">
                    ${info.icon} ${info.text}
                </span>
            `;
        },
        
        // Utility functions for data management
        storeEscrowData(escrowData) {
            const allEscrowData = JSON.parse(localStorage.getItem('escrowData') || '{}');
            allEscrowData[escrowData.orderId] = escrowData;
            localStorage.setItem('escrowData', JSON.stringify(allEscrowData));
        },
        
        getEscrowData(orderId) {
            const allEscrowData = JSON.parse(localStorage.getItem('escrowData') || '{}');
            return allEscrowData[orderId] || null;
        },
        
        async updateEscrowStage(orderId, newStage) {
            const escrowData = this.getEscrowData(orderId);
            if (escrowData) {
                escrowData.stage = newStage;
                escrowData.updatedAt = new Date().toISOString();
                this.storeEscrowData(escrowData);
            }
        },
        
        async updateOrderStatus(orderId, newStatus) {
            // Call the global order update API
            try {
                const response = await fetch('../api/orders/update-status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: newStatus
                    })
                });
                
                const result = await response.json();
                return result.success;
            } catch (error) {
                console.error('Error updating order status:', error);
                return false;
            }
        },
        
        async setReleaseDeadline(orderId, deadline) {
            const escrowData = this.getEscrowData(orderId);
            if (escrowData) {
                escrowData.releaseDeadline = deadline.toISOString();
                this.storeEscrowData(escrowData);
            }
        },
        
        async setDisputeDeadline(orderId, deadline) {
            const escrowData = this.getEscrowData(orderId);
            if (escrowData) {
                escrowData.disputeDeadline = deadline.toISOString();
                this.storeEscrowData(escrowData);
            }
        },
        
        storeDisputeData(disputeData) {
            const allDisputes = JSON.parse(localStorage.getItem('disputes') || '[]');
            allDisputes.push(disputeData);
            localStorage.setItem('disputes', JSON.stringify(allDisputes));
        },
        
        async completeTransaction(orderId) {
            await this.updateEscrowStage(orderId, ESCROW_STAGES.TRANSACTION_COMPLETE);
            showNotification('🎉 Transaction completed successfully!', 'success');
            
            // Refresh all relevant interfaces
            if (typeof SellerOrders !== 'undefined') {
                SellerOrders.refreshOrders();
            }
        }
    };
})();