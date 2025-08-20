/**
 * Orders Module
 * Handles order management, filtering, and display
 */

const Orders = (function() {
    let allOrders = [];
    let currentFilters = {
        status: '',
        timeRange: '30'
    };

    return {
        // Initialize orders module
        async init() {
            try {
                await this.loadOrders();
                this.applyFilters();
            } catch (error) {
                console.error('Orders initialization error:', error);
                this.showError('Unable to load orders: ' + error.message);
            }
        },

        // Load user's orders
        async loadOrders() {
            const user = Auth.getCurrentUser();
            const response = await API.post('../api/orders/list.php', { userId: user.id });
            
            if (response.success) {
                allOrders = response.orders;
            } else {
                throw new Error(response.message);
            }
        },

        // Apply filters to orders
        applyFilters() {
            const statusFilter = document.getElementById('statusFilter').value;
            const timeFilter = document.getElementById('timeFilter').value;
            
            currentFilters.status = statusFilter;
            currentFilters.timeRange = timeFilter;
            
            let filteredOrders = [...allOrders];
            
            // Apply status filter
            if (statusFilter) {
                filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
            }
            
            // Apply time filter
            if (timeFilter !== 'all') {
                const days = parseInt(timeFilter);
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - days);
                
                filteredOrders = filteredOrders.filter(order => {
                    const orderDate = new Date(order.created_at);
                    return orderDate >= cutoffDate;
                });
            }
            
            // Sort by date (newest first)
            filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            this.displayOrders(filteredOrders);
        },

        // Display orders in list
        displayOrders(orders) {
            const ordersList = document.getElementById('ordersList');
            
            if (orders.length === 0) {
                ordersList.innerHTML = `
                    <div class="empty-orders">
                        <h3>No orders found</h3>
                        <p>${allOrders.length === 0 ? 'You haven\'t placed any orders yet.' : 'No orders match your current filters.'}</p>
                        ${allOrders.length === 0 ? '<a href="../search/index.html" class="btn btn-primary">Start Shopping</a>' : ''}
                    </div>
                `;
                return;
            }
            
            let html = '';
            
            orders.forEach(order => {
                // In a real implementation, we'd fetch listing details for each order
                // For this prototype, we'll use placeholder data
                html += `
                    <div class="order-card" data-order-id="${order.id}">
                        <div class="order-header">
                            <div>
                                <div class="order-id">Order #${order.id.substring(7)}</div>
                                <div class="order-date">${new Date(order.created_at).toLocaleDateString()}</div>
                            </div>
                            <span class="order-status status-${order.status}">${order.status}</span>
                        </div>
                        <div class="order-content">
                            <img src="../assets/images/placeholder.jpg" alt="Order item" class="order-image">
                            <div class="order-info">
                                <h4>Purchase Order</h4>
                                <p>Quantity: ${order.quantity} item(s)</p>
                            </div>
                            <div class="order-price">$${order.total_amount.toFixed(2)}</div>
                        </div>
                    </div>
                `;
            });
            
            ordersList.innerHTML = html;
            
            // Add click event listeners
            document.querySelectorAll('.order-card').forEach(card => {
                card.addEventListener('click', () => {
                    const orderId = card.getAttribute('data-order-id');
                    this.showOrderDetail(orderId);
                });
            });
        },

        // Show order detail
        async showOrderDetail(orderId) {
            try {
                const order = allOrders.find(o => o.id === orderId);
                if (!order) {
                    throw new Error('Order not found');
                }
                
                // Fetch order details
                const response = await API.post('../api/orders/get.php', { id: orderId });
                
                if (response.success) {
                    this.displayOrderDetail(response.order);
                    
                    // Show detail view, hide list view
                    document.getElementById('ordersList').classList.add('hidden');
                    document.getElementById('orderDetail').classList.remove('hidden');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading order details:', error);
                showNotification('Unable to load order details: ' + error.message, 'error');
            }
        },

        // Display order detail
        displayOrderDetail(order) {
            const detailContent = document.getElementById('detailContent');
            
            // In a real implementation, we'd fetch listing and seller details
            detailContent.innerHTML = `
                <div class="detail-section">
                    <h4>Order Information</h4>
                    <div class="detail-row">
                        <span class="detail-label">Order ID:</span>
                        <span class="detail-value">${order.id}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Order Date:</span>
                        <span class="detail-value">${new Date(order.created_at).toLocaleString()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status-${order.status}">${order.status}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Updated:</span>
                        <span class="detail-value">${new Date(order.updated_at).toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Items</h4>
                    <div class="order-item">
                        <img src="../assets/images/placeholder.jpg" alt="Order item" class="order-image">
                        <div class="item-details">
                            <h5>Purchased Item</h5>
                            <p>Quantity: ${order.quantity}</p>
                        </div>
                        <div class="item-price">$${order.total_amount.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Payment Details</h4>
                    <div class="detail-row">
                        <span class="detail-label">Subtotal:</span>
                        <span class="detail-value">$${(order.total_amount / 1.02).toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Platform Fee (2%):</span>
                        <span class="detail-value">$${(order.total_amount * 0.02).toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">$${order.total_amount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="order-actions">
                    <button class="btn btn-secondary">Contact Seller</button>
                    <button class="btn btn-primary">Track Order</button>
                    ${order.status === 'delivered' ? '<button class="btn btn-success">Confirm Receipt</button>' : ''}
                    ${order.status === 'confirmed' ? '<button class="btn btn-error">Cancel Order</button>' : ''}
                </div>
            `;
        },

        // Show error state
        showError(message) {
            const ordersList = document.getElementById('ordersList');
            ordersList.innerHTML = `
                <div class="error-state">
                    <h3>Error Loading Orders</h3>
                    <p>${message}</p>
                    <button onclick="Orders.init()" class="btn btn-primary">Try Again</button>
                </div>
            `;
        }
    };
})();