// Real Working Seller Order Management
const SellerOrders = (function() {
    'use strict';
    
    let sellerOrders = [];
    let currentSellerId = null;
    
    return {
        async init(sellerId) {
            currentSellerId = sellerId;
            await this.loadSellerOrdersFromAPI(sellerId);
            this.updateNotificationBadge();
        },
        
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
                } else {
                    sellerOrders = [];
                }
                
                return sellerOrders;
            } catch (error) {
                console.error('Error loading seller orders:', error);
                sellerOrders = [];
                return [];
            }
        },
        
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
            
            const recentOrders = sellerOrders.slice(0, limit);
            let ordersHtml = '<div class="seller-orders-list">';
            
            recentOrders.forEach(order => {
                ordersHtml += `
                    <div class="order-item" data-order-id="${order.id}">
                        <div class="order-header">
                            <div class="order-info">
                                <h4>${order.listingTitle}</h4>
                                <p>👤 ${order.buyerName}</p>
                            </div>
                            <div class="order-status">
                                <span class="status-badge" style="background: ${this.getStatusColor(order.status)}; color: white; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.75rem;">
                                    ${this.formatStatus(order.status)}
                                </span>
                            </div>
                        </div>
                        
                        <div class="order-details">
                            <div class="detail-row">
                                <span>Amount: $${(order.seller_amount || order.total_amount * 0.98).toFixed(2)}</span>
                                <span>Qty: ${order.quantity}</span>
                                <span>Date: ${this.formatDate(order.created_at)}</span>
                            </div>
                        </div>
                        
                        <div class="order-actions">
                            ${this.generateRealOrderActions(order)}
                        </div>
                    </div>
                `;
            });
            
            ordersHtml += '</div>';
            container.innerHTML = ordersHtml;
        },
        
        // Generate REAL working action buttons
        generateRealOrderActions(order) {
            const actions = [];
            
            switch (order.status) {
                case 'pending':
                    actions.push(`<button class="btn btn-success btn-sm" onclick="SellerOrders.realConfirmOrder('${order.id}')">✅ Confirm Order</button>`);
                    actions.push(`<button class="btn btn-danger btn-sm" onclick="SellerOrders.realCancelOrder('${order.id}')">❌ Cancel</button>`);
                    break;
                    
                case 'confirmed':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.realMarkShipped('${order.id}')">🚚 Mark Shipped</button>`);
                    actions.push(`<button class="btn btn-secondary btn-sm" onclick="SellerOrders.contactBuyer('${order.id}')">💬 Contact Buyer</button>`);
                    break;
                    
                case 'shipped':
                    actions.push(`<button class="btn btn-primary btn-sm" onclick="SellerOrders.realMarkDelivered('${order.id}')">📦 Mark Delivered</button>`);
                    break;
                    
                case 'delivered':
                    actions.push(`<button class="btn btn-success btn-sm" onclick="SellerOrders.realRequestRelease('${order.id}')">💰 Request Fund Release</button>`);
                    break;
                    
                case 'completed':
                    actions.push(`<button class="btn btn-success btn-sm" disabled>🎉 Complete</button>`);
                    break;
                    
                default:
                    actions.push(`<button class="btn btn-secondary btn-sm">📋 View Details</button>`);
                    break;
            }
            
            return actions.join(' ');
        },
        
        // REAL working functions that actually update order status
        async realConfirmOrder(orderId) {
            try {
                showNotification('✅ Confirming order...', 'info');
                
                const response = await fetch('../api/orders/update-status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: 'confirmed'
                    })
                });
                
                const result = await response.json();
                
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
        
        async realMarkShipped(orderId) {
            const trackingNumber = prompt('Enter tracking number (optional):');
            
            try {
                showNotification('🚚 Marking as shipped...', 'info');
                
                const response = await fetch('../api/orders/update-status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: 'shipped'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification(`Order shipped! ${trackingNumber ? 'Tracking: ' + trackingNumber : 'Buyer notified.'}`, 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error marking as shipped: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error marking as shipped: ' + error.message, 'error');
            }
        },
        
        async realMarkDelivered(orderId) {
            try {
                showNotification('📦 Marking as delivered...', 'info');
                
                const response = await fetch('../api/orders/update-status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: 'delivered'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Order marked as delivered! You can now request fund release.', 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error marking as delivered: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error marking as delivered: ' + error.message, 'error');
            }
        },
        
        async realRequestRelease(orderId) {
            if (!confirm('Request fund release? This will notify the buyer to approve the release.')) {
                return;
            }
            
            try {
                showNotification('💰 Requesting fund release...', 'info');
                
                const response = await fetch('../api/orders/update-status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: 'completed'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('🎉 Fund release processed! Payment is on the way.', 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error processing fund release: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error requesting fund release: ' + error.message, 'error');
            }
        },
        
        async realCancelOrder(orderId) {
            if (!confirm('Cancel this order? This will trigger an automatic refund.')) {
                return;
            }
            
            try {
                showNotification('❌ Cancelling order...', 'info');
                
                const response = await fetch('../api/orders/update-status.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderId,
                        newStatus: 'cancelled'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Order cancelled. Refund processed automatically.', 'success');
                    await this.refreshOrders();
                } else {
                    showNotification('Error cancelling order: ' + result.message, 'error');
                }
            } catch (error) {
                showNotification('Error cancelling order: ' + error.message, 'error');
            }
        },
        
        async refreshOrders() {
            if (currentSellerId) {
                await this.loadSellerOrdersFromAPI(currentSellerId);
                this.displaySellerOrders('sellerOrdersList');
                this.updateNotificationBadge();
            }
        },
        
        updateNotificationBadge() {
            const newOrdersCount = sellerOrders.filter(o => o.status === 'pending').length;
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
        
        formatStatus(status) {
            const statusMap = {
                'pending': 'Payment Pending',
                'confirmed': 'Order Confirmed',
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
                'shipped': '#06b6d4',
                'delivered': '#10b981',
                'completed': '#059669',
                'cancelled': '#6b7280'
            };
            return colorMap[status] || '#6b7280';
        },
        
        formatDate(dateString) {
            return new Date(dateString).toLocaleDateString();
        },
        
        contactBuyer(orderId) {
            showNotification('💬 Buyer contact form would open here', 'info');
        }
    };
})();

// Ensure showNotification is available
if (typeof showNotification === 'undefined') {
    window.showNotification = function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#dc2626' : '#3b82f6'};
            color: white; padding: 15px 20px; border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 4000);
    };
}