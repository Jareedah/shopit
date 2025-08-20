// Complete Escrow Workflow Management System
const EscrowWorkflow = (function() {
    'use strict';
    
    // Complete escrow workflow stages
    const ESCROW_STAGES = {
        // Stage 1: Payment Processing
        PAYMENT_PENDING: 'payment_pending',
        PAYMENT_PROCESSING: 'payment_processing',
        FUNDS_SECURED: 'funds_secured',
        
        // Stage 2: Order Fulfillment
        SELLER_NOTIFIED: 'seller_notified',
        ORDER_CONFIRMED: 'order_confirmed',
        ITEM_PREPARING: 'item_preparing',
        ITEM_SHIPPED: 'item_shipped',
        
        // Stage 3: Delivery & Confirmation
        ITEM_DELIVERED: 'item_delivered',
        CONFIRMATION_PENDING: 'confirmation_pending',
        
        // Stage 4: Completion or Dispute
        BUYER_CONFIRMED: 'buyer_confirmed',
        FUNDS_RELEASED: 'funds_released',
        TRANSACTION_COMPLETE: 'transaction_complete',
        
        // Alternative flows
        DISPUTED: 'disputed',
        DISPUTE_RESOLVED: 'dispute_resolved',
        CANCELLED: 'cancelled',
        REFUNDED: 'refunded'
    };
    
    // Order status mapping to escrow stages
    const ORDER_TO_ESCROW_MAP = {
        'pending': ESCROW_STAGES.SELLER_NOTIFIED,
        'confirmed': ESCROW_STAGES.ORDER_CONFIRMED,
        'processing': ESCROW_STAGES.ITEM_PREPARING,
        'shipped': ESCROW_STAGES.ITEM_SHIPPED,
        'delivered': ESCROW_STAGES.ITEM_DELIVERED,
        'completed': ESCROW_STAGES.TRANSACTION_COMPLETE,
        'cancelled': ESCROW_STAGES.CANCELLED,
        'disputed': ESCROW_STAGES.DISPUTED
    };
    
    return {
        // Get escrow stage for order status
        getEscrowStage(orderStatus, escrowStatus = null) {
            if (escrowStatus) {
                return escrowStatus;
            }
            return ORDER_TO_ESCROW_MAP[orderStatus] || ESCROW_STAGES.PAYMENT_PENDING;
        },
        
        // Get stage display information
        getStageInfo(stage) {
            const stageInfo = {
                [ESCROW_STAGES.PAYMENT_PENDING]: {
                    title: 'Payment Pending',
                    description: 'Waiting for payment processing',
                    icon: '⏳',
                    color: '#f59e0b',
                    category: 'payment'
                },
                [ESCROW_STAGES.PAYMENT_PROCESSING]: {
                    title: 'Processing Payment',
                    description: 'Securing payment in escrow',
                    icon: '💳',
                    color: '#3b82f6',
                    category: 'payment'
                },
                [ESCROW_STAGES.FUNDS_SECURED]: {
                    title: 'Funds Secured',
                    description: 'Payment safely held in escrow',
                    icon: '🔒',
                    color: '#059669',
                    category: 'payment'
                },
                [ESCROW_STAGES.SELLER_NOTIFIED]: {
                    title: 'Seller Notified',
                    description: 'Waiting for seller confirmation',
                    icon: '📧',
                    color: '#f59e0b',
                    category: 'fulfillment'
                },
                [ESCROW_STAGES.ORDER_CONFIRMED]: {
                    title: 'Order Confirmed',
                    description: 'Seller confirmed the order',
                    icon: '✅',
                    color: '#3b82f6',
                    category: 'fulfillment'
                },
                [ESCROW_STAGES.ITEM_PREPARING]: {
                    title: 'Preparing Item',
                    description: 'Seller is preparing your item',
                    icon: '📦',
                    color: '#8b5cf6',
                    category: 'fulfillment'
                },
                [ESCROW_STAGES.ITEM_SHIPPED]: {
                    title: 'Item Shipped',
                    description: 'Item is on its way to you',
                    icon: '🚚',
                    color: '#06b6d4',
                    category: 'delivery'
                },
                [ESCROW_STAGES.ITEM_DELIVERED]: {
                    title: 'Item Delivered',
                    description: 'Item delivered - awaiting confirmation',
                    icon: '📦',
                    color: '#10b981',
                    category: 'delivery'
                },
                [ESCROW_STAGES.CONFIRMATION_PENDING]: {
                    title: 'Confirmation Pending',
                    description: '72-hour confirmation window active',
                    icon: '⏰',
                    color: '#f59e0b',
                    category: 'confirmation'
                },
                [ESCROW_STAGES.BUYER_CONFIRMED]: {
                    title: 'Buyer Confirmed',
                    description: 'Buyer confirmed receipt',
                    icon: '✅',
                    color: '#059669',
                    category: 'confirmation'
                },
                [ESCROW_STAGES.FUNDS_RELEASED]: {
                    title: 'Funds Released',
                    description: 'Payment released to seller',
                    icon: '💰',
                    color: '#059669',
                    category: 'completion'
                },
                [ESCROW_STAGES.TRANSACTION_COMPLETE]: {
                    title: 'Transaction Complete',
                    description: 'Order successfully completed',
                    icon: '🎉',
                    color: '#059669',
                    category: 'completion'
                },
                [ESCROW_STAGES.DISPUTED]: {
                    title: 'Under Dispute',
                    description: 'Dispute initiated - admin review',
                    icon: '⚠️',
                    color: '#dc2626',
                    category: 'dispute'
                },
                [ESCROW_STAGES.CANCELLED]: {
                    title: 'Cancelled',
                    description: 'Order cancelled',
                    icon: '❌',
                    color: '#6b7280',
                    category: 'cancelled'
                },
                [ESCROW_STAGES.REFUNDED]: {
                    title: 'Refunded',
                    description: 'Full refund processed',
                    icon: '💸',
                    color: '#6b7280',
                    category: 'cancelled'
                }
            };
            
            return stageInfo[stage] || stageInfo[ESCROW_STAGES.PAYMENT_PENDING];
        },
        
        // Get seller action buttons for each stage
        getSellerActions(order) {
            const stage = this.getEscrowStage(order.status, order.escrow_status);
            const actions = [];
            
            switch (stage) {
                case ESCROW_STAGES.SELLER_NOTIFIED:
                case ESCROW_STAGES.PAYMENT_PENDING:
                    actions.push({
                        text: '✅ Confirm Order',
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
                    
                case ESCROW_STAGES.ORDER_CONFIRMED:
                case ESCROW_STAGES.FUNDS_SECURED:
                    actions.push({
                        text: '📦 Start Preparing',
                        action: `startPreparing('${order.id}')`,
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
                    
                case ESCROW_STAGES.ITEM_PREPARING:
                    actions.push({
                        text: '🚚 Mark as Shipped',
                        action: `markAsShipped('${order.id}')`,
                        class: 'btn-primary',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '📋 Add Tracking',
                        action: `addTracking('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.ITEM_SHIPPED:
                    actions.push({
                        text: '📦 Mark as Delivered',
                        action: `markAsDelivered('${order.id}')`,
                        class: 'btn-primary',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '📍 Update Tracking',
                        action: `updateTracking('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.ITEM_DELIVERED:
                case ESCROW_STAGES.CONFIRMATION_PENDING:
                    actions.push({
                        text: '💰 Request Fund Release',
                        action: `requestFundRelease('${order.id}')`,
                        class: 'btn-success',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '⏰ View Countdown',
                        action: `viewEscrowCountdown('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.FUNDS_RELEASED:
                case ESCROW_STAGES.TRANSACTION_COMPLETE:
                    actions.push({
                        text: '📊 View Analytics',
                        action: `viewOrderAnalytics('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '⭐ View Review',
                        action: `viewBuyerReview('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.DISPUTED:
                    actions.push({
                        text: '🔍 View Dispute',
                        action: `viewDispute('${order.id}')`,
                        class: 'btn-warning',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '📞 Contact Support',
                        action: `contactSupport('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
            }
            
            // Always add view details option
            actions.push({
                text: '📋 View Details',
                action: `viewOrderDetails('${order.id}')`,
                class: 'btn-outline',
                priority: 'tertiary'
            });
            
            return actions;
        },
        
        // Get buyer action buttons for each stage
        getBuyerActions(order) {
            const stage = this.getEscrowStage(order.status, order.escrow_status);
            const actions = [];
            
            switch (stage) {
                case ESCROW_STAGES.PAYMENT_PENDING:
                case ESCROW_STAGES.PAYMENT_PROCESSING:
                    actions.push({
                        text: '💳 Payment Processing',
                        action: 'null',
                        class: 'btn-disabled',
                        priority: 'primary',
                        disabled: true
                    });
                    break;
                    
                case ESCROW_STAGES.FUNDS_SECURED:
                case ESCROW_STAGES.SELLER_NOTIFIED:
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
                    
                case ESCROW_STAGES.ORDER_CONFIRMED:
                case ESCROW_STAGES.ITEM_PREPARING:
                    actions.push({
                        text: '📦 Being Prepared',
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
                        text: '📞 Contact Seller',
                        action: `contactSeller('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.ITEM_DELIVERED:
                case ESCROW_STAGES.CONFIRMATION_PENDING:
                    actions.push({
                        text: '✅ Confirm Received',
                        action: `confirmDelivery('${order.id}')`,
                        class: 'btn-success',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '⚠️ Report Issue',
                        action: `reportIssue('${order.id}')`,
                        class: 'btn-warning',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.BUYER_CONFIRMED:
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
                    
                case ESCROW_STAGES.DISPUTED:
                    actions.push({
                        text: '🔍 View Dispute',
                        action: `viewDispute('${order.id}')`,
                        class: 'btn-warning',
                        priority: 'primary'
                    });
                    actions.push({
                        text: '📞 Contact Support',
                        action: `contactSupport('${order.id}')`,
                        class: 'btn-secondary',
                        priority: 'secondary'
                    });
                    break;
                    
                case ESCROW_STAGES.CANCELLED:
                case ESCROW_STAGES.REFUNDED:
                    actions.push({
                        text: '🔄 Shop Again',
                        action: `shopAgain()`,
                        class: 'btn-secondary',
                        priority: 'primary'
                    });
                    break;
            }
            
            // Always add view details option
            actions.push({
                text: '📋 View Details',
                action: `viewOrderDetails('${order.id}')`,
                class: 'btn-outline',
                priority: 'tertiary'
            });
            
            return actions;
        },
        
        // Create status badge for escrow stage
        createStageBadge(stage) {
            const info = this.getStageInfo(stage);
            
            return `
                <span class="escrow-stage-badge" style="
                    background-color: ${info.color};
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 1rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.025em;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                ">
                    <span>${info.icon}</span>
                    <span>${info.title}</span>
                </span>
            `;
        },
        
        // Create progress timeline for escrow stages
        createEscrowTimeline(currentStage, orderId) {
            const stages = [
                ESCROW_STAGES.PAYMENT_PROCESSING,
                ESCROW_STAGES.FUNDS_SECURED,
                ESCROW_STAGES.SELLER_NOTIFIED,
                ESCROW_STAGES.ORDER_CONFIRMED,
                ESCROW_STAGES.ITEM_PREPARING,
                ESCROW_STAGES.ITEM_SHIPPED,
                ESCROW_STAGES.ITEM_DELIVERED,
                ESCROW_STAGES.CONFIRMATION_PENDING,
                ESCROW_STAGES.FUNDS_RELEASED,
                ESCROW_STAGES.TRANSACTION_COMPLETE
            ];
            
            let timelineHtml = '<div class="escrow-timeline">';
            
            stages.forEach((stage, index) => {
                const info = this.getStageInfo(stage);
                const isCompleted = this.isStageCompleted(stage, currentStage);
                const isCurrent = stage === currentStage;
                const isFuture = !isCompleted && !isCurrent;
                
                let stageClass = 'future';
                if (isCompleted) stageClass = 'completed';
                else if (isCurrent) stageClass = 'current';
                
                timelineHtml += `
                    <div class="timeline-step ${stageClass}">
                        <div class="timeline-icon" style="background-color: ${isCompleted || isCurrent ? info.color : '#e5e7eb'}">
                            ${info.icon}
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">${info.title}</div>
                            <div class="timeline-description">${info.description}</div>
                            ${isCurrent ? '<div class="timeline-status">Current Stage</div>' : ''}
                        </div>
                    </div>
                `;
            });
            
            timelineHtml += '</div>';
            return timelineHtml;
        },
        
        // Check if stage is completed relative to current stage
        isStageCompleted(stage, currentStage) {
            const stageOrder = [
                ESCROW_STAGES.PAYMENT_PENDING,
                ESCROW_STAGES.PAYMENT_PROCESSING,
                ESCROW_STAGES.FUNDS_SECURED,
                ESCROW_STAGES.SELLER_NOTIFIED,
                ESCROW_STAGES.ORDER_CONFIRMED,
                ESCROW_STAGES.ITEM_PREPARING,
                ESCROW_STAGES.ITEM_SHIPPED,
                ESCROW_STAGES.ITEM_DELIVERED,
                ESCROW_STAGES.CONFIRMATION_PENDING,
                ESCROW_STAGES.BUYER_CONFIRMED,
                ESCROW_STAGES.FUNDS_RELEASED,
                ESCROW_STAGES.TRANSACTION_COMPLETE
            ];
            
            const currentIndex = stageOrder.indexOf(currentStage);
            const stageIndex = stageOrder.indexOf(stage);
            
            return stageIndex < currentIndex;
        },
        
        // Advance order to next escrow stage
        async advanceToNextStage(orderId, currentStage, nextStage) {
            try {
                // In real implementation, this would call API to update order status
                // For playacting, we'll simulate the transition
                
                const stageInfo = this.getStageInfo(nextStage);
                showNotification(`🔄 Advancing to: ${stageInfo.title}`, 'info');
                
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                showNotification(`✅ Order advanced to: ${stageInfo.title}`, 'success');
                
                return {
                    success: true,
                    newStage: nextStage,
                    message: `Order advanced to ${stageInfo.title}`
                };
                
            } catch (error) {
                showNotification(`❌ Error advancing order: ${error.message}`, 'error');
                return {
                    success: false,
                    error: error.message
                };
            }
        },
        
        // Get next stage in workflow
        getNextStage(currentStage) {
            const workflow = {
                [ESCROW_STAGES.PAYMENT_PENDING]: ESCROW_STAGES.PAYMENT_PROCESSING,
                [ESCROW_STAGES.PAYMENT_PROCESSING]: ESCROW_STAGES.FUNDS_SECURED,
                [ESCROW_STAGES.FUNDS_SECURED]: ESCROW_STAGES.SELLER_NOTIFIED,
                [ESCROW_STAGES.SELLER_NOTIFIED]: ESCROW_STAGES.ORDER_CONFIRMED,
                [ESCROW_STAGES.ORDER_CONFIRMED]: ESCROW_STAGES.ITEM_PREPARING,
                [ESCROW_STAGES.ITEM_PREPARING]: ESCROW_STAGES.ITEM_SHIPPED,
                [ESCROW_STAGES.ITEM_SHIPPED]: ESCROW_STAGES.ITEM_DELIVERED,
                [ESCROW_STAGES.ITEM_DELIVERED]: ESCROW_STAGES.CONFIRMATION_PENDING,
                [ESCROW_STAGES.CONFIRMATION_PENDING]: ESCROW_STAGES.BUYER_CONFIRMED,
                [ESCROW_STAGES.BUYER_CONFIRMED]: ESCROW_STAGES.FUNDS_RELEASED,
                [ESCROW_STAGES.FUNDS_RELEASED]: ESCROW_STAGES.TRANSACTION_COMPLETE
            };
            
            return workflow[currentStage] || null;
        }
    };
})();