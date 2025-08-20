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

        // Complete purchase
        async completePurchase() {
            try {
                const user = Auth.getCurrentUser();
                
                const orderData = {
                    listingId: currentListing.id,
                    sellerId: currentListing.sellerId,
                    quantity: currentQuantity,
                    total_amount: currentListing.price * currentQuantity + Math.max(1, currentListing.price * currentQuantity * 0.02)
                };
                
                const response = await API.post('../api/orders/create.php', orderData);
                
                if (response.success) {
                    this.showCompletionStep(response.order);
                    showNotification('Purchase completed successfully!', 'success');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Purchase error:', error);
                showNotification('Error completing purchase: ' + error.message, 'error');
            }
        }
    };
})();