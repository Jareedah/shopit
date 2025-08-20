// Seller Order Management Module
const SellerOrders = (function() {
    'use strict';
    
    // Order status constants
    const ORDER_STATUS = {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        PROCESSING: 'processing',
        SHIPPED: 'shipped',
        DELIVERED: 'delivered',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        DISPUTED: 'disputed'
    };
    
    // Escrow status constants (matching escrow.js)
    const ESCROW_STATUS = {
        PENDING: 'pending',
        FUNDS_HELD: 'funds_held',
        DISPUTED: 'disputed',
        RELEASED: 'released',
        CANCELLED: 'cancelled'
    };
    
    let sellerOrders = [];
    let notifications = [];
    
    return {
        // Initialize seller orders system
        async init(sellerId) {
            try {
                await this.loadSellerOrders(sellerId);
                await this.loadNotifications(sellerId);
                this.setupEventListeners();
                this.updateNotificationBadge();
            } catch (error) {
                console.error('Error initializing seller orders:', error);
            }
        },
        
        // Load orders for seller
        async loadSellerOrders(sellerId) {
            try {
                // In real implementation, this would be an API call
                // For playacting, we'll simulate with localStorage and sample data
                const response = await this.fetchSellerOrdersSimulated(sellerId);
                
                if (response.success) {
                    sellerOrders = response.orders;
                    return sellerOrders;
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading seller orders:', error);
                return [];
            }
        },
        
        // Simulated API call to fetch seller orders
        async fetchSellerOrdersSimulated(sellerId) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Get orders from localStorage (created during checkout)
                    const allOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
                    const sellerSpecificOrders = allOrders.filter(order => 
                        order.sellerId === sellerId || order.sellerId === 'admin_001' // Include sample orders for admin
                    );
                    
                    // Add some sample orders if none exist
                    if (sellerSpecificOrders.length === 0) {
                        const sampleOrders = this.generateSampleOrders(sellerId);
                        sellerSpecificOrders.push(...sampleOrders);
                    }
                    
                    resolve({
                        success: true,
                        orders: sellerSpecificOrders,
                        total: sellerSpecificOrders.length
                    });
                }, 500);
            });
        },
        
        // Generate sample orders for demonstration
        generateSampleOrders(sellerId) {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
            
            return [
                {
                    id: 'order_sample_001',
                    listingId: 'listing_001',
                    listingTitle: 'iPhone 13 Pro - Excellent Condition',
                    buyerId: 'buyer_001',
                    buyerName: 'John Smith',
                    buyerEmail: 'john@example.com',
                    sellerId: sellerId,
                    quantity: 1,
                    price: 650.00,
                    platform_fee: 13.00,
                    total_amount: 663.00,
                    seller_amount: 650.00,
                    status: ORDER_STATUS.PENDING,
                    escrow_status: ESCROW_STATUS.FUNDS_HELD,
                    escrow_id: 'escrow_sample_001',
                    created_at: now.toISOString(),
                    payment_method: 'escrow',
                    buyer_message: 'Looking forward to this purchase! When can you ship?',
                    shipping_address: '123 Main St, New York, NY 10001',
                    isNewOrder: true
                },
                {
                    id: 'order_sample_002',
                    listingId: 'listing_002',
                    listingTitle: 'Professional House Cleaning Service',
                    buyerId: 'buyer_002',
                    buyerName: 'Sarah Johnson',
                    buyerEmail: 'sarah@example.com',
                    sellerId: sellerId,
                    quantity: 1,
                    price: 120.00,
                    platform_fee: 2.40,
                    total_amount: 122.40,
                    seller_amount: 120.00,
                    status: ORDER_STATUS.CONFIRMED,
                    escrow_status: ESCROW_STATUS.FUNDS_HELD,
                    escrow_id: 'escrow_sample_002',
                    created_at: yesterday.toISOString(),
                    payment_method: 'escrow',
                    buyer_message: 'Need cleaning for this Saturday morning, please confirm availability.',
                    service_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                    isNewOrder: false
                },
                {
                    id: 'order_sample_003',
                    listingId: 'listing_003',
                    listingTitle: 'Vintage Leather Jacket',
                    buyerId: 'buyer_003',
                    buyerName: 'Mike Wilson',
                    buyerEmail: 'mike@example.com',
                    sellerId: sellerId,
                    quantity: 1,
                    price: 85.00,
                    platform_fee: 1.70,
                    total_amount: 86.70,
                    seller_amount: 85.00,
                    status: ORDER_STATUS.DELIVERED,
                    escrow_status: ESCROW_STATUS.FUNDS_HELD,
                    escrow_id: 'escrow_sample_003',
                    created_at: twoDaysAgo.toISOString(),
                    delivered_at: yesterday.toISOString(),
                    payment_method: 'escrow',
                    buyer_message: '',
                    tracking_number: 'TRK123456789',
                    isNewOrder: false
                }
            ];
        },
        
        // Display seller orders in dashboard
        displaySellerOrders(containerId, limit = 5) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            if (sellerOrders.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>No orders yet</p>
                        <small>Orders will appear here when customers purchase your items</small>
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
                const escrowBadge = this.createEscrowBadge(order.escrow_status);
                
                ordersHtml += `
                    <div class="order-item ${isNew ? 'new-order' : ''}" data-order-id="${order.id}">
                        ${isNew ? '<div class="new-badge">NEW</div>' : ''}
                        
                        <div class="order-header">
                            <div class="order-info">
                                <h4 class="order-title">${order.listingTitle}</h4>
                                <p class="buyer-info">👤 ${order.buyerName}</p>
                            </div>
                            <div class="order-status">
                                <span class="status-badge status-${order.status}" style="background-color: ${statusColor}">
                                    ${this.formatStatus(order.status)}
                                </span>
                                ${escrowBadge}
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
                        <button class="btn btn-secondary" onclick="SellerOrders.showAllOrders()">
                            View All Orders (${sellerOrders.length})
                        </button>
                    </div>
                `;
            }
            
            container.innerHTML = ordersHtml;
        },
        
        // Generate action buttons based on order status
        generateOrderActions(order) {
            let actions = [];
            
            switch (order.status) {
                case ORDER_STATUS.PENDING:
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.confirmOrder('${order.id}')">✅ Confirm Order</button>`);
                    actions.push(`<button class="btn btn-danger btn-sm" onclick="SellerOrders.cancelOrder('${order.id}')">❌ Cancel</button>`);
                    break;
                    
                case ORDER_STATUS.CONFIRMED:
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsProcessing('${order.id}')">📦 Start Processing</button>`);
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.contactBuyer('${order.id}')">💬 Contact Buyer</button>`);
                    break;
                    
                case ORDER_STATUS.PROCESSING:
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsShipped('${order.id}')">🚚 Mark as Shipped</button>`);
                    break;
                    
                case ORDER_STATUS.SHIPPED:
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsDelivered('${order.id}')">📦 Mark as Delivered</button>`);
                    break;
                    
                case ORDER_STATUS.DELIVERED:
                    if (order.escrow_status === ESCROW_STATUS.FUNDS_HELD) {
                        actions.push(`<button class="btn btn-success btn-sm" onclick="SellerOrders.requestFundRelease('${order.id}')">💰 Request Fund Release</button>`);
                    }
                    break;
                    
                case ORDER_STATUS.COMPLETED:
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.viewOrderDetails('${order.id}')">📋 View Details</button>`);
                    break;
            }
            
            // Always add view details option
            if (order.status !== ORDER_STATUS.COMPLETED) {
                actions.push(`<button class="btn btn-outline btn-sm" onclick="SellerOrders.viewOrderDetails('${order.id}')">📋 Details</button>`);
            }
            
            return actions.join(' ');
        },
        
        // Order status update functions
        async confirmOrder(orderId) {
            try {
                showNotification('✅ Confirming order...', 'info');
                await this.updateOrderStatus(orderId, ORDER_STATUS.CONFIRMED);
                showNotification('Order confirmed! Buyer has been notified.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error confirming order: ' + error.message, 'error');
            }
        },
        
        async markAsProcessing(orderId) {
            try {
                showNotification('📦 Updating order status...', 'info');
                await this.updateOrderStatus(orderId, ORDER_STATUS.PROCESSING);
                showNotification('Order marked as processing!', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error updating order: ' + error.message, 'error');
            }
        },
        
        async markAsShipped(orderId) {
            const trackingNumber = prompt('Enter tracking number (optional):');
            try {
                showNotification('🚚 Marking as shipped...', 'info');
                await this.updateOrderStatus(orderId, ORDER_STATUS.SHIPPED, { tracking_number: trackingNumber });
                showNotification('Order marked as shipped! Buyer has been notified.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error updating order: ' + error.message, 'error');
            }
        },
        
        async markAsDelivered(orderId) {
            try {
                showNotification('📦 Marking as delivered...', 'info');
                await this.updateOrderStatus(orderId, ORDER_STATUS.DELIVERED, { 
                    delivered_at: new Date().toISOString() 
                });
                showNotification('Order marked as delivered! Escrow countdown started.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error updating order: ' + error.message, 'error');
            }
        },
        
        async requestFundRelease(orderId) {
            try {
                showNotification('💰 Requesting fund release...', 'info');
                
                // Simulate escrow fund release request
                const order = sellerOrders.find(o => o.id === orderId);
                if (order && typeof EscrowPlayacting !== 'undefined') {
                    const result = await EscrowPlayacting.simulateRelease(orderId, order.sellerId);
                    if (result.success) {
                        await this.updateOrderStatus(orderId, ORDER_STATUS.COMPLETED, {
                            escrow_status: ESCROW_STATUS.RELEASED,
                            funds_released_at: new Date().toISOString()
                        });
                        showNotification('🎉 Funds released! Payment is on the way.', 'success');
                        this.refreshOrders();
                    }
                } else {
                    showNotification('Fund release requested! Buyer has 72 hours to confirm or dispute.', 'info');
                }
            } catch (error) {
                showNotification('Error requesting fund release: ' + error.message, 'error');
            }
        },
        
        async cancelOrder(orderId) {
            if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
                return;
            }
            
            try {
                showNotification('❌ Cancelling order...', 'info');
                await this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
                showNotification('Order cancelled. Refund will be processed automatically.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error cancelling order: ' + error.message, 'error');
            }
        },
        
        // Update order status (simulate API call)
        async updateOrderStatus(orderId, newStatus, additionalData = {}) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const orderIndex = sellerOrders.findIndex(o => o.id === orderId);
                    if (orderIndex >= 0) {
                        sellerOrders[orderIndex].status = newStatus;
                        sellerOrders[orderIndex].isNewOrder = false; // Remove new badge
                        Object.assign(sellerOrders[orderIndex], additionalData);
                        
                        // Update localStorage
                        const allOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
                        const globalOrderIndex = allOrders.findIndex(o => o.id === orderId);
                        if (globalOrderIndex >= 0) {
                            allOrders[globalOrderIndex] = sellerOrders[orderIndex];
                        } else {
                            allOrders.push(sellerOrders[orderIndex]);
                        }
                        localStorage.setItem('sellerOrders', JSON.stringify(allOrders));
                        
                        resolve({ success: true });
                    } else {
                        reject(new Error('Order not found'));
                    }
                }, 1000);
            });
        },
        
        // Display seller statistics
        displaySellerStats(containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            const stats = this.calculateSellerStats();
            
            container.innerHTML = `
                <div class="seller-stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${stats.totalOrders}</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${stats.newOrders}</div>
                        <div class="stat-label">New Orders</div>
                        ${stats.newOrders > 0 ? '<div class="stat-indicator new">NEW</div>' : ''}
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">$${stats.totalEarnings.toFixed(2)}</div>
                        <div class="stat-label">Total Earnings</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">$${stats.pendingEarnings.toFixed(2)}</div>
                        <div class="stat-label">Pending in Escrow</div>
                    </div>
                </div>
            `;
        },
        
        // Calculate seller statistics
        calculateSellerStats() {
            const newOrders = sellerOrders.filter(o => o.isNewOrder).length;
            const totalEarnings = sellerOrders
                .filter(o => o.status === ORDER_STATUS.COMPLETED)
                .reduce((sum, o) => sum + o.seller_amount, 0);
            const pendingEarnings = sellerOrders
                .filter(o => o.escrow_status === ESCROW_STATUS.FUNDS_HELD)
                .reduce((sum, o) => sum + o.seller_amount, 0);
            
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
                [ORDER_STATUS.PENDING]: 'Pending',
                [ORDER_STATUS.CONFIRMED]: 'Confirmed',
                [ORDER_STATUS.PROCESSING]: 'Processing',
                [ORDER_STATUS.SHIPPED]: 'Shipped',
                [ORDER_STATUS.DELIVERED]: 'Delivered',
                [ORDER_STATUS.COMPLETED]: 'Completed',
                [ORDER_STATUS.CANCELLED]: 'Cancelled',
                [ORDER_STATUS.DISPUTED]: 'Disputed'
            };
            return statusMap[status] || status;
        },
        
        getStatusColor(status) {
            const colorMap = {
                [ORDER_STATUS.PENDING]: '#f59e0b',
                [ORDER_STATUS.CONFIRMED]: '#3b82f6',
                [ORDER_STATUS.PROCESSING]: '#8b5cf6',
                [ORDER_STATUS.SHIPPED]: '#06b6d4',
                [ORDER_STATUS.DELIVERED]: '#10b981',
                [ORDER_STATUS.COMPLETED]: '#059669',
                [ORDER_STATUS.CANCELLED]: '#6b7280',
                [ORDER_STATUS.DISPUTED]: '#dc2626'
            };
            return colorMap[status] || '#6b7280';
        },
        
        createEscrowBadge(escrowStatus) {
            if (!escrowStatus) return '';
            
            const badges = {
                [ESCROW_STATUS.PENDING]: { text: 'Payment Pending', color: '#f59e0b' },
                [ESCROW_STATUS.FUNDS_HELD]: { text: 'Funds Secured', color: '#3b82f6' },
                [ESCROW_STATUS.DISPUTED]: { text: 'Disputed', color: '#dc2626' },
                [ESCROW_STATUS.RELEASED]: { text: 'Funds Released', color: '#059669' },
                [ESCROW_STATUS.CANCELLED]: { text: 'Cancelled', color: '#6b7280' }
            };
            
            const badge = badges[escrowStatus];
            if (!badge) return '';
            
            return `<span class="escrow-badge-small" style="background-color: ${badge.color}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">${badge.text}</span>`;
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
        
        // Event handlers
        setupEventListeners() {
            // Set up any global event listeners for seller orders
        },
        
        refreshOrders() {
            const currentUser = Auth.getCurrentUser();
            if (currentUser) {
                this.loadSellerOrders(currentUser.id).then(() => {
                    this.displaySellerOrders('sellerOrdersList');
                    this.displaySellerStats('sellerStatsContainer');
                    this.updateNotificationBadge();
                });
            }
        },
        
        updateNotificationBadge() {
            const newOrdersCount = sellerOrders.filter(o => o.isNewOrder).length;
            const badge = document.getElementById('orderNotificationBadge');
            
            if (badge) {
                if (newOrdersCount > 0) {
                    badge.textContent = newOrdersCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
        },
        
        // Placeholder functions for UI interactions
        contactBuyer(orderId) {
            showNotification('💬 Buyer contact form would open here', 'info');
        },
        
        viewOrderDetails(orderId) {
            showNotification('📋 Detailed order view would open here', 'info');
        },
        
        showAllOrders() {
            showNotification('📋 Full orders page would open here', 'info');
        },
        
        // Load notifications (placeholder)
        async loadNotifications(sellerId) {
            notifications = []; // Placeholder
        }
    };
})();