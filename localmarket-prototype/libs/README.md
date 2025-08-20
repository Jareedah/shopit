# Third-Party Libraries

This directory contains third-party libraries used by the LocalMarket prototype.

## Current Libraries

### Leaflet.js (Map Integration)
- **Version**: 1.7.1
- **Source**: CDN (https://unpkg.com/leaflet@1.7.1/)
- **Purpose**: Interactive maps for location-based search
- **License**: BSD 2-Clause License
- **Documentation**: https://leafletjs.com/

### Usage
Currently, all libraries are loaded from CDN for simplicity. For production deployment, consider downloading and hosting locally for better performance and reliability.

## Adding New Libraries

When adding new libraries:

1. **Evaluate License**: Ensure compatibility with project license
2. **Check Size**: Consider impact on page load times
3. **Test Compatibility**: Verify works across target browsers
4. **Document Usage**: Add entry to this README

## Local Hosting

To host libraries locally instead of CDN:

1. Download library files
2. Place in appropriate subdirectory
3. Update HTML references
4. Test functionality

## Browser Compatibility

All included libraries support:
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+