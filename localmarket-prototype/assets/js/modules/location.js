/**
 * Location Service Module
 * Handles geolocation detection and address management
 */

const LocationService = (function() {
    let currentLocation = null;
    
    return {
        // Detect user's current location
        async detectLocation() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported by this browser'));
                    return;
                }
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        
                        // Reverse geocode to get address
                        this.reverseGeocode(lat, lng)
                            .then(address => {
                                currentLocation = { lat, lng, address };
                                resolve(currentLocation);
                            })
                            .catch(error => {
                                // If reverse geocoding fails, still resolve with coordinates
                                currentLocation = { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` };
                                resolve(currentLocation);
                            });
                    },
                    (error) => {
                        reject(new Error('Unable to retrieve your location: ' + error.message));
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                );
            });
        },
        
        // Reverse geocode coordinates to address
        async reverseGeocode(lat, lng) {
            try {
                // Using Nominatim (OpenStreetMap) for reverse geocoding
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                const data = await response.json();
                
                if (data && data.display_name) {
                    return data.display_name;
                }
                
                throw new Error('No address found for these coordinates');
            } catch (error) {
                console.error('Reverse geocoding error:', error);
                throw error;
            }
        },
        
        // Get formatted location string
        getFormattedLocation() {
            if (!currentLocation) return '';
            
            if (currentLocation.address) {
                return currentLocation.address;
            }
            
            return `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
        },
        
        // Set manual location
        setManualLocation(address, city, state, zipcode) {
            const locationParts = [];
            if (address) locationParts.push(address);
            if (city) locationParts.push(city);
            if (state) locationParts.push(state);
            if (zipcode) locationParts.push(zipcode);
            
            currentLocation = {
                address: locationParts.join(', '),
                isManual: true
            };
            
            return currentLocation;
        },
        
        // Get current location data
        getCurrentLocation() {
            return currentLocation;
        }
    };
})();