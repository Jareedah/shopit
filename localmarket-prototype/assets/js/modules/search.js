// Working Search Engine Module - No Infinite Recursion
const SearchEngine = (function() {
    'use strict';
    
    let userLocation = null;
    let currentResults = [];
    let currentPage = 1;
    let resultsPerPage = 10;
    let map = null;
    
    return {
        // Initialize search engine - WORKING VERSION
        async init() {
            try {
                console.log('SearchEngine.init() called');
                
                // Set default location (no automatic detection to avoid errors)
                userLocation = { 
                    lat: 40.7128, 
                    lng: -74.0060, 
                    address: 'New York, NY (default)',
                    explicit: false  // Not explicitly set by user
                };
                
                // Initialize map if Leaflet is available
                if (typeof L !== 'undefined') {
                    this.initMap();
                }
                
                // Load initial results
                this.loadResults();
                
                console.log('SearchEngine initialized successfully');
            } catch (error) {
                console.error('Search engine initialization error:', error);
            }
        },

        // Initialize map
        initMap() {
            try {
                const mapElement = document.getElementById('map');
                if (!mapElement) return;
                
                map = L.map('map').setView([userLocation.lat, userLocation.lng], 13);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);
                
                // Add user location marker
                L.marker([userLocation.lat, userLocation.lng])
                    .addTo(map)
                    .bindPopup('Your Location')
                    .openPopup();
            } catch (error) {
                console.error('Map initialization error:', error);
            }
        },

        // Show results on map
        showMap() {
            if (!map) this.initMap();
            
            // Clear existing markers except user location
            map.eachLayer(function(layer) {
                if (layer instanceof L.Marker && layer.getPopup().getContent() !== 'Your Location') {
                    map.removeLayer(layer);
                }
            });
            
            // Add result markers
            currentResults.forEach(result => {
                if (result.location && result.location.lat && result.location.lng) {
                    L.marker([result.location.lat, result.location.lng])
                        .addTo(map)
                        .bindPopup(`<strong>${result.title}</strong><br>$${result.price}`);
                }
            });
        },

        // Get current filters
        getCurrentFilters() {
            return {
                query: document.getElementById('searchQuery')?.value.trim() || '',
                category: document.getElementById('categoryFilter')?.value || '',
                priceMin: document.getElementById('priceMin')?.value ? parseFloat(document.getElementById('priceMin').value) : null,
                priceMax: document.getElementById('priceMax')?.value ? parseFloat(document.getElementById('priceMax').value) : null,
                radius: parseInt(document.getElementById('radius')?.value || 10),
                sortBy: document.getElementById('sortBy')?.value || 'distance',
                page: currentPage,
                limit: resultsPerPage
            };
        },

        // Load search results - WORKING VERSION
        async loadResults(filters = null) {
            try {
                console.log('Loading search results...');
                
                if (!filters) {
                    filters = this.getCurrentFilters();
                }
                
                const searchData = {
                    ...filters,
                    userLocation: userLocation
                };
                
                console.log('Sending search request:', searchData);
                
                const response = await fetch('../api/search/query.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(searchData)
                });
                
                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('Search API response:', result);
                
                if (result.success) {
                    this.displayResults(result.data || []);
                    this.updatePagination(result.total || 0, result.page || 1, result.totalPages || 1);
                } else {
                    throw new Error(result.message || 'Search failed');
                }
            } catch (error) {
                console.error('Error loading search results:', error);
                this.displayError('Error loading results: ' + error.message);
            }
        },

        // Display results in list view - WORKING VERSION
        displayResults(results) {
            currentResults = results;
            const resultsContainer = document.getElementById('resultsList');
            
            if (!resultsContainer) {
                console.error('Results container not found');
                return;
            }
            
            if (results.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="empty-state">
                        <p>No listings found matching your criteria.</p>
                        <p>Try adjusting your filters or search terms.</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            
            results.forEach(listing => {
                const mainImage = listing.images && listing.images.length > 0 
                    ? `../uploads/${listing.images[0]}` 
                    : '../assets/images/placeholder.jpg';
                
                const distance = listing.distance ? `${listing.distance.toFixed(1)} km away` : 'Distance unknown';
                const stock = listing.stock || 0;
                const stockDisplay = stock > 0 ? `📦 ${stock} in stock` : '❌ Out of Stock';
                
                html += `
                    <div class="listing-card" data-id="${listing.id}">
                        <img src="${mainImage}" alt="${listing.title}" class="listing-image" 
                             onerror="this.src='../assets/images/placeholder.jpg'">
                        <div class="listing-content">
                            <h3 class="listing-title">${listing.title}</h3>
                            <div class="listing-price">$${listing.price}</div>
                            <p class="listing-description">${listing.description}</p>
                            <div class="listing-meta">
                                <span class="listing-category">${listing.category}</span>
                                <span class="listing-distance">📍 ${distance}</span>
                                <span class="listing-stock">${stockDisplay}</span>
                                <span class="listing-date">${new Date(listing.created_at).toLocaleDateString()}</span>
                            </div>
                            <div class="listing-actions">
                                <a href="../listings/view.html?id=${listing.id}" class="btn btn-primary">View Details</a>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            resultsContainer.innerHTML = html;
        },

        // Display error message
        displayError(message) {
            const resultsContainer = document.getElementById('resultsList');
            if (resultsContainer) {
                resultsContainer.innerHTML = `
                    <div class="error-state">
                        <p>${message}</p>
                        <button class="btn btn-primary" onclick="SearchEngine.loadResults()">Try Again</button>
                    </div>
                `;
            }
        },

        // Apply filters - WORKING VERSION
        applyFilters() {
            try {
                console.log('Applying filters...');
                currentPage = 1;
                const filters = this.getCurrentFilters();
                this.loadResults(filters);
            } catch (error) {
                console.error('Error applying filters:', error);
                this.displayError('Error applying filters: ' + error.message);
            }
        },

        // Reset all filters
        resetFilters() {
            try {
                const elements = {
                    'searchQuery': '',
                    'categoryFilter': '',
                    'priceMin': '',
                    'priceMax': '',
                    'radius': '10',
                    'sortBy': 'distance'
                };
                
                Object.entries(elements).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = value;
                    }
                });
                
                this.applyFilters();
            } catch (error) {
                console.error('Error resetting filters:', error);
            }
        },

        // Update pagination
        updatePagination(total, page, totalPages) {
            // Simple pagination implementation
            const paginationContainer = document.getElementById('pagination');
            if (paginationContainer) {
                paginationContainer.innerHTML = `
                    <div class="pagination-info">
                        Page ${page} of ${totalPages} (${total} total results)
                    </div>
                `;
            }
        },

        // Update user location - WORKING VERSION
        updateUserLocation(location) {
            try {
                userLocation = {
                    ...location,
                    explicit: true  // User explicitly set this location
                };
                console.log('User location updated:', location);
                
                // Update location display
                const locationInput = document.getElementById('userLocation');
                if (locationInput) {
                    locationInput.value = location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
                }
                
                // Reinitialize map with new location if map exists
                if (map) {
                    map.setView([location.lat, location.lng], 13);
                    
                    // Clear existing markers and re-add user location
                    map.eachLayer(function(layer) {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });
                    
                    L.marker([location.lat, location.lng])
                        .addTo(map)
                        .bindPopup('Your Location')
                        .openPopup();
                }
            } catch (error) {
                console.error('Error updating user location:', error);
            }
        },
        
        // Get current user location
        getUserLocation() {
            return userLocation;
        }
    };
})();