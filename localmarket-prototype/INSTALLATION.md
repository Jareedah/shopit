# LocalMarket Prototype - Installation Guide

## Quick Start

This guide will help you deploy the LocalMarket prototype to your web server in minutes.

## Prerequisites

### Server Requirements

- **Web Server**: Apache or Nginx
- **PHP**: Version 7.4 or higher
- **PHP Extensions**:
  - GD library (for image processing)
  - JSON support (usually enabled by default)
  - Session support (usually enabled by default)
  - File system write permissions

### Recommended Hosting

- **Plesk Panel**: Optimized for one-click deployment
- **cPanel**: Compatible with standard setup
- **VPS/Dedicated**: Full control over configuration
- **Shared Hosting**: Works with most providers

## Installation Steps

### Step 1: Upload Files

1. **Download**: Extract the LocalMarket prototype ZIP file
2. **Upload**: Transfer all files to your web directory
   - For main domain: `/public_html/` or `/htdocs/`
   - For subdomain: `/public_html/subdomain/`
   - For subdirectory: `/public_html/marketplace/`

### Step 2: Set File Permissions

Set the correct permissions for data storage and uploads:

```bash
# Make directories writable by web server
chmod 755 data/
chmod 755 uploads/
chmod 755 data/logs/

# Secure data files
chmod 644 data/*.json
chmod 644 data/.htaccess
chmod 644 uploads/.htaccess
```

**For Plesk Users:**
1. Go to File Manager
2. Navigate to your domain folder
3. Right-click on `data/` folder → Change Permissions → Set to 755
4. Right-click on `uploads/` folder → Change Permissions → Set to 755

### Step 3: Verify PHP Configuration

Check that your PHP installation meets requirements:

```php
<?php
// Create a temporary file: check-php.php
phpinfo();

// Look for:
// - PHP Version: 7.4+
// - GD Support: Enabled
// - JSON Support: Enabled
// - Session Support: Enabled
?>
```

### Step 4: Test Installation

1. **Access Homepage**: Navigate to your domain/subdirectory
2. **Test Registration**: Try creating a new user account
3. **Test Admin Login**: Use `admin1` or `admin2` as username
4. **Verify File Uploads**: Try the image upload functionality

## Deployment Scenarios

### Plesk Panel Deployment

1. **File Manager**: Upload ZIP file and extract
2. **Set Permissions**: Use File Manager to set folder permissions
3. **Domain Settings**: Ensure PHP 7.4+ is selected
4. **SSL Certificate**: Enable HTTPS for security (recommended)

### cPanel Deployment

1. **File Manager**: Upload and extract files
2. **Set Permissions**: Use File Manager permission settings
3. **PHP Version**: Select PHP 7.4+ in MultiPHP Manager
4. **Error Logs**: Monitor error logs for any issues

### Manual Server Deployment

```bash
# Extract files
unzip localmarket-prototype.zip
cd localmarket-prototype

# Set ownership (replace 'www-data' with your web server user)
sudo chown -R www-data:www-data .

# Set permissions
chmod 755 data/ uploads/
chmod 644 data/*.json
chmod 644 *.html *.md
chmod 644 assets/css/* assets/js/*
chmod 644 api/*/*.php

# Test PHP
php -v
php -m | grep -E "(gd|json)"
```

## Configuration

### Basic Configuration

The prototype works out-of-the-box with default settings. Advanced configuration can be done through:

1. **Admin Panel**: Access system settings after login
2. **JSON Files**: Modify configuration in `data/` directory
3. **PHP Constants**: Edit API files for custom settings

### Environment-Specific Settings

#### Production Environment
- Enable HTTPS
- Set proper error reporting
- Configure backup schedules
- Monitor log files

#### Development Environment
- Enable debug mode
- Use development domains
- Test with sample data

## Troubleshooting

### Common Issues

#### "Permission Denied" Errors
```bash
# Fix permissions
chmod 755 data/ uploads/
chown -R www-data:www-data data/ uploads/
```

#### "GD Library Not Found"
```bash
# Ubuntu/Debian
sudo apt-get install php-gd

# CentOS/RHEL
sudo yum install php-gd

# Restart web server
sudo service apache2 restart
```

#### "Session Not Working"
- Check PHP session configuration
- Verify session directory permissions
- Ensure cookies are enabled in browser

#### "File Upload Fails"
- Check `upload_max_filesize` in PHP.ini
- Verify `post_max_size` setting
- Ensure uploads directory is writable

### Error Log Locations

- **Apache**: `/var/log/apache2/error.log`
- **Nginx**: `/var/log/nginx/error.log`
- **PHP**: Check `error_log` setting in PHP.ini
- **Application**: `data/logs/app.log`

### Testing Checklist

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] Admin login works (admin1/admin2)
- [ ] Dashboard displays properly
- [ ] Image upload functions
- [ ] Search functionality works
- [ ] Mobile view is responsive

## Security Hardening

### Recommended Security Measures

1. **HTTPS**: Always use SSL certificates in production
2. **File Permissions**: Restrict access to data files
3. **Directory Listing**: Disabled via .htaccess files
4. **PHP Execution**: Prevented in uploads directory
5. **Error Reporting**: Disabled in production

### Additional Security Steps

```apache
# Add to main .htaccess file
<Files "*.json">
    Order Allow,Deny
    Deny from all
</Files>

<Files "*.log">
    Order Allow,Deny
    Deny from all
</Files>
```

## Performance Optimization

### Recommended Optimizations

1. **Enable Compression**: Gzip compression for faster loading
2. **Browser Caching**: Set appropriate cache headers
3. **Image Optimization**: Compress uploaded images
4. **CDN**: Use CDN for static assets (optional)

### PHP Configuration

```ini
# Recommended PHP settings
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 12M
max_execution_time = 300
```

## Backup and Maintenance

### Backup Strategy

1. **Data Files**: Regular backup of `data/` directory
2. **Uploaded Files**: Backup `uploads/` directory
3. **Application Files**: Version control for code changes
4. **Database**: N/A (uses JSON storage)

### Maintenance Tasks

- Monitor log files for errors
- Clean up old uploaded files
- Update PHP version as needed
- Review and rotate log files

## Support and Updates

### Getting Help

1. **Documentation**: Check README.md for features
2. **Error Logs**: Review application logs
3. **PHP Logs**: Check web server error logs
4. **Browser Console**: Check for JavaScript errors

### Update Process

1. **Backup**: Create full backup before updates
2. **Test**: Test updates in development environment
3. **Deploy**: Replace files while preserving data directory
4. **Verify**: Test all functionality after update

---

**Need Help?** This prototype is designed to be self-contained and easy to deploy. Most issues can be resolved by checking file permissions and PHP configuration.