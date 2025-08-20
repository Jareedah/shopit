/**
 * Search Engine Module
 * Handles search functionality, filtering, and map integration
 */

const SearchEngine = (function() {
    let currentResults = [];
    let currentPage = 1;
    let resultsPerPage = 10;
    let totalPages = 1;
    let map = null;
    let markers = [];
    let userLocation = null;

    return {
        // Initialize search engine
        async init() {
            try {
                // Get user location
                userLocation = await LocationService.detectLocation().catch(() => {
                    // Fallback to default location if detection fails
                    return { lat: 40.7128, lng: -74.0060, address: 'New York, NY' };
                });
                
                // Initialize map if Leaflet is available
                if (typeof L !== 'undefined') {
                    this.initMap();
                }
            } catch (error) {
                console.error('Search engine initialization error:', error);
            }
        },

        // Initialize map
        initMap() {
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
        },

        // Show results on map
        showMap() {
            if (!map) this.initMap();
            
            // Clear existing markers
            markers.forEach(marker => map.removeLayer(marker));
            markers = [];
            
            // Add markers for each listing
            currentResults.forEach(listing => {
                if (listing.location && listing.location.lat && listing.location.lng) {
                    const marker = L.marker([listing.location.lat, listing.location.lng])
                        .addTo(map)
                        .bindPopup(`
                            <strong>${listing.title}</strong><br>
                            $${listing.price}<br>
                            <a href="../listings/view.html?id=${listing.id}">View Details</a>
                        `);
                    
                    markers.push(marker);
                }
            });
            
            // Fit map to show all markers
            if (markers.length > 0) {
                const group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.1));
            }
        },

        // Apply search filters
        async applyFilters() {
            const filters = this.getCurrentFilters();
            this.loadResults(filters);
        },

        // Reset all filters
        resetFilters() {
            document.getElementById('searchQuery').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('priceMin').value = '';
            document.getElementById('priceMax').value = '';
            document.getElementById('radius').value = '10';
            document.getElementById('sortBy').value = 'distance';
            
            this.applyFilters();
        },

        // Get current filter values
        getCurrentFilters() {
            return {
                query: document.getElementById('searchQuery').value.trim(),
                category: document.getElementById('categoryFilter').value,
                priceMin: document.getElementById('priceMin').value ? parseFloat(document.getElementById('priceMin').value) : null,
                priceMax: document.getElementById('priceMax').value ? parseFloat(document.getElementById('priceMax').value) : null,
                radius: parseInt(document.getElementById('radius').value),
                sortBy: document.getElementById('sortBy').value,
                page: currentPage,
                limit: resultsPerPage
            };
        },

        // Load search results
        async loadResults(filters = null) {
            try {
                const resultsContainer = document.getElementById('resultsList');
                resultsContainer.innerHTML = '<div class="loading-state"><p>Loading listings...</p></div>';
                
                if (!filters) {
                    filters = this.getCurrentFilters();
                }
                
                const response = await API.post('../api/search/query.php', {
                    ...filters,
                    userLocation: userLocation
                });
                
                if (response.success) {
                    this.displayResults(response.data);
                    this.updatePagination(response.total, response.page, response.totalPages);
                } else {
                    throw new Error(response.message);
                }
            } catch (error) {
                console.error('Error loading search results:', error);
                document.getElementById('resultsList').innerHTML = `
                    <div class="empty-state">
                        <p>Error loading results: ${error.message}</p>
                    </div>
                `;
            }
        },

        // Display results in list view
        displayResults(results) {
            currentResults = results;
            const resultsContainer = document.getElementById('resultsList');
            
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

        // Update pagination controls
        updatePagination(totalItems, currentPage, totalPages) {
            const pagination = document.getElementById('pagination');
            const pageInfo = document.getElementById('pageInfo');
            const prevButton = document.getElementById('prevPage');
            const nextButton = document.getElementById('nextPage');
            
            this.totalPages = totalPages;
            this.currentPage = currentPage;
            
            if (totalPages <= 1) {
                pagination.classList.add('hidden');
                return;
            }
            
            pagination.classList.remove('hidden');
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === totalPages;
            
            // Update button event listeners
            prevButton.onclick = () => this.goToPage(currentPage - 1);
            nextButton.onclick = () => this.goToPage(currentPage + 1);
        },

        // Navigate to specific page
        goToPage(page) {
            if (page < 1 || page > totalPages) return;
            
            currentPage = page;
            const filters = this.getCurrentFilters();
            filters.page = page;
            
            this.loadResults(filters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        
        // Update user location
        updateUserLocation(location) {
            userLocation = location;
            
            // Reinitialize map with new location
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
        },
        
        // Get current user location
        getUserLocation() {
            return userLocation;
        }
    };
})();