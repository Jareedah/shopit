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
                                <span class="status-badge" style="background-color: ${statusColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">
                                    ${this.formatStatus(order.status)}
                                </span>
                                <span class="escrow-badge-small" style="background-color: #3b82f6; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem;">
                                    🔒 Escrow Secured
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
        
        // Generate action buttons based on order status
        generateOrderActions(order) {
            let actions = [];
            
            switch (order.status) {
                case 'pending':
                case 'confirmed':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.confirmOrder('${order.id}')">✅ Confirm Order</button>`);
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.contactBuyer('${order.id}')">💬 Contact Buyer</button>`);
                    actions.push(`<button class="btn btn-danger btn-sm" onclick="SellerOrders.cancelOrder('${order.id}')">❌ Cancel</button>`);
                    break;
                    
                case 'processing':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsShipped('${order.id}')">🚚 Mark as Shipped</button>`);
                    break;
                    
                case 'shipped':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsDelivered('${order.id}')">📦 Mark as Delivered</button>`);
                    break;
                    
                case 'delivered':
                    actions.push(`<button class="btn btn-success btn-sm" onclick="SellerOrders.requestFundRelease('${order.id}')">💰 Request Fund Release</button>`);
                    break;
                    
                case 'completed':
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.viewOrderDetails('${order.id}')">📋 View Details</button>`);
                    break;
            }
            
            return actions.join(' ');
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
        
        // Placeholder functions for UI interactions
        cancelOrder(orderId) {
            showNotification('Order would be cancelled', 'info');
        },
        
        markAsShipped(orderId) {
            this.updateOrderStatus(orderId, 'shipped').then(() => {
                showNotification('Order marked as shipped!', 'success');
                this.refreshOrders();
            });
        },
        
        markAsDelivered(orderId) {
            this.updateOrderStatus(orderId, 'delivered').then(() => {
                showNotification('Order marked as delivered!', 'success');
                this.refreshOrders();
            });
        },
        
        requestFundRelease(orderId) {
            if (typeof EscrowPlayacting !== 'undefined') {
                EscrowPlayacting.simulateRelease(orderId, currentSellerId).then(() => {
                    this.updateOrderStatus(orderId, 'completed');
                    this.refreshOrders();
                });
            } else {
                showNotification('💰 Fund release requested! Buyer has 72 hours to confirm.', 'success');
            }
        },
        
        contactBuyer(orderId) {
            showNotification('💬 Buyer contact form would open here', 'info');
        },
        
        viewOrderDetails(orderId) {
            window.location.href = `../dashboard/orders.html?order=${orderId}`;
        }
    };
})();