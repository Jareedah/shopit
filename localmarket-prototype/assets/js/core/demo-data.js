/**
 * Demo Data Generator
 * Creates realistic scenarios and data for playacting demonstrations
 */

const DemoData = (function() {
    
    // Demo User Profiles
    const demoUsers = {
        'buyer_sarah': {
            id: 'user_sarah_001',
            username: 'sarah_johnson',
            role: 'user',
            profile: {
                name: 'Sarah Johnson',
                email: 'sarah.j@email.com',
                location: 'Manhattan, New York, NY',
                phone: '(555) 123-4567',
                bio: 'Event planner looking for quality services'
            },
            stats: {
                listingsCount: 2,
                ordersCount: 8,
                reviewsCount: 6,
                rating: 4.8
            },
            memberSince: '2023-06-15',
            verificationStatus: 'verified'
        },
        
        'seller_mike': {
            id: 'user_mike_002',
            username: 'mikes_electronics',
            role: 'user',
            profile: {
                name: 'Mike\'s Electronics Store',
                email: 'mike@electronics.com',
                location: 'Brooklyn, New York, NY',
                phone: '(555) 987-6543',
                bio: 'Professional electronics retailer with 10+ years experience'
            },
            stats: {
                listingsCount: 15,
                ordersCount: 156,
                reviewsCount: 89,
                rating: 4.9
            },
            memberSince: '2022-03-20',
            verificationStatus: 'business_verified'
        }
    };
    
    // Demo Listings
    const demoListings = [
        {
            id: 'listing_photography_001',
            sellerId: 'user_mike_002',
            title: 'Professional Wedding Photography',
            description: 'Capture your special day with stunning professional photography. 10+ years experience, full editing included, 200+ photos delivered within 2 weeks.',
            category: 'services',
            tags: ['photography', 'wedding', 'professional', 'editing'],
            price: 850.00,
            priceUnit: 'project',
            requiresApproval: true,
            location: {
                lat: 40.7128,
                lng: -74.0060,
                address: 'New York, NY'
            },
            images: ['wedding_photo_1.jpg', 'wedding_photo_2.jpg'],
            availability: {
                type: 'service',
                bookingRequired: true,
                availableSlots: [
                    { date: '2024-02-15T10:00:00Z', duration: 8, available: true },
                    { date: '2024-02-22T09:00:00Z', duration: 8, available: true },
                    { date: '2024-03-01T11:00:00Z', duration: 8, available: false }
                ]
            },
            status: 'active',
            views: 45,
            created_at: '2024-01-10T14:30:00Z'
        },
        
        {
            id: 'listing_iphone_001',
            sellerId: 'user_sarah_001',
            title: 'iPhone 14 Pro - Excellent Condition',
            description: 'Selling my iPhone 14 Pro in excellent condition. Always kept in case, no scratches. Includes original box, charger, and screen protector. Battery health 96%.',
            category: 'electronics',
            tags: ['iphone', 'smartphone', 'apple', 'unlocked'],
            price: 750.00,
            priceUnit: 'each',
            requiresApproval: false,
            location: {
                lat: 40.7831,
                lng: -73.9712,
                address: 'Manhattan, New York, NY'
            },
            images: ['iphone_1.jpg', 'iphone_2.jpg', 'iphone_3.jpg'],
            availability: {
                type: 'product',
                stock: 1,
                showStock: true
            },
            status: 'active',
            views: 23,
            created_at: '2024-01-12T09:15:00Z'
        }
    ];
    
    // Demo Orders with Escrow States
    const demoOrders = [
        {
            id: 'order_escrow_001',
            buyerId: 'user_sarah_001',
            sellerId: 'user_mike_002',
            listingId: 'listing_photography_001',
            quantity: 1,
            totalAmount: 850.00,
            platformFee: 17.00,
            sellerAmount: 833.00,
            status: 'funds_held_escrow',
            escrowDetails: {
                paymentDate: '2024-01-20T15:30:00Z',
                holdExpiry: '2024-01-23T15:30:00Z', // 72 hours
                releaseRequested: false,
                disputeWindow: true,
                autoReleaseIn: '68 hours 23 minutes'
            },
            bookingDetails: {
                scheduledDate: '2024-02-15T10:00:00Z',
                duration: 8,
                location: 'Central Park, New York'
            },
            created_at: '2024-01-20T15:30:00Z'
        },
        
        {
            id: 'order_approval_001',
            buyerId: 'user_mike_002',
            sellerId: 'user_sarah_001',
            listingId: 'listing_iphone_001',
            quantity: 1,
            totalAmount: 750.00,
            platformFee: 15.00,
            sellerAmount: 735.00,
            status: 'pending_seller_approval',
            approvalDetails: {
                requestDate: '2024-01-21T10:15:00Z',
                approvalDeadline: '2024-01-22T10:15:00Z', // 24 hours
                sellerResponseTime: '< 12 hours typically',
                autoApprove: false
            },
            created_at: '2024-01-21T10:15:00Z'
        }
    ];
    
    // Demo Reviews and Ratings
    const demoReviews = [
        {
            id: 'review_001',
            orderId: 'order_completed_001',
            reviewerId: 'user_sarah_001',
            revieweeId: 'user_mike_002',
            rating: 5,
            title: 'Outstanding photography service!',
            comment: 'Mike exceeded all expectations. The photos are absolutely stunning and captured every special moment perfectly. Professional, punctual, and a pleasure to work with.',
            images: ['review_photo_1.jpg'],
            helpfulVotes: 12,
            created_at: '2024-01-18T16:45:00Z'
        },
        
        {
            id: 'review_002',
            orderId: 'order_completed_002',
            reviewerId: 'user_mike_002',
            revieweeId: 'user_sarah_001',
            rating: 5,
            title: 'Great buyer - smooth transaction',
            comment: 'Sarah was communicative throughout the process and payment was prompt. Would definitely do business again!',
            images: [],
            helpfulVotes: 3,
            created_at: '2024-01-19T11:20:00Z'
        }
    ];
    
    // Demo Messages/Conversations
    const demoMessages = [
        {
            conversationId: 'conv_001',
            orderId: 'order_escrow_001',
            participants: ['user_sarah_001', 'user_mike_002'],
            messages: [
                {
                    id: 'msg_001',
                    senderId: 'user_sarah_001',
                    message: 'Hi Mike! I\'m excited about the wedding photography. Can we discuss the timeline?',
                    timestamp: '2024-01-20T16:00:00Z',
                    read: true
                },
                {
                    id: 'msg_002',
                    senderId: 'user_mike_002',
                    message: 'Absolutely! I typically arrive 2 hours before the ceremony. We can do a quick venue walkthrough the day before if you\'d like.',
                    timestamp: '2024-01-20T16:15:00Z',
                    read: true
                },
                {
                    id: 'msg_003',
                    senderId: 'user_sarah_001',
                    message: 'That sounds perfect! The venue is Central Park Conservatory Garden. I\'ll send you the exact location details.',
                    timestamp: '2024-01-20T16:30:00Z',
                    read: false
                }
            ]
        }
    ];
    
    // Demo Dispute Cases
    const demoDisputes = [
        {
            id: 'dispute_001',
            orderId: 'order_dispute_001',
            initiatedBy: 'user_buyer_003',
            reason: 'Item not as described',
            description: 'The laptop arrived with a cracked screen that wasn\'t mentioned in the listing.',
            evidence: ['damage_photo_1.jpg', 'original_listing_screenshot.jpg'],
            status: 'under_review',
            adminNotes: 'Reviewing evidence submitted by both parties',
            created_at: '2024-01-19T14:20:00Z'
        }
    ];
    
    return {
        // Get demo data by type
        getUsers() { return demoUsers; },
        getListings() { return demoListings; },
        getOrders() { return demoOrders; },
        getReviews() { return demoReviews; },
        getMessages() { return demoMessages; },
        getDisputes() { return demoDisputes; },
        
        // Generate realistic scenarios
        generateEscrowScenario() {
            return {
                title: 'Escrow Payment Demonstration',
                description: 'Shows how payments are held safely until delivery confirmation',
                participants: {
                    buyer: demoUsers.buyer_sarah,
                    seller: demoUsers.seller_mike
                },
                order: demoOrders[0],
                timeline: [
                    { step: 'Payment Made', status: 'completed', time: '2 hours ago' },
                    { step: 'Funds Held in Escrow', status: 'current', time: 'Now' },
                    { step: 'Service Delivery', status: 'pending', time: 'Feb 15, 10:00 AM' },
                    { step: 'Confirmation & Release', status: 'pending', time: 'After delivery' }
                ]
            };
        },
        
        generateApprovalScenario() {
            return {
                title: 'Seller Approval Workflow',
                description: 'Demonstrates how sellers can approve purchases before payment',
                participants: {
                    buyer: demoUsers.seller_mike,
                    seller: demoUsers.buyer_sarah
                },
                order: demoOrders[1],
                timeline: [
                    { step: 'Purchase Requested', status: 'completed', time: '6 hours ago' },
                    { step: 'Awaiting Seller Approval', status: 'current', time: 'Now' },
                    { step: 'Payment Processing', status: 'pending', time: 'After approval' },
                    { step: 'Order Fulfillment', status: 'pending', time: 'After payment' }
                ]
            };
        },
        
        generateBookingScenario() {
            return {
                title: 'Service Booking Calendar',
                description: 'Shows how customers book time slots for services',
                service: demoListings[0],
                availableSlots: [
                    { date: '2024-02-15', time: '10:00 AM', duration: '8 hours', available: true },
                    { date: '2024-02-22', time: '9:00 AM', duration: '8 hours', available: true },
                    { date: '2024-03-01', time: '11:00 AM', duration: '8 hours', available: false, reason: 'Booked' }
                ]
            };
        },
        
        generateMessagingScenario() {
            return {
                title: 'In-App Communication',
                description: 'Demonstrates buyer-seller communication tied to orders',
                conversation: demoMessages[0],
                features: [
                    'Order-specific conversations',
                    'File sharing capability',
                    'Read receipts and typing indicators',
                    'Message history preservation'
                ]
            };
        },
        
        generateReviewScenario() {
            return {
                title: 'Ratings & Reviews System',
                description: 'Shows post-transaction feedback and reputation building',
                reviews: demoReviews,
                aggregateRating: 4.85,
                totalReviews: 47,
                ratingDistribution: {
                    5: 35,
                    4: 8,
                    3: 3,
                    2: 1,
                    1: 0
                }
            };
        },
        
        // Playacting state generators
        generateEscrowStates() {
            return {
                'payment_pending': {
                    icon: '⏳',
                    title: 'Payment Pending',
                    description: 'Waiting for buyer payment',
                    color: 'warning'
                },
                'funds_held_escrow': {
                    icon: '🔒',
                    title: 'Funds Secured',
                    description: 'Payment held safely in escrow',
                    color: 'info'
                },
                'release_requested': {
                    icon: '📤',
                    title: 'Release Requested',
                    description: 'Seller requested fund release',
                    color: 'warning'
                },
                'funds_released': {
                    icon: '✅',
                    title: 'Payment Complete',
                    description: 'Funds successfully released to seller',
                    color: 'success'
                },
                'in_dispute': {
                    icon: '⚠️',
                    title: 'In Dispute',
                    description: 'Admin reviewing dispute case',
                    color: 'error'
                }
            };
        },
        
        generateApprovalStates() {
            return {
                'pending_approval': {
                    icon: '⏰',
                    title: 'Awaiting Approval',
                    description: 'Seller reviewing purchase request',
                    color: 'warning'
                },
                'approved': {
                    icon: '✅',
                    title: 'Approved',
                    description: 'Seller approved - proceed to payment',
                    color: 'success'
                },
                'rejected': {
                    icon: '❌',
                    title: 'Request Declined',
                    description: 'Seller declined the purchase request',
                    color: 'error'
                },
                'auto_approved': {
                    icon: '⚡',
                    title: 'Auto-Approved',
                    description: 'Automatically approved for purchase',
                    color: 'success'
                }
            };
        },
        
        // Generate realistic timing
        generateTimestamps() {
            const now = new Date();
            return {
                '2_hours_ago': new Date(now - 2 * 60 * 60 * 1000),
                '6_hours_ago': new Date(now - 6 * 60 * 60 * 1000),
                '1_day_ago': new Date(now - 24 * 60 * 60 * 1000),
                '3_days_ago': new Date(now - 3 * 24 * 60 * 60 * 1000),
                'next_week': new Date(now + 7 * 24 * 60 * 60 * 1000),
                'in_72_hours': new Date(now + 72 * 60 * 60 * 1000)
            };
        },
        
        // Create compelling demo narratives
        createDemoNarrative(scenario) {
            const narratives = {
                escrow: {
                    title: '💰 Secure Payment Protection',
                    story: 'Sarah books Mike for wedding photography. Her $850 payment is held safely in escrow until the photos are delivered and both parties confirm completion.',
                    keyPoints: [
                        'Buyer protection: Money held until delivery confirmed',
                        'Seller protection: Guaranteed payment after delivery',
                        'Dispute resolution: Admin arbitration if issues arise',
                        'Automatic release: Funds released after 72 hours if no disputes'
                    ]
                },
                approval: {
                    title: '✋ Seller Approval Control',
                    story: 'John requests to purchase Sarah\'s iPhone. Since Sarah requires approval for sales, she can review the request and decide whether to approve based on buyer profile.',
                    keyPoints: [
                        'Seller control: Choose who can purchase',
                        'Buyer screening: Review customer profiles before approval',
                        'Flexible sales: Enable for high-value or custom items',
                        'Quality assurance: Maintain seller standards'
                    ]
                },
                booking: {
                    title: '📅 Service Booking Calendar',
                    story: 'Lisa offers interior design consultations. Clients can see her available time slots and book appointments directly through the calendar interface.',
                    keyPoints: [
                        'Time slot management: Clear availability display',
                        'Booking confirmation: Instant scheduling confirmation',
                        'Calendar integration: Avoid double-booking conflicts',
                        'Service flexibility: Hourly, daily, or project-based booking'
                    ]
                }
            };
            
            return narratives[scenario] || narratives.escrow;
        }
    };
    
    return {
        getUsers,
        getListings,
        getOrders,
        getReviews,
        getMessages,
        getDisputes,
        generateEscrowScenario,
        generateApprovalScenario,
        generateBookingScenario,
        generateMessagingScenario,
        generateReviewScenario,
        generateEscrowStates,
        generateApprovalStates,
        generateTimestamps,
        createDemoNarrative
    };
})();

// Export for global use
window.DemoData = DemoData;