/* ========================================
   SHOPIT WEBSITE - MAIN JAVASCRIPT
   Interactive functionality and user experience
   ======================================== */

// Global variables
let currentTheme = 'light';
let videoLoaded = false;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize all website functionality
function initializeWebsite() {
    initializeTheme();
    initializeNavigation();
    initializeTabs();
    initializeScrollEffects();
    initializeAnimations();
    initializeContactForm();
    initializeMobileMenu();
    
    console.log('🚀 Shopit Website Initialized');
}

/* ========================================
   THEME MANAGEMENT
   ======================================== */

function initializeTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('shopit-theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon();
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('shopit-theme', currentTheme);
    updateThemeIcon();
    
    // Add smooth transition effect
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeIcon() {
    const themeButton = document.querySelector('nav button[onclick="toggleTheme()"]');
    const icon = themeButton?.querySelector('i');
    if (icon) {
        icon.textContent = currentTheme === 'light' ? 'dark_mode' : 'light_mode';
    }
}

/* ========================================
   NAVIGATION & SCROLLING
   ======================================== */

function initializeNavigation() {
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update navigation on scroll
    window.addEventListener('scroll', updateNavigationState);
}

function updateNavigationState() {
    const nav = document.querySelector('nav.sticky');
    if (nav) {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.backdropFilter = 'blur(20px)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.8)';
            nav.style.backdropFilter = 'blur(10px)';
        }
    }
}

function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

/* ========================================
   MOBILE MENU
   ======================================== */

function initializeMobileMenu() {
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const overlay = document.getElementById('mobileMenu');
        const menuButton = document.querySelector('button[onclick="toggleMenu()"]');
        
        if (overlay && overlay.classList.contains('active') && 
            !overlay.contains(e.target) && !menuButton.contains(e.target)) {
            toggleMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('mobileMenu');
            if (overlay && overlay.classList.contains('active')) {
                toggleMenu();
            }
        }
    });
}

function toggleMenu() {
    const overlay = document.getElementById('mobileMenu');
    const body = document.body;
    
    if (overlay) {
        overlay.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (overlay.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }
}

/* ========================================
   TAB FUNCTIONALITY
   ======================================== */

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(targetTab) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`[data-tab="${targetTab}"]`);
    const selectedContent = document.getElementById(targetTab);
    
    if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
        
        // Animate content appearance
        selectedContent.style.opacity = '0';
        selectedContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            selectedContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            selectedContent.style.opacity = '1';
            selectedContent.style.transform = 'translateY(0)';
        }, 50);
    }
}

/* ========================================
   VIDEO INTEGRATION
   ======================================== */

function loadVideo() {
    if (videoLoaded) return;
    
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    const videoContainer = document.getElementById('videoContainer');
    
    if (!videoPlaceholder || !videoContainer) return;
    
    // Show loading state
    const playButton = videoPlaceholder.querySelector('.play-button');
    if (playButton) {
        playButton.innerHTML = '<i class="material-symbols-outlined">hourglass_empty</i>';
        playButton.style.pointerEvents = 'none';
    }
    
    // Create YouTube iframe
    // TODO: Replace YOUR_VIDEO_ID with the actual Shopit demo video ID
    // Example: If your video URL is https://www.youtube.com/watch?v=ABC123XYZ
    // Then use: iframe.src = 'https://www.youtube.com/embed/ABC123XYZ?autoplay=1&rel=0&modestbranding=1';
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1&rel=0&modestbranding=1';
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.style.borderRadius = 'var(--radius-lg)';
    
    // Replace placeholder with video
    videoContainer.appendChild(iframe);
    videoContainer.style.display = 'block';
    videoContainer.style.aspectRatio = '16/9';
    
    // Animate transition
    videoPlaceholder.style.transition = 'opacity 0.3s ease';
    videoPlaceholder.style.opacity = '0';
    
    setTimeout(() => {
        videoPlaceholder.style.display = 'none';
        videoLoaded = true;
    }, 300);
    
    // Track video interaction
    trackEvent('video_play', {
        video_title: 'Shopit Demo',
        location: 'demo_section'
    });
}

/* ========================================
   SCROLL EFFECTS & ANIMATIONS
   ======================================== */

function initializeScrollEffects() {
    // Parallax effect for hero section
    window.addEventListener('scroll', handleParallax);
    
    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.value-card, .future-card, .strategy-block').forEach(el => {
        observer.observe(el);
    });
}

function handleParallax() {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    const phoneFrame = document.querySelector('.phone-frame');
    
    if (heroBackground) {
        heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    if (phoneFrame && scrolled < window.innerHeight) {
        phoneFrame.style.transform = `translateY(${scrolled * 0.2}px) rotate(-5deg)`;
    }
}

function handleIntersection(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
    });
}

function initializeAnimations() {
    // Set initial states for animated elements
    document.querySelectorAll('.value-card, .future-card, .strategy-block').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
    });
    
    // Stagger animation for value cards
    document.querySelectorAll('.value-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    // Animate phone mockup on hover
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        phoneMockup.addEventListener('mouseenter', function() {
            this.style.transform = 'rotate(0deg) scale(1.05)';
        });
        
        phoneMockup.addEventListener('mouseleave', function() {
            this.style.transform = 'rotate(-5deg) scale(1)';
        });
    }
}

/* ========================================
   CONTACT FORM
   ======================================== */

