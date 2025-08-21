// Perfect Seller Order Management - Working Implementation
const SellerOrders = (function() {
    'use strict';
    
    let sellerOrders = [];
    let currentSellerId = null;
    
    return {
        async init(sellerId) {
            console.log('SellerOrders.init called with sellerId:', sellerId);
            currentSellerId = sellerId;
            
            try {
                await this.loadSellerOrders(sellerId);
                this.updateNotificationBadge();
                console.log('SellerOrders initialized successfully');
            } catch (error) {
                console.error('Error initializing seller orders:', error);
            }
        },
        
        async loadSellerOrders(sellerId) {
            try {
                const response = await fetch('../api/orders/seller-orders.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sellerId: sellerId })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    sellerOrders = result.orders || [];
                } else {
                    console.error('API error loading seller orders:', result.message);
                    sellerOrders = [];
                }
                
                console.log('Loaded seller orders:', sellerOrders.length);
                return sellerOrders;
            } catch (error) {
                console.error('Error loading seller orders:', error);
                sellerOrders = [];
                return [];
            }
        },
        
        displaySellerOrders(containerId, limit = 5) {
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
                const statusColor = this.getStatusColor(order.status);
                const isNewOrder = order.status === 'pending';
                
                ordersHtml += `
                    <div class="order-item ${isNewOrder ? 'new-order' : ''}" data-order-id="${order.id}">
                        ${isNewOrder ? '<div class="new-badge">NEW</div>' : ''}
                        
                        <div class="order-header">
                            <div class="order-info">
                                <h4>${order.listingTitle}</h4>
                                <p>👤 Buyer: ${order.buyerName}</p>
                                <p>📧 ${order.buyerEmail}</p>
                            </div>
                            <div class="order-status">
                                <span class="status-badge" style="background: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem; font-weight: 600;">
                                    ${this.formatStatus(order.status)}
                                </span>
                                <span class="escrow-badge" style="background: #059669; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem; margin-top: 0.25rem; display: block;">
                                    🔒 Escrow Secured
                                </span>
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <div class="detail-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.75rem 0;">
                                <div><strong>Order ID:</strong> ${order.id}</div>
                                <div><strong>Quantity:</strong> ${order.quantity}</div>
                                <div><strong>Your Earnings:</strong> $${(order.seller_amount || order.total_amount * 0.98).toFixed(2)}</div>
                                <div><strong>Order Date:</strong> ${this.formatDate(order.created_at)}</div>
                            </div>
                            ${order.buyer_message ? `
                                <div class="buyer-message" style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 0.375rem; padding: 0.75rem; margin-top: 0.5rem;">
                                    <strong style="color: #1e40af;">Message from buyer:</strong>
                                    <p style="color: #1e3a8a; font-style: italic; margin: 0.25rem 0 0 0;">"${order.buyer_message}"</p>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="order-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                            ${this.generateWorkingActions(order)}
                        </div>
                    </div>
                `;
            });
            
            ordersHtml += '</div>';
            
            if (sellerOrders.length > limit) {
                ordersHtml += `
                    <div class="view-all-orders" style="text-align: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                        <button class="btn btn-secondary" onclick="window.location.href='../dashboard/orders.html'">
                            View All Orders (${sellerOrders.length})
                        </button>
                    </div>
                `;
            }
            
            container.innerHTML = ordersHtml;
        },
        
        generateWorkingActions(order) {
            const actions = [];
            
            switch (order.status) {
                case 'pending':
                    actions.push(`<button class="btn btn-success btn-sm" onclick="SellerOrders.confirmOrder('${order.id}')">✅ Confirm Order</button>`);
                    actions.push(`<button class="btn btn-danger btn-sm" onclick="SellerOrders.cancelOrder('${order.id}')">❌ Cancel</button>`);
                    break;
                    
                case 'confirmed':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsShipped('${order.id}')">🚚 Mark as Shipped</button>`);
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.contactBuyer('${order.id}')">💬 Contact Buyer</button>`);
                    break;
                    
                case 'shipped':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsDelivered('${order.id}')">📦 Mark as Delivered</button>`);
                    break;
                    
                case 'delivered':
                    actions.push(`<button class="btn btn-success btn-sm" onclick="SellerOrders.releaseFunds('${order.id}')">💰 Release Funds</button>`);
                    break;
                    
                case 'completed':
                    actions.push(`<button class="btn btn-success btn-sm" disabled style="opacity: 0.6;">🎉 Transaction Complete</button>`);
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.viewEarnings('${order.id}')">📊 View Earnings</button>`);
                    break;
                    
                case 'cancelled':
                    actions.push(`<button class="btn btn-secondary btn-sm" disabled style="opacity: 0.6;">❌ Cancelled</button>`);
                    break;
            }
            
            return actions.join(' ');
        },
        
        // WORKING order management functions
        async confirmOrder(orderId) {
            if (!confirm('Confirm this order? You commit to fulfilling this purchase.')) {
                return;
            }
            
            try {
                showNotification('✅ Confirming order...', 'info');
                
                const result = await this.updateOrderStatus(orderId, 'confirmed');
                
                if (result.success) {
                    showNotification('Order confirmed! You can now prepare and ship the item.', 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error confirming order: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error confirming order: ' + error.message, 'error');
            }
        },
        
        async markAsShipped(orderId) {
            const trackingNumber = prompt('Enter tracking number (optional):');
            
            try {
                showNotification('🚚 Marking as shipped...', 'info');
                
                const result = await this.updateOrderStatus(orderId, 'shipped');
                
                if (result.success) {
                    showNotification(`Item shipped successfully! ${trackingNumber ? 'Tracking: ' + trackingNumber : 'Buyer has been notified.'}`, 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error marking as shipped: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error marking as shipped: ' + error.message, 'error');
            }
        },
        
        async markAsDelivered(orderId) {
            try {
                showNotification('📦 Marking as delivered...', 'info');
                
                const result = await this.updateOrderStatus(orderId, 'delivered');
                
                if (result.success) {
                    showNotification('Order marked as delivered! You can now release funds.', 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error marking as delivered: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error marking as delivered: ' + error.message, 'error');
            }
        },
        
        async releaseFunds(orderId) {
            if (!confirm('Release funds to complete this transaction? This action cannot be undone.')) {
                return;
            }
            
            try {
                showNotification('💰 Releasing funds...', 'info');
                
                const result = await this.updateOrderStatus(orderId, 'completed');
                
                if (result.success) {
                    showNotification('🎉 Funds released! Transaction completed successfully.', 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error releasing funds: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error releasing funds: ' + error.message, 'error');
            }
        },
        
        async cancelOrder(orderId) {
            if (!confirm('Cancel this order? This will trigger an automatic refund to the buyer.')) {
                return;
            }
            
            try {
                showNotification('❌ Cancelling order...', 'info');
                
                const result = await this.updateOrderStatus(orderId, 'cancelled');
                
                if (result.success) {
                    showNotification('Order cancelled. Automatic refund processed.', 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error cancelling order: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error cancelling order: ' + error.message, 'error');
            }
        },
        
        // WORKING order status update with real API calls
        async updateOrderStatus(orderId, newStatus) {
            try {
                const response = await fetch('../api/orders/update-status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: newStatus
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    // Update local data for immediate UI feedback
                    const orderIndex = sellerOrders.findIndex(o => o.id === orderId);
                    if (orderIndex >= 0) {
                        sellerOrders[orderIndex].status = newStatus;
                        sellerOrders[orderIndex].updated_at = new Date().toISOString();
                    }
                    
                    console.log('Order status updated successfully:', result);
                    return { success: true };
                } else {
                    console.error('API error updating order status:', result.message);
                    return { success: false, message: result.message };
                }
                
            } catch (error) {
                console.error('Error updating order status:', error);
                return { success: false, message: error.message };
            }
        },
        
        async refreshOrders() {
            if (currentSellerId) {
                await this.loadSellerOrders(currentSellerId);
                this.displaySellerOrders('sellerOrdersList');
                this.updateNotificationBadge();
                console.log('Orders refreshed');
            }
        },
        
        updateNotificationBadge() {
            const pendingOrdersCount = sellerOrders.filter(o => o.status === 'pending').length;
            const badge = document.getElementById('orderNotificationBadge');
            
            if (badge) {
                if (pendingOrdersCount > 0) {
                    badge.textContent = pendingOrdersCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        },
        
        // Utility functions
        formatStatus(status) {
            const statusMap = {
                'pending': 'Payment Pending',
                'confirmed': 'Order Confirmed',
                'processing': 'Processing',
                'shipped': 'Shipped',
                'delivered': 'Delivered',
                'completed': 'Completed',
                'cancelled': 'Cancelled'
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
                'cancelled': '#6b7280'
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
            } else {
                return date.toLocaleDateString();
            }
        },
        
        // Placeholder functions for future enhancement
        contactBuyer(orderId) {
            showNotification('💬 Buyer contact system will be available soon', 'info');
        },
        
        viewEarnings(orderId) {
            const order = sellerOrders.find(o => o.id === orderId);
            if (order) {
                showNotification(`📊 Earnings: $${(order.seller_amount || order.total_amount * 0.98).toFixed(2)} (Platform fee: $${(order.total_amount * 0.02).toFixed(2)})`, 'info');
            }
        }
    };
})();

// Ensure global notification system
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white; padding: 15px 20px; border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 300px;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    };
}