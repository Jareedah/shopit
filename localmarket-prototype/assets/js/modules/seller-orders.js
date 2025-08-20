// Seller Order Management Module - FIXED VERSION
const SellerOrders = (function() {
    'use strict';
    
    let sellerOrders = [];
    let currentSellerId = null;
    
    return {
        // Initialize seller orders system
        async init(sellerId) {
            console.log('SellerOrders.init called with sellerId:', sellerId);
            currentSellerId = sellerId;
            
            try {
                // Load orders first
                await this.loadSellerOrders(sellerId);
                
                // Update notification badge
                this.updateNotificationBadge();
                
                console.log('SellerOrders initialized successfully, orders:', sellerOrders.length);
            } catch (error) {
                console.error('Error initializing seller orders:', error);
            }
        },
        
        // Load orders for seller
        async loadSellerOrders(sellerId) {
            try {
                // Get orders from localStorage
                const allOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
                
                // Filter orders for this seller
                const sellerSpecificOrders = allOrders.filter(order => 
                    order.sellerId === sellerId || 
                    (sellerId === 'admin_001' && order.sellerId === 'admin_001') ||
                    (sellerId === 'admin_002' && order.sellerId === 'admin_002')
                );
                
                // Add sample orders for demonstration (only if no real orders exist)
                if (sellerSpecificOrders.length === 0) {
                    const sampleOrders = this.generateSampleOrders(sellerId);
                    sellerSpecificOrders.push(...sampleOrders);
                    
                    // Store sample orders
                    const updatedAllOrders = [...allOrders, ...sampleOrders];
                    localStorage.setItem('sellerOrders', JSON.stringify(updatedAllOrders));
                }
                
                sellerOrders = sellerSpecificOrders;
                console.log('Loaded seller orders:', sellerOrders);
                
                return sellerOrders;
            } catch (error) {
                console.error('Error loading seller orders:', error);
                sellerOrders = [];
                return [];
            }
        },
        
        // Generate sample orders for demonstration
        generateSampleOrders(sellerId) {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            
            return [
                {
                    id: 'order_sample_' + Date.now(),
                    listingId: 'listing_001',
                    listingTitle: 'iPhone 13 Pro - Excellent Condition',
                    buyerId: 'buyer_demo_001',
                    buyerName: 'John Smith',
                    buyerEmail: 'john@example.com',
                    sellerId: sellerId,
                    quantity: 1,
                    price: 650.00,
                    platform_fee: 13.00,
                    total_amount: 663.00,
                    seller_amount: 650.00,
                    status: 'pending',
                    escrow_status: 'funds_held',
                    escrow_id: 'escrow_sample_001',
                    created_at: now.toISOString(),
                    payment_method: 'escrow',
                    buyer_message: 'Looking forward to this purchase! When can you ship?',
                    shipping_address: '123 Main St, New York, NY 10001',
                    isNewOrder: true
                }
            ];
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
                                    💰 Escrow Secured
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
            console.log('Orders displayed successfully');
        },
        
        // Generate action buttons based on order status
        generateOrderActions(order) {
            let actions = [];
            
            switch (order.status) {
                case 'pending':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.confirmOrder('${order.id}')">✅ Confirm Order</button>`);
                    actions.push(`<button class="btn btn-danger btn-sm" onclick="SellerOrders.cancelOrder('${order.id}')">❌ Cancel</button>`);
                    break;
                    
                case 'confirmed':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.markAsProcessing('${order.id}')">📦 Start Processing</button>`);
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.contactBuyer('${order.id}')">💬 Contact Buyer</button>`);
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
        
        // Order status update functions
        async confirmOrder(orderId) {
            try {
                showNotification('✅ Confirming order...', 'info');
                await this.updateOrderStatus(orderId, 'confirmed');
                showNotification('Order confirmed! Buyer has been notified.', 'success');
                this.refreshOrders();
            } catch (error) {
                showNotification('Error confirming order: ' + error.message, 'error');
            }
        },
        
        async updateOrderStatus(orderId, newStatus) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const orderIndex = sellerOrders.findIndex(o => o.id === orderId);
                    if (orderIndex >= 0) {
                        sellerOrders[orderIndex].status = newStatus;
                        sellerOrders[orderIndex].isNewOrder = false;
                        
                        // Update localStorage
                        const allOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
                        const globalOrderIndex = allOrders.findIndex(o => o.id === orderId);
                        if (globalOrderIndex >= 0) {
                            allOrders[globalOrderIndex] = sellerOrders[orderIndex];
                            localStorage.setItem('sellerOrders', JSON.stringify(allOrders));
                        }
                        
                        resolve({ success: true });
                    }
                }, 500);
            });
        },
        
        refreshOrders() {
            if (currentSellerId) {
                this.displaySellerOrders('sellerOrdersList');
                this.updateNotificationBadge();
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
        
        markAsProcessing(orderId) {
            this.updateOrderStatus(orderId, 'processing').then(() => {
                showNotification('Order marked as processing!', 'success');
                this.refreshOrders();
            });
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
            showNotification('💰 Fund release requested! Buyer has 72 hours to confirm.', 'success');
        },
        
        contactBuyer(orderId) {
            showNotification('💬 Buyer contact form would open here', 'info');
        },
        
        viewOrderDetails(orderId) {
            showNotification('📋 Detailed order view would open here', 'info');
        },
        
        showAllOrders() {
            showNotification('📋 Full orders page would open here', 'info');
        }
    };
})();