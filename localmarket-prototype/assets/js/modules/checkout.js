/**
 * Checkout Module
 * Handles the checkout process including review, confirmation, and completion
 */

const Checkout = (function() {
    let currentListing = null;
    let currentQuantity = 1;
    let currentStep = 1;

    return {
        // Initialize checkout process
        async init(listingId, quantity = 1) {
            try {
                currentQuantity = quantity;
                
                // Load listing details
                const response = await API.post('../api/listings/get.php', { id: listingId });
                
                if (response.success) {
                    currentListing = response.listing;
                    this.showReviewStep();
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Checkout initialization error:', error);
                showError('Unable to load listing details: ' + error.message);
            }
        },

        // Show order review step
        showReviewStep() {
            currentStep = 1;
            this.updateStepIndicator();
            
            const checkoutContent = document.getElementById('checkoutContent');
            checkoutContent.innerHTML = this.generateReviewHTML();
            
            // Add event listeners
            this.setupReviewEventListeners();
        },

        // Show confirmation step
        showConfirmationStep() {
            currentStep = 2;
            this.updateStepIndicator();
            
            const checkoutContent = document.getElementById('checkoutContent');
            checkoutContent.innerHTML = this.generateConfirmationHTML();
            
            // Add event listeners
            document.getElementById('confirmPurchase').addEventListener('click', () => {
                this.completePurchase();
            });
            
            document.getElementById('editOrder').addEventListener('click', () => {
                this.showReviewStep();
            });
        },

        // Show completion step
        showCompletionStep(order) {
            currentStep = 3;
            this.updateStepIndicator();
            
            const checkoutContent = document.getElementById('checkoutContent');
            checkoutContent.innerHTML = this.generateCompletionHTML(order);
        },

        // Update step indicator
        updateStepIndicator() {
            const steps = document.querySelectorAll('.step');
            steps.forEach((step, index) => {
                if (index + 1 === currentStep) {
                    step.classList.add('active');
                } else if (index + 1 < currentStep) {
                    step.classList.add('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
        },

        // Generate review step HTML
        generateReviewHTML() {
            const subtotal = currentListing.price * currentQuantity;
            const platformFee = Math.max(1, subtotal * 0.02); // 2% or $1 minimum
            const total = subtotal + platformFee;
            
            return `
                <div class="order-review">
                    <div class="order-items">
                        <h3>Order Items</h3>
                        <div class="order-item">
                            <img src="../uploads/${currentListing.images[0] || '../assets/images/placeholder.jpg'}" 
                                 alt="${currentListing.title}" class="order-item-image"
                                 onerror="this.src='../assets/images/placeholder.jpg'">
                            <div class="item-details">
                                <h4>${currentListing.title}</h4>
                                <p class="item-category">${currentListing.category}</p>
                                <p class="item-description">${currentListing.description}</p>
                            </div>
                            <div class="item-price">
                                <div class="price">$${currentListing.price}</div>
                                <div class="quantity-controls">
                                    <button class="quantity-btn" onclick="Checkout.updateQuantity(${currentQuantity - 1})">-</button>
                                    <input type="number" class="quantity-input" value="${currentQuantity}" 
                                           min="1" max="99" onchange="Checkout.updateQuantity(this.value)">
                                    <button class="quantity-btn" onclick="Checkout.updateQuantity(${currentQuantity + 1})">+</button>
                                </div>
                                <div class="item-total">$${(currentListing.price * currentQuantity).toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="order-summary">
                        <h3>Order Summary</h3>
                        <div class="summary-item">
                            <span>Subtotal</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-item">
                            <span>Platform Fee</span>
                            <span>$${platformFee.toFixed(2)}</span>
                        </div>
                        <div class="summary-total">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <button id="proceedToConfirm" class="btn btn-primary btn-full">Proceed to Confirmation</button>
                    </div>
                </div>
            `;
        },

        // Generate confirmation step HTML
        generateConfirmationHTML() {
            const subtotal = currentListing.price * currentQuantity;
            const platformFee = Math.max(1, subtotal * 0.02);
            const total = subtotal + platformFee;
            
            return `
                <div class="confirmation-step">
                    <div class="confirmation-icon">✓</div>
                    <h3>Confirm Your Order</h3>
                    <p>Please review your order details before completing the purchase</p>
                    
                    <div class="order-details">
                        <div class="detail-row">
                            <strong>Item:</strong>
                            <span>${currentListing.title}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Quantity:</strong>
                            <span>${currentQuantity}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Price per item:</strong>
                            <span>$${currentListing.price.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Subtotal:</strong>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Platform Fee:</strong>
                            <span>$${platformFee.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Total Amount:</strong>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Seller:</strong>
                            <span>${currentListing.sellerId}</span>
                        </div>
                    </div>
                    
                    <div class="confirmation-actions">
                        <button id="confirmPurchase" class="btn btn-success">Confirm Purchase</button>
                        <button id="editOrder" class="btn btn-secondary">Edit Order</button>
                    </div>
                </div>
            `;
        },

        // Generate completion step HTML
        generateCompletionHTML(order) {
            return `
                <div class="completion-step">
                    <div class="completion-icon">🎉</div>
                    <h3>Order Confirmed!</h3>
                    <p>Your purchase has been successfully completed</p>
                    
                    <div class="order-details">
                        <div class="detail-row">
                            <strong>Order ID:</strong>
                            <span>${order.id}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Order Date:</strong>
                            <span>${new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Total Amount:</strong>
                            <span>$${order.total_amount.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Status:</strong>
                            <span class="status-badge">${order.status}</span>
                        </div>
                    </div>
                    
                    <div class="completion-actions">
                        <a href="../dashboard/index.html" class="btn btn-primary">View Order History</a>
                        <a href="../search/index.html" class="btn btn-secondary">Continue Shopping</a>
                    </div>
                    
                    <div class="next-steps">
                        <h4>What happens next?</h4>
                        <ul>
                            <li>The seller has been notified of your purchase</li>
                            <li>You can contact the seller to arrange delivery/pickup</li>
                            <li>Track your order status from your dashboard</li>
                            <li>Leave a review after you receive your item</li>
                        </ul>
                    </div>
                </div>
            `;
        },

        // Setup review step event listeners
        setupReviewEventListeners() {
            document.getElementById('proceedToConfirm').addEventListener('click', () => {
                this.showConfirmationStep();
            });
        },

        // Update quantity
        updateQuantity(newQuantity) {
            newQuantity = parseInt(newQuantity);
            if (isNaN(newQuantity)) newQuantity = 1;
            newQuantity = Math.max(1, Math.min(99, newQuantity));
            
            currentQuantity = newQuantity;
            this.showReviewStep();
        },

        // Complete purchase with escrow integration
        async completePurchase() {
            try {
                const user = Auth.getCurrentUser();
                const totalAmount = currentListing.price * currentQuantity + Math.max(1, currentListing.price * currentQuantity * 0.02);
                
                // Show payment processing step
                this.showPaymentProcessingStep(totalAmount);
                
                const orderData = {
                    listingId: currentListing.id,
                    sellerId: currentListing.sellerId,
                    quantity: currentQuantity,
                    total_amount: totalAmount,
                    payment_method: 'escrow',
                    escrow_status: 'pending'
                };
                
                // Create order first
                const response = await API.post('../api/orders/create.php', orderData);
                
                if (response.success) {
                    const orderId = response.order.id;
                    
                    // Store order for seller notification
                    this.storeOrderForSeller(response.order, user, currentListing);
                    
                    // Simulate escrow payment processing
                    const escrowResult = await EscrowPlayacting.simulatePayment(orderId, totalAmount);
                    
                    if (escrowResult.success) {
                        // Update order with escrow details
                        response.order.escrow_status = escrowResult.status;
                        response.order.escrow_id = escrowResult.escrowId;
                        
                        // Show completion with escrow information
                        this.showEscrowCompletionStep(response.order, escrowResult);
                        showNotification('🔒 Payment secured in escrow!', 'success');
                    } else {
                        throw new Error('Escrow payment failed');
                    }
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Purchase error:', error);
                showNotification('Error completing purchase: ' + error.message, 'error');
            }
        },
        
        // Show payment processing step
        showPaymentProcessingStep(amount) {
            const checkoutContent = document.getElementById('checkoutContent');
            
            // Update checkout steps
            document.querySelectorAll('.step').forEach((step, index) => {
                step.classList.toggle('active', index === 1);
                step.classList.toggle('completed', index < 1);
            });
            
            checkoutContent.innerHTML = `
                <div class="payment-processing">
                    <div class="processing-header">
                        <h3>🔒 Securing Your Payment</h3>
                        <p>Your payment of $${amount.toFixed(2)} is being processed securely...</p>
                    </div>
                    
                    <div id="paymentConfirmation" class="payment-confirmation-container">
                        <!-- Escrow payment confirmation will be inserted here -->
                    </div>
                    
                    <div class="escrow-info">
                        <h4>🛡️ Protected by Escrow</h4>
                        <ul>
                            <li>✅ Your money is held safely until delivery</li>
                            <li>✅ Seller gets paid only after you confirm receipt</li>
                            <li>✅ 72-hour dispute window for your protection</li>
                            <li>✅ Full refund if item not as described</li>
                        </ul>
                    </div>
                </div>
            `;
        },
        
        // Show escrow completion step
        showEscrowCompletionStep(order, escrowResult) {
            const checkoutContent = document.getElementById('checkoutContent');
            
            // Update checkout steps
            document.querySelectorAll('.step').forEach((step, index) => {
                step.classList.toggle('active', index === 2);
                step.classList.toggle('completed', index < 2);
            });
            
            checkoutContent.innerHTML = `
                <div class="escrow-completion">
                    <div class="completion-header">
                        <div class="success-icon">🎉</div>
                        <h3>Order Placed Successfully!</h3>
                        <p>Your payment is safely secured in escrow</p>
                    </div>
                    
                    <div class="order-summary-card">
                        <h4>Order Details</h4>
                        <div class="detail-row">
                            <strong>Order ID:</strong>
                            <span>${order.id}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Item:</strong>
                            <span>${currentListing.title}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Quantity:</strong>
                            <span>${order.quantity}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Total Amount:</strong>
                            <span>$${order.total_amount.toFixed(2)}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Payment Status:</strong>
                            ${EscrowPlayacting.createStatusBadge(escrowResult.status)}
                        </div>
                        <div class="detail-row">
                            <strong>Escrow ID:</strong>
                            <span>${escrowResult.escrowId}</span>
                        </div>
                    </div>
                    
                    <div id="escrowCountdown" class="escrow-countdown-container">
                        <!-- Countdown timer will be inserted here -->
                    </div>
                    
                    <div class="escrow-timeline-container">
                        <h4>📋 Transaction Timeline</h4>
                        ${EscrowPlayacting.createEscrowTimeline(order.id, escrowResult.status)}
                    </div>
                    
                    <div class="completion-actions">
                        <button class="btn btn-primary" onclick="window.location.href='../dashboard/orders.html'">
                            📦 View Order Details
                        </button>
                        <button class="btn btn-secondary" onclick="window.location.href='../search/index.html'">
                            🛍️ Continue Shopping
                        </button>
                    </div>
                    
                    <div class="next-steps">
                        <h4>🚀 What happens next?</h4>
                        <ul>
                            <li>💰 <strong>Your payment is secured</strong> - Funds held safely in escrow</li>
                            <li>📧 <strong>Seller notified</strong> - They'll prepare your item for delivery</li>
                            <li>📦 <strong>Item delivery</strong> - Seller will mark as delivered when shipped</li>
                            <li>✅ <strong>Confirm receipt</strong> - You have 72 hours to confirm or dispute</li>
                            <li>🎉 <strong>Funds released</strong> - Payment goes to seller after confirmation</li>
                        </ul>
                    </div>
                    
                    <div class="escrow-actions">
                        <button class="btn btn-outline" onclick="EscrowPlayacting.viewDisputeDetails('${order.id}')">
                            ❓ How Disputes Work
                        </button>
                        <button class="btn btn-outline" onclick="EscrowPlayacting.contactSupport('${order.id}')">
                            📞 Contact Support
                        </button>
                    </div>
                </div>
            `;
            
            // Start the escrow countdown
            setTimeout(() => {
                EscrowPlayacting.startEscrowCountdown(order.id, 72);
            }, 1000);
        },
        
        // Store order for seller notification (playacting)
        storeOrderForSeller(order, buyer, listing) {
            try {
                const sellerOrder = {
                    id: order.id,
                    listingId: listing.id,
                    listingTitle: listing.title,
                    buyerId: buyer.id,
                    buyerName: buyer.username,
                    buyerEmail: buyer.email || `${buyer.username}@example.com`,
                    sellerId: listing.sellerId,
                    quantity: order.quantity,
                    price: listing.price,
                    platform_fee: order.total_amount - (listing.price * order.quantity),
                    total_amount: order.total_amount,
                    seller_amount: listing.price * order.quantity,
                    status: 'pending',
                    escrow_status: 'funds_held',
                    escrow_id: `escrow_${Date.now()}`,
                    created_at: new Date().toISOString(),
                    payment_method: 'escrow',
                    buyer_message: 'Thank you for your item! Looking forward to receiving it.',
                    shipping_address: '123 Sample St, Sample City, SC 12345',
                    isNewOrder: true
                };
                
                // Get existing seller orders from localStorage
                const existingOrders = JSON.parse(localStorage.getItem('sellerOrders') || '[]');
                
                // Add new order
                existingOrders.push(sellerOrder);
                
                // Store back to localStorage
                localStorage.setItem('sellerOrders', JSON.stringify(existingOrders));
                
                console.log('Order stored for seller:', sellerOrder);
                
            } catch (error) {
                console.error('Error storing order for seller:', error);
            }
        }
    };
})();