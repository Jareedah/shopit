/**
 * SHOPIT - APPLE STYLE INTERACTIONS
 * Advanced JavaScript for animations and interactions
 */

class ShopitInteractions {
    constructor() {
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupTabNavigation();
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupVideoPlaceholder();
        this.setupFormInteractions();
        this.setupAnimatedCounters();
        this.setupDeviceInteractions();
        this.setupSearchDemo();
        this.setupEscrowFlow();
        this.setupMapInteractions();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.setupLoadingAnimations();
    }

    // Intersection Observer for scroll animations
    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -100px 0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    
                    // Trigger counter animations
                    if (entry.target.classList.contains('stat-card')) {
                        this.animateCounter(entry.target);
                    }
                }
            });
        }, observerOptions);

        // Observe all animated elements
        const animatedElements = document.querySelectorAll(
            '.showcase-item, .animate-on-scroll, .stat-card, .feature-detail, .escrow-flow'
        );
        
        animatedElements.forEach(el => observer.observe(el));
    }

    // Tab navigation system
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons and panels
                tabButtons.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));

                // Add active class to clicked button and corresponding panel
                btn.classList.add('active');
                if (tabPanels[index]) {
                    tabPanels[index].classList.add('active');
                }

                // Animate the content change
                this.animateTabChange(tabPanels[index]);
            });
        });

        // Set first tab as active by default
        if (tabButtons.length > 0) {
            tabButtons[0].classList.add('active');
            if (tabPanels[0]) {
                tabPanels[0].classList.add('active');
            }
        }
    }

    animateTabChange(panel) {
        if (!panel) return;
        
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            panel.style.transition = 'all 0.3s cubic-bezier(0, 0, 0.2, 1)';
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        });
    }

    // Mobile menu functionality
    setupMobileMenu() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // Animate hamburger to X
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('ri-menu-line');
                    icon.classList.toggle('ri-close-line');
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    
                    const icon = navToggle.querySelector('i');
                    if (icon) {
                        icon.classList.add('ri-menu-line');
                        icon.classList.remove('ri-close-line');
                    }
                }
            });
        }
    }

    // Smooth scrolling for anchor links
    setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Video placeholder interactions
    setupVideoPlaceholder() {
        const playButtons = document.querySelectorAll('.play-button');
        
        playButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Animate button click
                button.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    button.style.transform = 'scale(1.1)';
                    
                    // Simulate video loading
                    this.simulateVideoLoad(button);
                }, 150);
            });
        });
    }

    simulateVideoLoad(button) {
        const videoWrapper = button.closest('.video-wrapper');
        if (!videoWrapper) return;

        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'video-loading';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <i class="ri-loader-4-line"></i>
            </div>
            <p>Loading video...</p>
        `;
        
        videoWrapper.appendChild(loadingOverlay);
        
        // Animate loading
        setTimeout(() => {
            loadingOverlay.innerHTML = `
                <div class="video-loaded">
                    <i class="ri-check-line"></i>
                    <p>Video ready! Opening YouTube...</p>
                </div>
            `;
            
            setTimeout(() => {
                // Open actual YouTube video
                window.open('https://youtu.be/dQw4w9WgXcQ', '_blank');
                loadingOverlay.remove();
            }, 1500);
        }, 2000);
    }

    // Form interactions and validations
    setupFormInteractions() {
        const formFields = document.querySelectorAll('.form-field input, .form-field textarea, .form-field select');
        
        formFields.forEach(field => {
            // Add floating label effect
            field.addEventListener('focus', () => {
                field.parentElement.classList.add('focused');
            });
            
            field.addEventListener('blur', () => {
                if (!field.value) {
                    field.parentElement.classList.remove('focused');
                }
            });
            
            // Real-time validation feedback
            field.addEventListener('input', () => {
                this.validateField(field);
            });
        });

        // Contact form submission
        const contactForm = document.querySelector('.contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(contactForm);
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldContainer = field.parentElement;
        
        // Remove existing validation classes
        fieldContainer.classList.remove('valid', 'invalid');
        
        // Basic validation rules
        let isValid = true;
        
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            isValid = emailRegex.test(value);
        } else if (field.required) {
            isValid = value.length > 0;
        }
        
        // Apply validation class
        fieldContainer.classList.add(isValid ? 'valid' : 'invalid');
        
        return isValid;
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Animate button loading state
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="ri-check-line"></i> Message Sent!';
            submitBtn.style.background = 'var(--apple-green)';
            
            // Reset form after delay
            setTimeout(() => {
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        }, 2000);
    }

    // Animated counters for statistics
    setupAnimatedCounters() {
        this.counters = document.querySelectorAll('.stat-info h3, .stat h4');
    }

    animateCounter(statCard) {
        const counter = statCard.querySelector('.stat-info h3, .stat h4');
        if (!counter || counter.hasAttribute('data-animated')) return;
        
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const start = performance.now();
        
        counter.setAttribute('data-animated', 'true');
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(target * easeOutQuart);
            
            // Format number with commas
            counter.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Add final formatting (like + sign or %)
                const originalText = counter.getAttribute('data-original') || counter.textContent;
                if (originalText.includes('+')) {
                    counter.textContent = current.toLocaleString() + '+';
                } else if (originalText.includes('%')) {
                    counter.textContent = current + '%';
                }
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Device mockup interactions
    setupDeviceInteractions() {
        const deviceFrames = document.querySelectorAll('.device-frame');
        
        deviceFrames.forEach(device => {
            // Add tilt effect on mouse move
            device.addEventListener('mousemove', (e) => {
                const rect = device.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                device.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });
            
            device.addEventListener('mouseleave', () => {
                device.style.transform = 'rotateX(0) rotateY(0) scale(1)';
            });
        });

        // Phone screen interactions
        const phoneScreens = document.querySelectorAll('.phone-screen');
        phoneScreens.forEach(screen => {
            this.simulateAppInteractions(screen);
        });
    }

    simulateAppInteractions(screen) {
        const mobileNavItems = screen.querySelectorAll('.mobile-nav i');
        const mobileListings = screen.querySelectorAll('.mobile-listing');
        
        // Simulate navigation
        mobileNavItems.forEach((navItem, index) => {
            navItem.addEventListener('click', () => {
                mobileNavItems.forEach(item => item.classList.remove('active'));
                navItem.classList.add('active');
                
                // Simulate screen change
                this.animateScreenChange(screen, index);
            });
        });
        
        // Simulate listing interactions
        mobileListings.forEach(listing => {
            listing.addEventListener('click', () => {
                listing.style.transform = 'scale(0.95)';
                listing.style.background = 'rgba(0, 122, 255, 0.1)';
                
                setTimeout(() => {
                    listing.style.transform = 'scale(1)';
                    listing.style.background = '';
                }, 200);
            });
        });
    }

    animateScreenChange(screen, screenIndex) {
        const content = screen.querySelector('.mobile-content');
        if (!content) return;
        
        content.style.opacity = '0.5';
        content.style.transform = 'translateX(-10px)';
        
        setTimeout(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateX(0)';
        }, 200);
    }

    // Search demo interactions
    setupSearchDemo() {
        const searchBars = document.querySelectorAll('.search-bar input');
        const filterChips = document.querySelectorAll('.filter-chip');
        const resultItems = document.querySelectorAll('.result-item');
        
        searchBars.forEach(searchBar => {
            let searchTimeout;
            
            searchBar.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                
                searchTimeout = setTimeout(() => {
                    this.simulateSearch(e.target.value);
                }, 300);
            });
        });
        
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                
                this.animateSearchResults();
            });
        });
        
        resultItems.forEach(item => {
            item.addEventListener('click', () => {
                this.animateResultSelection(item);
            });
        });
    }

    simulateSearch(query) {
        const searchResults = document.querySelector('.search-results');
        if (!searchResults) return;
        
        // Animate search loading
        searchResults.style.opacity = '0.5';
        
        setTimeout(() => {
            searchResults.style.opacity = '1';
            this.animateSearchResults();
        }, 500);
    }

    animateSearchResults() {
        const resultItems = document.querySelectorAll('.result-item');
        
        resultItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s cubic-bezier(0, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateResultSelection(item) {
        item.style.background = 'rgba(0, 122, 255, 0.1)';
        item.style.transform = 'translateX(8px) scale(1.02)';
        
        setTimeout(() => {
            item.style.background = '';
            item.style.transform = '';
        }, 300);
    }

    // Escrow flow interactions
    setupEscrowFlow() {
        const flowSteps = document.querySelectorAll('.flow-step');
        
        flowSteps.forEach((step, index) => {
            step.addEventListener('click', () => {
                this.animateEscrowStep(step, index);
            });
        });
        
        // Auto-animate escrow flow
        this.autoAnimateEscrowFlow();
    }

    animateEscrowStep(step, index) {
        const allSteps = document.querySelectorAll('.flow-step');
        
        // Remove active from all steps
        allSteps.forEach(s => s.classList.remove('active'));
        
        // Add active to current step
        step.classList.add('active');
        
        // Mark previous steps as completed
        for (let i = 0; i < index; i++) {
            allSteps[i].classList.add('completed');
        }
    }

    autoAnimateEscrowFlow() {
        const flowSteps = document.querySelectorAll('.flow-step');
        if (flowSteps.length === 0) return;
        
        let currentStep = 0;
        
        const animateNext = () => {
            if (currentStep < flowSteps.length) {
                this.animateEscrowStep(flowSteps[currentStep], currentStep);
                currentStep++;
                
                setTimeout(animateNext, 2000);
            } else {
                // Reset and start over
                setTimeout(() => {
                    flowSteps.forEach(step => {
                        step.classList.remove('active', 'completed');
                    });
                    currentStep = 0;
                    setTimeout(animateNext, 1000);
                }, 3000);
            }
        };
        
        // Start animation after a delay
        setTimeout(animateNext, 2000);
    }

    // Map interactions
    setupMapInteractions() {
        const mapPins = document.querySelectorAll('.map-pin');
        const communityStats = document.querySelectorAll('.stat');
        
        mapPins.forEach((pin, index) => {
            pin.addEventListener('click', () => {
                mapPins.forEach(p => p.classList.remove('active'));
                pin.classList.add('active');
                
                this.updateCommunityStats(index);
            });
            
            pin.addEventListener('mouseenter', () => {
                pin.style.transform = 'scale(1.1)';
                pin.style.zIndex = '10';
            });
            
            pin.addEventListener('mouseleave', () => {
                if (!pin.classList.contains('active')) {
                    pin.style.transform = 'scale(1)';
                    pin.style.zIndex = '1';
                }
            });
        });
    }

    updateCommunityStats(pinIndex) {
        const stats = [
            { active: '1,247', listings: '89', sales: '156' },
            { active: '856', listings: '67', sales: '92' },
            { active: '2,103', listings: '134', sales: '278' }
        ];
        
        const statElements = document.querySelectorAll('.stat h4');
        const selectedStats = stats[pinIndex] || stats[0];
        
        statElements.forEach((stat, index) => {
            const values = Object.values(selectedStats);
            if (values[index]) {
                this.animateStatChange(stat, values[index]);
            }
        });
    }

    animateStatChange(element, newValue) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0.5';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 200);
    }

    // Parallax effects
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero::before');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    // Hover effects for interactive elements
    setupHoverEffects() {
        const interactiveElements = document.querySelectorAll(
            '.btn, .highlight, .demo-point, .feature-card, .result-item'
        );
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.addHoverEffect(element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.removeHoverEffect(element);
            });
        });
    }

    addHoverEffect(element) {
        element.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        if (element.classList.contains('btn')) {
            element.style.transform = 'translateY(-2px) scale(1.02)';
        } else {
            element.style.transform = 'translateX(4px)';
        }
    }

    removeHoverEffect(element) {
        element.style.transform = '';
    }

    // Loading animations
    setupLoadingAnimations() {
        // Animate elements as they come into view
        const animateElements = document.querySelectorAll(
            '.hero-badge, .hero-title, .hero-subtitle, .hero-actions, .hero-device'
        );
        
        animateElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize interactions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ShopitInteractions();
});

// Add CSS for dynamic styles
const dynamicStyles = `
<style>
.video-loading {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 10;
}

.loading-spinner i {
    font-size: 48px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.video-loaded i {
    font-size: 48px;
    color: var(--apple-green);
    margin-bottom: 16px;
}

.form-field.focused label {
    color: var(--apple-blue);
    transform: translateY(-4px);
    font-size: 14px;
}

.form-field.valid input,
.form-field.valid textarea,
.form-field.valid select {
    border-color: var(--apple-green);
    box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.1);
}

.form-field.invalid input,
.form-field.invalid textarea,
.form-field.invalid select {
    border-color: var(--apple-red);
    box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.1);
}

.nav-menu.active {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    padding: var(--apple-spacing-lg);
    border-radius: 0 0 var(--apple-radius-lg) var(--apple-radius-lg);
    box-shadow: var(--apple-shadow-lg);
}

@media (min-width: 769px) {
    .nav-menu {
        display: flex !important;
        position: static;
        background: none;
        backdrop-filter: none;
        padding: 0;
        border-radius: 0;
        box-shadow: none;
        flex-direction: row;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', dynamicStyles);