function initializeContactForm() {
    const form = document.getElementById('partnershipForm');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
    
    // Add real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate form
    if (!validateForm(data)) {
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('.submit-button');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="material-symbols-outlined">hourglass_empty</i> <span>Sending...</span>';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual endpoint)
    setTimeout(() => {
        showFormSuccess();
        form.reset();
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Track form submission
        trackEvent('form_submit', {
            form_name: 'partnership_form',
            interest: data.interest
        });
    }, 2000);
}

function validateForm(data) {
    let isValid = true;
    const errors = [];
    
    // Required fields
    const requiredFields = ['company', 'name', 'title', 'email', 'interest'];
    
    requiredFields.forEach(field => {
        if (!data[field] || data[field].trim() === '') {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const name = field.name;
    
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(name, 'This field is required');
        return false;
    }
    
    if (name === 'email' && value && !isValidEmail(value)) {
        showFieldError(name, 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

function showFieldError(fieldName, message) {
    const field = document.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    field.style.borderColor = 'var(--apple-red)';
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--apple-red)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = 'var(--space-sm)';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    if (typeof field === 'object') {
        field.style.borderColor = '';
        const errorMsg = field.parentNode.querySelector('.field-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

function showFormSuccess() {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="material-symbols-outlined">check_circle</i>
            <div>
                <h6>Thank you for your interest!</h6>
                <p>We'll be in touch within 24 hours to discuss your Shopit integration opportunity.</p>
            </div>
        </div>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: 'var(--apple-green)',
        color: 'white',
        padding: 'var(--space-lg)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: '9999',
        maxWidth: '400px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    notification.querySelector('.notification-content').style.display = 'flex';
    notification.querySelector('.notification-content').style.gap = 'var(--space-md)';
    notification.querySelector('.notification-content').style.alignItems = 'flex-start';
    
    notification.querySelector('i').style.fontSize = '2rem';
    notification.querySelector('h6').style.margin = '0 0 4px 0';
    notification.querySelector('h6').style.color = 'white';
    notification.querySelector('p').style.margin = '0';
    notification.querySelector('p').style.fontSize = '0.875rem';
    notification.querySelector('p').style.opacity = '0.9';
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Allow manual close
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/* ========================================
   INTERACTIVE ELEMENTS
   ======================================== */

// Add interactive hover effects
document.addEventListener('DOMContentLoaded', function() {
    // Feature cards hover effect
    document.querySelectorAll('.value-card, .future-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Button ripple effect
    document.querySelectorAll('.button, .submit-button, .register-btn, .publish-btn').forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

function createRipple(e) {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    Object.assign(ripple.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.3)',
        transform: 'scale(0)',
        animation: 'ripple-animation 0.6s ease-out',
        pointerEvents: 'none'
    });
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Add ripple animation CSS
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

/* ========================================
   ANALYTICS & TRACKING
   ======================================== */

function trackEvent(eventName, properties = {}) {
    // Implement your analytics tracking here
    console.log('📊 Event tracked:', eventName, properties);
    
    // Example: Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
    
    // Example: Custom analytics
    if (typeof analytics !== 'undefined') {
        analytics.track(eventName, properties);
    }
}

// Track page interactions
document.addEventListener('DOMContentLoaded', function() {
    // Track tab switches
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            trackEvent('tab_click', {
                tab_name: this.getAttribute('data-tab'),
                section: 'prototype_features'
            });
        });
    });
    
    // Track section views
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                if (sectionId) {
                    trackEvent('section_view', {
                        section_id: sectionId,
                        section_name: entry.target.querySelector('h2')?.textContent || sectionId
                    });
                }
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('section[id]').forEach(section => {
        sectionObserver.observe(section);
    });
});

/* ========================================
   PERFORMANCE OPTIMIZATION
   ======================================== */

// Lazy load images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Preload critical resources
function preloadResources() {
    const criticalResources = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        'https://cdn.jsdelivr.net/npm/beercss@3.11.33/dist/cdn/beer.min.css'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = resource.includes('.css') ? 'style' : 'script';
        link.href = resource;
        document.head.appendChild(link);
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', function() {
    initializeLazyLoading();
    preloadResources();
});

/* ========================================
   ERROR HANDLING & DEBUGGING
   ======================================== */

// Global error handler
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript Error:', e.error);
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        line: e.lineno
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('🚨 Unhandled Promise Rejection:', e.reason);
    trackEvent('promise_rejection', {
        reason: e.reason?.toString() || 'Unknown'
    });
});

// Debug mode
const DEBUG_MODE = window.location.hostname === 'localhost' || 
                  window.location.search.includes('debug=true');

if (DEBUG_MODE) {
    console.log('🔧 Debug mode enabled');
    
    // Add debug panel
    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.innerHTML = `
        <h6>Debug Panel</h6>
        <p>Theme: <span id="debug-theme">${currentTheme}</span></p>
        <p>Viewport: <span id="debug-viewport"></span></p>
        <p>Scroll: <span id="debug-scroll">0</span></p>
    `;
    
    Object.assign(debugPanel.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: '9999',
        fontFamily: 'monospace'
    });
    
    document.body.appendChild(debugPanel);
    
    // Update debug info
    function updateDebugInfo() {
        document.getElementById('debug-theme').textContent = currentTheme;
        document.getElementById('debug-viewport').textContent = 
            `${window.innerWidth}x${window.innerHeight}`;
        document.getElementById('debug-scroll').textContent = 
            Math.round(window.pageYOffset);
    }
    
    window.addEventListener('scroll', updateDebugInfo);
    window.addEventListener('resize', updateDebugInfo);
    updateDebugInfo();
}

/* ========================================
   ACCESSIBILITY ENHANCEMENTS
   ======================================== */

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Tab navigation for custom elements
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // Add focus styles
        focusableElements.forEach(el => {
            el.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--md-primary)';
                this.style.outlineOffset = '2px';
            });
            
            el.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });
    }
    
    // Escape key handlers
    if (e.key === 'Escape') {
        // Close mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    }
});

// Announce dynamic content changes to screen readers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

console.log('✅ Shopit Website JavaScript Loaded Successfully');