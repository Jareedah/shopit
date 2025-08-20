# LocalMarket Prototype

A lightweight marketplace prototype demonstrating core marketplace functionality including user authentication, listing management, search, and transaction processing.

## Features

- **User Authentication**: Simple username-based registration and login
- **Admin Accounts**: Pre-configured admin accounts (admin1, admin2)
- **Listing Management**: Create, edit, and view product/service listings
- **Image Upload**: Support for multiple image uploads with camera capture
- **Location Services**: Location-based search and filtering
- **Search & Discovery**: Advanced search with filtering and map integration
- **Transaction System**: Complete purchase flow with order management
- **Admin Panel**: Comprehensive administrative tools
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Data Storage**: JSON files with file locking
- **Maps**: Leaflet.js for map integration
- **No Database Required**: Uses JSON file storage for simplicity

## Installation

### Prerequisites

- Web server with PHP 7.4+ support
- GD library for image processing
- Write permissions for data and uploads directories

### Quick Setup

1. **Extract Files**: Upload and extract the prototype files to your web directory
2. **Set Permissions**: Ensure the following directories are writable:
   ```bash
   chmod 755 data/ uploads/
   ```
3. **Verify PHP**: Ensure PHP 7.4+ is installed with GD library
4. **Access Application**: Navigate to the installation directory in your web browser

### Demo Accounts

The prototype comes with two pre-configured admin accounts:

- **Username**: `admin1`
- **Username**: `admin2`

Regular users can register new accounts with unique usernames.

## File Structure

```
localmarket-prototype/
├── index.html                 # Landing page
├── auth/                      # Authentication pages
│   ├── login.html
│   └── register.html
├── dashboard/                 # User dashboard
│   └── index.html
├── listings/                  # Listing management
├── search/                    # Search interface
├── orders/                    # Transaction system
├── admin/                     # Admin panel
├── api/                       # PHP backend endpoints
│   ├── core/                  # Core classes
│   ├── auth/                  # Authentication APIs
│   ├── listings/              # Listing APIs
│   └── orders/                # Order APIs
├── data/                      # JSON data storage
│   ├── users.json
│   ├── listings.json
│   ├── orders.json
│   └── categories.json
├── uploads/                   # Image uploads
├── assets/                    # CSS, JavaScript, images
│   ├── css/
│   ├── js/
│   └── images/
└── README.md
```

## Usage

### For Buyers

1. **Register/Login**: Create an account or use demo admin accounts
2. **Browse Marketplace**: Search for products and services by location, category, or keywords
3. **View Listings**: See detailed product information with images and seller details
4. **Make Purchases**: Complete secure transactions through the checkout system
5. **Track Orders**: Monitor order status and history in your dashboard

### For Sellers

1. **Create Listings**: Add products or services with photos and descriptions
2. **Manage Inventory**: Update listing status and availability
3. **Process Orders**: Handle incoming orders and communicate with buyers
4. **Track Sales**: View sales history and performance metrics

### For Administrators

1. **User Management**: View, suspend, or activate user accounts
2. **Content Moderation**: Approve or reject listings
3. **System Analytics**: Monitor platform usage and performance
4. **Configuration**: Adjust system settings and parameters

## API Endpoints

### Authentication
- `POST /api/auth/login.php` - User login
- `POST /api/auth/register.php` - User registration
- `POST /api/auth/logout.php` - User logout
- `POST /api/auth/validate.php` - Session validation

### Listings
- `POST /api/listings/create.php` - Create new listing
- `POST /api/listings/get.php` - Get listing details
- `POST /api/listings/update.php` - Update listing
- `POST /api/listings/delete.php` - Delete listing

### Search
- `POST /api/search/query.php` - Search listings

### Orders
- `POST /api/orders/create.php` - Create new order
- `POST /api/orders/list.php` - Get user orders
- `POST /api/orders/get.php` - Get order details

## Configuration

### System Settings

Key configuration options can be modified in the admin panel:

- Platform fee percentage
- Maximum images per listing
- Auto-approval settings
- Minimum withdrawal amounts

### File Permissions

Ensure proper permissions for security:

```bash
# Data directory (writable by web server)
chmod 755 data/

# Uploads directory (writable by web server)
chmod 755 uploads/

# Configuration files (readable only)
chmod 644 data/*.json
```

## Security Features

- Input validation and sanitization
- File upload restrictions
- Session management
- SQL injection prevention (N/A - no database)
- XSS protection
- Directory access protection

## Limitations

This is a prototype designed for demonstration purposes:

- Uses JSON file storage instead of a database
- Basic authentication without password encryption
- Limited scalability for high traffic
- No payment gateway integration
- Simplified messaging system

## Browser Compatibility

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Page load times: < 3 seconds
- Search results: < 2 seconds
- Image upload: < 30 seconds
- Optimized for demonstration use

## Support

This prototype is designed to be self-contained and easy to deploy. For technical issues:

1. Check PHP error logs
2. Verify file permissions
3. Ensure all required files are present
4. Test with demo accounts first

## License

This prototype is created for demonstration purposes. Please ensure compliance with applicable laws and regulations when using in production environments.

---

**LocalMarket Prototype v1.0** - Demonstrating marketplace functionality with modern web technologies.