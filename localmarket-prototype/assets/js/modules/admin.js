/**
 * Admin Panel Module
 * Handles administrative functionality including user management, analytics, and system settings
 */

const AdminPanel = (function() {
    let currentTab = 'overview';
    let systemStats = {};
    let usersData = [];
    let listingsData = [];

    return {
        // Initialize admin panel
        async init() {
            try {
                await this.loadSystemStats();
                await this.loadRecentActivity();
                this.setupEventListeners();
            } catch (error) {
                console.error('Admin panel initialization error:', error);
                showNotification('Error initializing admin panel: ' + error.message, 'error');
            }
        },

        // Switch between tabs
        async switchTab(tabName) {
            // Update UI
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            currentTab = tabName;
            
            // Load tab-specific data
            switch (tabName) {
                case 'users':
                    await this.loadUsers();
                    break;
                case 'listings':
                    await this.loadListingsForModeration();
                    break;
                case 'analytics':
                    await this.loadAnalytics();
                    break;
                case 'settings':
                    await this.loadSystemSettings();
                    break;
            }
        },

        // Load system statistics
        async loadSystemStats() {
            try {
                const response = await API.post('../api/admin/stats.php');
                
                if (response.success) {
                    systemStats = response.data;
                    this.updateStatsDisplay();
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading system stats:', error);
                showNotification('Error loading statistics: ' + error.message, 'error');
            }
        },

        // Update stats display
        updateStatsDisplay() {
            document.getElementById('totalUsers').textContent = systemStats.totalUsers || 0;
            document.getElementById('activeListings').textContent = systemStats.activeListings || 0;
            document.getElementById('totalOrders').textContent = systemStats.totalOrders || 0;
            document.getElementById('totalRevenue').textContent = '$' + (systemStats.totalRevenue || 0).toFixed(2);
            
            // Update change indicators (simplified)
            if (systemStats.userGrowth) {
                const changeElem = document.getElementById('userChange');
                changeElem.textContent = `${systemStats.userGrowth}% from last period`;
                changeElem.className = `stat-change ${systemStats.userGrowth >= 0 ? 'positive' : 'negative'}`;
            }
        },

        // Load recent activity
        async loadRecentActivity() {
            try {
                const response = await API.post('../api/admin/activity.php');
                const activityList = document.getElementById('activityList');
                
                if (response.success && response.data.length > 0) {
                    let html = '';
                    response.data.forEach(activity => {
                        html += `
                            <div class="activity-item">
                                <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                                <div class="activity-content">
                                    <div class="activity-title">${activity.title}</div>
                                    <div class="activity-desc">${activity.description}</div>
                                    <div class="activity-time">${new Date(activity.timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                        `;
                    });
                    activityList.innerHTML = html;
                } else {
                    activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
                }
            } catch (error) {
                console.error('Error loading activity:', error);
                document.getElementById('activityList').innerHTML = '<div class="error-state">Error loading activity</div>';
            }
        },

        // Get icon for activity type
        getActivityIcon(type) {
            const icons = {
                'user_register': '👤',
                'listing_create': '📝',
                'order_create': '💰',
                'system': '⚙️',
                'warning': '⚠️'
            };
            return icons[type] || '📋';
        },

        // Load users for management
        async loadUsers() {
            try {
                const response = await API.post('../api/admin/users.php');
                const usersList = document.getElementById('usersList');
                
                if (response.success) {
                    usersData = response.data;
                    let html = '';
                    
                    usersData.forEach(user => {
                        html += `
                            <div class="list-item" data-user-id="${user.id}">
                                <span>${user.username} (${user.profile?.name || 'No name'})</span>
                                <span><span class="status-badge status-${user.status || 'active'}">${user.status || 'active'}</span></span>
                                <span>${user.listingsCount || 0}</span>
                                <span>
                                    <button class="btn btn-sm btn-secondary" onclick="AdminPanel.viewUser('${user.id}')">View</button>
                                    ${user.status === 'suspended' ? 
                                        `<button class="btn btn-sm btn-success" onclick="AdminPanel.activateUser('${user.id}')">Activate</button>` : 
                                        `<button class="btn btn-sm btn-error" onclick="AdminPanel.suspendUser('${user.id}')">Suspend</button>`
                                    }
                                </span>
                            </div>
                        `;
                    });
                    
                    usersList.innerHTML = html || '<div class="empty-state">No users found</div>';
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading users:', error);
                document.getElementById('usersList').innerHTML = '<div class="error-state">Error loading users</div>';
            }
        },

        // Load listings for moderation
        async loadListingsForModeration() {
            try {
                const statusFilter = document.getElementById('listingStatusFilter').value;
                const response = await API.post('../api/admin/listings.php', { status: statusFilter });
                const moderationList = document.getElementById('moderationList');
                
                if (response.success) {
                    listingsData = response.data;
                    let html = '';
                    
                    listingsData.forEach(listing => {
                        html += `
                            <div class="list-item" data-listing-id="${listing.id}">
                                <span>${listing.title} ($${listing.price})</span>
                                <span>${listing.sellerUsername}</span>
                                <span><span class="status-badge status-${listing.status}">${listing.status}</span></span>
                                <span>
                                    <button class="btn btn-sm btn-secondary" onclick="AdminPanel.viewListing('${listing.id}')">View</button>
                                    ${listing.status === 'pending' ? `
                                        <button class="btn btn-sm btn-success" onclick="AdminPanel.approveListing('${listing.id}')">Approve</button>
                                        <button class="btn btn-sm btn-error" onclick="AdminPanel.rejectListing('${listing.id}')">Reject</button>
                                    ` : ''}
                                    ${listing.status === 'active' ? `
                                        <button class="btn btn-sm btn-error" onclick="AdminPanel.deactivateListing('${listing.id}')">Deactivate</button>
                                    ` : ''}
                                </span>
                            </div>
                        `;
                    });
                    
                    moderationList.innerHTML = html || '<div class="empty-state">No listings found</div>';
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading listings:', error);
                document.getElementById('moderationList').innerHTML = '<div class="error-state">Error loading listings</div>';
            }
        },

        // Load analytics data
        async loadAnalytics() {
            try {
                const range = document.getElementById('analyticsRange').value;
                const response = await API.post('../api/admin/analytics.php', { range: range });
                
                if (response.success) {
                    this.displayAnalyticsCharts(response.data);
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading analytics:', error);
                showNotification('Error loading analytics: ' + error.message, 'error');
            }
        },

        // Display analytics charts with Apple-inspired design
        displayAnalyticsCharts(data) {
            console.log('Analytics data loaded:', data);
            
            // Update User Registrations with real data
            this.updateAppleChart('registrationsChart', {
                title: 'User Registrations',
                icon: 'ph-chart-line-up',
                color: 'var(--apple-blue)',
                data: data.registrations,
                type: 'trend'
            });
            
            // Update Listing Activity with real data
            this.updateAppleChart('listingsChart', {
                title: 'Listing Activity',
                icon: 'ph-chart-bar',
                color: 'var(--apple-green)',
                data: data.listings,
                type: 'trend'
            });
            
            // Update Transaction Volume with real data
            this.updateAppleChart('transactionsChart', {
                title: 'Transaction Volume',
                icon: 'ph-chart-pie',
                color: 'var(--apple-orange)',
                data: data.transactions,
                type: 'trend'
            });
            
            // Update Category Distribution with real data
            this.updateAppleChart('categoriesChart', {
                title: 'Category Distribution',
                icon: 'ph-chart-donut',
                color: 'var(--apple-purple)',
                data: data.categories,
                type: 'categories'
            });
        },
        
        // Update Apple-styled chart with real data
        updateAppleChart(containerId, config) {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            if (!config.data || config.data.length === 0) {
                // Keep the beautiful "Coming Soon" design for empty data
                container.innerHTML = `
                    <div style="color: ${config.color}; font-size: 48px; margin-bottom: 16px;">
                        <i class="${config.icon}"></i>
                    </div>
                    <p style="color: var(--apple-text-secondary); font-size: 15px;">No Data Available</p>
                    <p style="color: var(--apple-text-tertiary); font-size: 13px;">Check back later</p>
                `;
                return;
            }
            
            if (config.type === 'trend') {
                // Show trend data with Apple-styled metrics
                const total = config.data.reduce((sum, item) => sum + item.value, 0);
                const recent = config.data.slice(-7).reduce((sum, item) => sum + item.value, 0);
                const trend = recent > 0 ? '+' + recent : recent;
                
                container.innerHTML = `
                    <div style="color: ${config.color}; font-size: 48px; margin-bottom: 16px;">
                        <i class="${config.icon}"></i>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <div style="color: var(--apple-text-primary); font-size: 32px; font-weight: 600; margin-bottom: 4px;">${total}</div>
                        <p style="color: var(--apple-text-secondary); font-size: 15px; margin-bottom: 8px;">Total Records</p>
                        <div style="color: ${recent > 0 ? 'var(--apple-green)' : 'var(--apple-text-tertiary)'}; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                            <i class="ph ${recent > 0 ? 'ph-trend-up' : 'ph-minus'}"></i>
                            ${trend} this week
                        </div>
                    </div>
                `;
            } else if (config.type === 'categories') {
                // Show category data with Apple-styled breakdown
                const topCategory = config.data[0];
                const totalCategories = config.data.length;
                
                container.innerHTML = `
                    <div style="color: ${config.color}; font-size: 48px; margin-bottom: 16px;">
                        <i class="${config.icon}"></i>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <div style="color: var(--apple-text-primary); font-size: 24px; font-weight: 600; margin-bottom: 4px;">${totalCategories}</div>
                        <p style="color: var(--apple-text-secondary); font-size: 15px; margin-bottom: 8px;">Active Categories</p>
                        ${topCategory ? `
                            <div style="color: var(--apple-text-tertiary); font-size: 13px;">
                                Top: ${topCategory.label} (${topCategory.percentage}%)
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        },

        // Get color for category
        getCategoryColor(category) {
            const colors = {
                'electronics': '#3b82f6',
                'clothing': '#ef4444',
                'home': '#10b981',
                'vehicles': '#f59e0b',
                'services': '#8b5cf6',
                'other': '#64748b'
            };
            return colors[category.toLowerCase()] || '#94a3b8';
        },

        // Load system settings
        async loadSystemSettings() {
            try {
                const response = await fetch('../api/admin/settings.php', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const settings = result.data;
                    document.getElementById('platformFee').value = settings.platformFee || 2;
                    document.getElementById('minWithdrawal').value = settings.minWithdrawal || 10;
                    document.getElementById('autoApprove').value = settings.autoApprove ? 'true' : 'false';
                    document.getElementById('maxImages').value = settings.maxImages || 5;
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                showNotification('Error loading settings: ' + error.message, 'error');
            }
        },

        // Setup event listeners
        setupEventListeners() {
            // Settings form submission
            document.getElementById('systemSettings').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveSystemSettings();
            });
            
            // Listing filter change
            document.getElementById('listingStatusFilter').addEventListener('change', () => {
                this.loadListingsForModeration();
            });
            
            // Refresh listings
            document.getElementById('refreshListings').addEventListener('click', () => {
                this.loadListingsForModeration();
            });
            
            // Analytics range change
            document.getElementById('analyticsRange').addEventListener('change', () => {
                this.loadAnalytics();
            });
            
            // Maintenance actions
            document.getElementById('backupData').addEventListener('click', () => {
                this.createBackup();
            });
            
            document.getElementById('clearCache').addEventListener('click', () => {
                this.clearCache();
            });
            
            document.getElementById('rebuildIndex').addEventListener('click', () => {
                this.rebuildIndex();
            });
            
            document.getElementById('exportData').addEventListener('click', () => {
                this.exportData();
            });
        },

        // User management actions
        async viewUser(userId) {
            try {
                const response = await API.post('../api/admin/user-detail.php', { userId });
                
                if (response.success) {
                    this.showUserDetail(response.user);
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading user details:', error);
                showNotification('Error loading user details: ' + error.message, 'error');
            }
        },

        async suspendUser(userId) {
            if (confirm('Are you sure you want to suspend this user?')) {
                try {
                    const response = await API.post('../api/admin/suspend-user.php', { userId });
                    
                    if (response.success) {
                        showNotification('User suspended successfully', 'success');
                        this.loadUsers();
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    console.error('Error suspending user:', error);
                    showNotification('Error suspending user: ' + error.message, 'error');
                }
            }
        },

        async activateUser(userId) {
            try {
                const response = await API.post('../api/admin/activate-user.php', { userId });
                
                if (response.success) {
                    showNotification('User activated successfully', 'success');
                    this.loadUsers();
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error activating user:', error);
                showNotification('Error activating user: ' + error.message, 'error');
            }
        },

        // Listing management actions
        async viewListing(listingId) {
            window.open(`../listings/view.html?id=${listingId}`, '_blank');
        },

        async approveListing(listingId) {
            try {
                const response = await API.post('../api/admin/approve-listing.php', { listingId });
                
                if (response.success) {
                    showNotification('Listing approved successfully', 'success');
                    this.loadListingsForModeration();
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error approving listing:', error);
                showNotification('Error approving listing: ' + error.message, 'error');
            }
        },

        async rejectListing(listingId) {
            const reason = prompt('Please enter reason for rejection:');
            if (reason) {
                try {
                    const response = await API.post('../api/admin/reject-listing.php', { 
                        listingId, 
                        reason 
                    });
                    
                    if (response.success) {
                        showNotification('Listing rejected successfully', 'success');
                        this.loadListingsForModeration();
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    console.error('Error rejecting listing:', error);
                    showNotification('Error rejecting listing: ' + error.message, 'error');
                }
            }
        },

        async deactivateListing(listingId) {
            if (confirm('Are you sure you want to deactivate this listing?')) {
                try {
                    const response = await API.post('../api/admin/deactivate-listing.php', { listingId });
                    
                    if (response.success) {
                        showNotification('Listing deactivated successfully', 'success');
                        this.loadListingsForModeration();
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    console.error('Error deactivating listing:', error);
                    showNotification('Error deactivating listing: ' + error.message, 'error');
                }
            }
        },

        // System maintenance actions
        async createBackup() {
            try {
                const response = await API.post('../api/admin/backup.php');
                
                if (response.success) {
                    showNotification('Backup created successfully', 'success');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error creating backup:', error);
                showNotification('Error creating backup: ' + error.message, 'error');
            }
        },

        async clearCache() {
            try {
                const response = await API.post('../api/admin/clear-cache.php');
                
                if (response.success) {
                    showNotification('Cache cleared successfully', 'success');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error clearing cache:', error);
                showNotification('Error clearing cache: ' + error.message, 'error');
            }
        },

        async rebuildIndex() {
            try {
                showNotification('Rebuilding search index...', 'info');
                const response = await API.post('../api/admin/rebuild-index.php');
                
                if (response.success) {
                    showNotification('Search index rebuilt successfully', 'success');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error rebuilding index:', error);
                showNotification('Error rebuilding index: ' + error.message, 'error');
            }
        },

        async exportData() {
            try {
                const response = await API.post('../api/admin/export-data.php');
                
                if (response.success && response.downloadUrl) {
                    window.open(response.downloadUrl, '_blank');
                    showNotification('Data exported successfully', 'success');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error exporting data:', error);
                showNotification('Error exporting data: ' + error.message, 'error');
            }
        },

        // Save system settings
        async saveSystemSettings() {
            try {
                const settings = {
                    platformFee: parseFloat(document.getElementById('platformFee').value),
                    minWithdrawal: parseFloat(document.getElementById('minWithdrawal').value),
                    autoApprove: document.getElementById('autoApprove').value === 'true',
                    maxImages: parseInt(document.getElementById('maxImages').value)
                };
                
                const response = await API.post('../api/admin/settings.php', settings);
                
                if (response.success) {
                    showNotification('Settings saved successfully', 'success');
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error saving settings:', error);
                showNotification('Error saving settings: ' + error.message, 'error');
            }
        },

        // Show user detail modal
        showUserDetail(user) {
            const modal = document.getElementById('userDetailModal');
            const content = document.getElementById('userDetailContent');
            
            content.innerHTML = `
                <div class="user-detail">
                    <div class="user-header">
                        <h4>${user.username}</h4>
                        <span class="status-badge status-${user.status}">${user.status}</span>
                    </div>
                    
                    <div class="user-info">
                        <div class="info-row">
                            <strong>Name:</strong> ${user.profile?.name || 'Not provided'}
                        </div>
                        <div class="info-row">
                            <strong>Email:</strong> ${user.profile?.email || 'Not provided'}
                        </div>
                        <div class="info-row">
                            <strong>Location:</strong> ${user.profile?.location || 'Not provided'}
                        </div>
                        <div class="info-row">
                            <strong>Member since:</strong> ${new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <div class="info-row">
                            <strong>Last login:</strong> ${user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                        </div>
                    </div>
                    
                    <div class="user-stats">
                        <h5>Activity Statistics</h5>
                        <div class="stats-grid">
                            <div class="stat">
                                <span class="stat-label">Listings</span>
                                <span class="stat-value">${user.listingsCount || 0}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Orders</span>
                                <span class="stat-value">${user.ordersCount || 0}</span>
                            </div>
                            <div class="stat">
                                <span class="stat-label">Reviews</span>
                                <span class="stat-value">${user.reviewsCount || 0}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="user-actions">
                        <button class="btn btn-primary" onclick="AdminPanel.sendMessage('${user.id}')">Send Message</button>
                        ${user.status === 'active' ? 
                            `<button class="btn btn-error" onclick="AdminPanel.suspendUser('${user.id}')">Suspend User</button>` :
                            `<button class="btn btn-success" onclick="AdminPanel.activateUser('${user.id}')">Activate User</button>`
                        }
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
        },

        // Send message to user
        async sendMessage(userId) {
            const message = prompt('Enter your message:');
            if (message) {
                try {
                    const response = await API.post('../api/admin/send-message.php', {
                        userId,
                        message
                    });
                    
                    if (response.success) {
                        showNotification('Message sent successfully', 'success');
                    } else {
                        throw new Error(response.message);
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                    showNotification('Error sending message: ' + error.message, 'error');
                }
            }
        }
    };
})();