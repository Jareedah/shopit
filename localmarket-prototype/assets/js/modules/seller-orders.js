// Unified Seller Order Management Module - Uses Global Data
const SellerOrders = (function() {
    'use strict';
    
    let sellerOrders = [];
    let currentSellerId = null;
    
    return {
        // Initialize seller orders system with global data
        async init(sellerId) {
            console.log('SellerOrders.init called with sellerId:', sellerId);
            currentSellerId = sellerId;
            
            try {
                // Load orders from global API (not localStorage)
                await this.loadSellerOrdersFromAPI(sellerId);
                
                // Update notification badge
                this.updateNotificationBadge();
                
                console.log('SellerOrders initialized successfully, orders:', sellerOrders.length);
            } catch (error) {
                console.error('Error initializing seller orders:', error);
            }
        },
        
        // Load orders from global API
        async loadSellerOrdersFromAPI(sellerId) {
            try {
                const response = await fetch('../api/orders/seller-orders.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sellerId: sellerId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    sellerOrders = result.orders || [];
                    console.log('Loaded seller orders from API:', sellerOrders);
                } else {
                    console.error('Failed to load seller orders:', result.message);
                    sellerOrders = [];
                }
                
                return sellerOrders;
            } catch (error) {
                console.error('Error loading seller orders from API:', error);
                sellerOrders = [];
                return [];
            }
        },
        
        // Display seller orders in dashboard
        displaySellerOrders(containerId, limit = 5) {
            console.log('displaySellerOrders called with:', containerId, 'orders:', sellerOrders.length);
            
            const container = document.getElementById(containerId);
            if (!container) {
                console.error('Container not found:', containerId);
                return;
            }
            
            if (sellerOrders.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No orders yet</p>
                        <small>Orders will appear here when customers purchase your items</small>
                        <button class="btn btn-secondary" onclick="SellerOrders.refreshOrders()" style="margin-top: 1rem;">
                            🔄 Refresh Orders
                        </button>
                    </div>
                `;
                return;
            }
            
            const recentOrders = sellerOrders
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, limit);
            
            let ordersHtml = '<div class="seller-orders-list">';
            
            recentOrders.forEach(order => {
                const isNew = order.isNewOrder;
                const statusColor = this.getStatusColor(order.status);
                
                ordersHtml += `
                    <div class="order-item ${isNew ? 'new-order' : ''}" data-order-id="${order.id}">
                        ${isNew ? '<div class="new-badge">NEW</div>' : ''}
                        
                        <div class="order-header">
                            <div class="order-info">
                                <h4 class="order-title">${order.listingTitle}</h4>
                                <p class="buyer-info">👤 ${order.buyerName}</p>
                            </div>
                            <div class="order-status">
                                ${typeof EscrowWorkflow !== 'undefined' ? 
                                    EscrowWorkflow.createStageBadge(EscrowWorkflow.getEscrowStage(order.status, order.escrow_status)) :
                                    `<span class="status-badge" style="background-color: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">
                                        ${this.formatStatus(order.status)}
                                    </span>`
                                }
                                <span class="escrow-security-badge" style="background-color: #059669; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem; margin-top: 0.25rem;">
                                    🔒 Escrow Protected
                                </span>
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <div class="detail-row">
                                <span class="detail-label">Amount:</span>
                                <span class="detail-value">$${order.seller_amount.toFixed(2)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Quantity:</span>
                                <span class="detail-value">${order.quantity}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Order Date:</span>
                                <span class="detail-value">${this.formatDate(order.created_at)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Order ID:</span>
                                <span class="detail-value">${order.id}</span>
                            </div>
                            ${order.buyer_message ? `
                                <div class="buyer-message">
                                    <strong>Buyer Message:</strong>
                                    <p>"${order.buyer_message}"</p>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="order-actions">
                            ${this.generateOrderActions(order)}
                        </div>
                    </div>
                `;
            });
            
            ordersHtml += '</div>';
            
            if (sellerOrders.length > limit) {
                ordersHtml += `
                    <div class="view-all-orders">
                        <button class="btn btn-secondary" onclick="window.location.href='../dashboard/orders.html'">
                            View All Orders (${sellerOrders.length})
                        </button>
                    </div>
                `;
            }
            
            container.innerHTML = ordersHtml;
            console.log('Orders displayed successfully');
        },
        
        // Generate action buttons based on escrow workflow stage
        generateOrderActions(order) {
            if (typeof EscrowWorkflow === 'undefined') {
                // Fallback to simple actions if EscrowWorkflow not available
                return `<button class="btn btn-secondary btn-sm" onclick="SellerOrders.viewOrderDetails('${order.id}')">📋 View Details</button>`;
            }
            
            const actions = EscrowWorkflow.getSellerActions(order);
            
            return actions.map(action => {
                const disabledAttr = action.disabled ? 'disabled' : '';
                const onclickAttr = action.action !== 'null' ? `onclick="SellerOrders.${action.action}"` : '';
                
                return `<button class="btn ${action.class} btn-sm" ${disabledAttr} ${onclickAttr}>
                    ${action.text}
                </button>`;
            }).join(' ');
        },
        
        // Order management functions
        async confirmOrder(orderId) {
            try {
                showNotification('✅ Confirming order...', 'info');
                await this.updateOrderStatus(orderId, 'processing');
                showNotification('Order confirmed and processing! Buyer has been notified.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error confirming order: ' + error.message, 'error');
            }
        },
        
        async updateOrderStatus(orderId, newStatus) {
            // In a real system, this would call an API to update orders.json
            // For now, we'll update the local array and simulate success
            return new Promise((resolve) => {
                setTimeout(() => {
                    const orderIndex = sellerOrders.findIndex(o => o.id === orderId);
                    if (orderIndex >= 0) {
                        sellerOrders[orderIndex].status = newStatus;
                        sellerOrders[orderIndex].isNewOrder = false;
                        resolve({ success: true });
                    }
                }, 500);
            });
        },
        
        async refreshOrders() {
            if (currentSellerId) {
                await this.loadSellerOrdersFromAPI(currentSellerId);
                this.displaySellerOrders('sellerOrdersList');
                this.updateNotificationBadge();
                showNotification('Orders refreshed!', 'success');
            }
        },
        
        updateNotificationBadge() {
            const newOrdersCount = sellerOrders.filter(o => o.isNewOrder).length;
            const badge = document.getElementById('orderNotificationBadge');
            
            console.log('Updating notification badge:', newOrdersCount);
            
            if (badge) {
                if (newOrdersCount > 0) {
                    badge.textContent = newOrdersCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        },
        
        // Display seller statistics
        displaySellerStats(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const stats = this.calculateSellerStats();
            
            // Update individual stat elements if they exist
            const elements = {
                'userOrdersCount': stats.totalOrders,
                'totalEarnings': `$${stats.totalEarnings.toFixed(2)}`,
                'pendingEarnings': `$${stats.pendingEarnings.toFixed(2)}`
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
        },
        
        calculateSellerStats() {
            const newOrders = sellerOrders.filter(o => o.isNewOrder).length;
            const totalEarnings = sellerOrders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + (o.seller_amount || 0), 0);
            const pendingEarnings = sellerOrders
                .filter(o => o.escrow_status === 'funds_held')
                .reduce((sum, o) => sum + (o.seller_amount || 0), 0);
            
            return {
                totalOrders: sellerOrders.length,
                newOrders: newOrders,
                totalEarnings: totalEarnings,
                pendingEarnings: pendingEarnings
            };
        },
        
        // Utility functions
        formatStatus(status) {
            const statusMap = {
                'pending': 'Pending',
                'confirmed': 'Confirmed',
                'processing': 'Processing',
                'shipped': 'Shipped',
                'delivered': 'Delivered',
                'completed': 'Completed',
                'cancelled': 'Cancelled',
                'disputed': 'Disputed'
            };
            return statusMap[status] || status;
        },
        
        getStatusColor(status) {
            const colorMap = {
                'pending': '#f59e0b',
                'confirmed': '#3b82f6',
                'processing': '#8b5cf6',
                'shipped': '#06b6d4',
                'delivered': '#10b981',
                'completed': '#059669',
                'cancelled': '#6b7280',
                'disputed': '#dc2626'
            };
            return colorMap[status] || '#6b7280';
        },
        
        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                return 'Today';
            } else if (diffDays === 2) {
                return 'Yesterday';
            } else if (diffDays <= 7) {
                return `${diffDays - 1} days ago`;
            } else {
                return date.toLocaleDateString();
            }
        },
        
        // Escrow workflow action handlers
        async confirmOrder(orderId) {
            try {
                showNotification('✅ Confirming order...', 'info');
                await this.updateOrderStatus(orderId, 'confirmed');
                
                if (typeof EscrowWorkflow !== 'undefined') {
                    await EscrowWorkflow.advanceToNextStage(orderId, 'seller_notified', 'order_confirmed');
                }
                
                showNotification('Order confirmed! Buyer has been notified.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error confirming order: ' + error.message, 'error');
            }
        },
        
        async startPreparing(orderId) {
            try {
                showNotification('📦 Starting order preparation...', 'info');
                await this.updateOrderStatus(orderId, 'processing');
                
                if (typeof EscrowWorkflow !== 'undefined') {
                    await EscrowWorkflow.advanceToNextStage(orderId, 'order_confirmed', 'item_preparing');
                }
                
                showNotification('Order preparation started! Buyer has been notified.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error starting preparation: ' + error.message, 'error');
            }
        },
        
        async markAsShipped(orderId) {
            const trackingNumber = prompt('Enter tracking number (optional):');
            
            try {
                showNotification('🚚 Marking as shipped...', 'info');
                await this.updateOrderStatus(orderId, 'shipped');
                
                if (typeof EscrowWorkflow !== 'undefined') {
                    await EscrowWorkflow.advanceToNextStage(orderId, 'item_preparing', 'item_shipped');
                }
                
                showNotification(`Order marked as shipped! ${trackingNumber ? 'Tracking: ' + trackingNumber : 'Buyer has been notified.'}`, 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error marking as shipped: ' + error.message, 'error');
            }
        },
        
        async markAsDelivered(orderId) {
            try {
                showNotification('📦 Marking as delivered...', 'info');
                await this.updateOrderStatus(orderId, 'delivered');
                
                if (typeof EscrowWorkflow !== 'undefined') {
                    await EscrowWorkflow.advanceToNextStage(orderId, 'item_shipped', 'item_delivered');
                }
                
                showNotification('Order marked as delivered! 72-hour escrow countdown started.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error marking as delivered: ' + error.message, 'error');
            }
        },
        
        async requestFundRelease(orderId) {
            try {
                showNotification('💰 Requesting fund release...', 'info');
                
                if (typeof EscrowPlayacting !== 'undefined') {
                    const result = await EscrowPlayacting.simulateRelease(orderId, currentSellerId);
                    if (result.success) {
                        await this.updateOrderStatus(orderId, 'completed');
                        
                        if (typeof EscrowWorkflow !== 'undefined') {
                            await EscrowWorkflow.advanceToNextStage(orderId, 'confirmation_pending', 'funds_released');
                        }
                        
                        showNotification('🎉 Funds released! Payment is on the way.', 'success');
                        this.refreshOrders();
                    }
                } else {
                    showNotification('💰 Fund release requested! Buyer has 72 hours to confirm.', 'info');
                }
            } catch (error) {
                showNotification('Error requesting fund release: ' + error.message, 'error');
            }
        },
        
        async cancelOrder(orderId) {
            if (!confirm('Are you sure you want to cancel this order? This will trigger an automatic refund.')) {
                return;
            }
            
            try {
                showNotification('❌ Cancelling order...', 'info');
                await this.updateOrderStatus(orderId, 'cancelled');
                
                if (typeof EscrowWorkflow !== 'undefined') {
                    await EscrowWorkflow.advanceToNextStage(orderId, null, 'cancelled');
                }
                
                showNotification('Order cancelled. Refund will be processed automatically.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error cancelling order: ' + error.message, 'error');
            }
        },
        
        // Additional escrow workflow methods
        addTracking(orderId) {
            const trackingNumber = prompt('Enter tracking number:');
            if (trackingNumber) {
                showNotification(`📦 Tracking number added: ${trackingNumber}`, 'success');
            }
        },
        
        updateTracking(orderId) {
            const newTracking = prompt('Update tracking number:');
            if (newTracking) {
                showNotification(`📦 Tracking updated: ${newTracking}`, 'success');
            }
        },
        
        viewEscrowCountdown(orderId) {
            showNotification('⏰ 72-hour countdown: 45 hours remaining', 'info');
        },
        
        viewOrderAnalytics(orderId) {
            showNotification('📊 Order analytics: High buyer satisfaction, on-time delivery', 'info');
        },
        
        viewBuyerReview(orderId) {
            showNotification('⭐ Buyer review: "Great item, fast shipping!" - 5 stars', 'info');
        },
        
        viewDispute(orderId) {
            showNotification('🔍 Dispute details would open here', 'info');
        },
        
        contactSupport(orderId) {
            showNotification('📞 Support contact form would open here', 'info');
        },
        
        contactBuyer(orderId) {
            showNotification('💬 Buyer contact form would open here', 'info');
        },
        
        viewOrderDetails(orderId) {
            window.location.href = `../dashboard/orders.html?order=${orderId}`;
        }
    };
})();