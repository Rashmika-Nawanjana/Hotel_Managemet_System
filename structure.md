sky-nest-hotel/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # Landing/Homepage
│   │   │
│   │   ├── auth/                         # Authentication Pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Guest Login
│   │   │   ├── register/
│   │   │   │   └── page.tsx             # Guest Registration
│   │   │   ├── staff-login/
│   │   │   │   └── page.tsx             # Staff Login
│   │   │   ├── admin-login/
│   │   │   │   └── page.tsx             # Admin Login
│   │   │   └── forgot-password/
│   │   │       └── page.tsx             # Password Reset
│   │   │
│   │   ├── guest/                        # Guest Portal (Authenticated)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Guest Dashboard
│   │   │   ├── search-rooms/
│   │   │   │   └── page.tsx             # Search & View Rooms
│   │   │   ├── room-details/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Individual Room Details
│   │   │   ├── booking/
│   │   │   │   ├── page.tsx             # Booking Form
│   │   │   │   ├── payment/
│   │   │   │   │   └── page.tsx         # Payment Processing
│   │   │   │   └── confirmation/
│   │   │   │       └── page.tsx         # Booking Confirmation
│   │   │   ├── my-bookings/
│   │   │   │   ├── page.tsx             # View All Bookings
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx         # Booking Details
│   │   │   │   ├── modify/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Modify Booking
│   │   │   │   └── cancel/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx     # Cancel Booking
│   │   │   ├── services/
│   │   │   │   ├── page.tsx             # Service Catalogue
│   │   │   │   ├── request/
│   │   │   │   │   └── page.tsx         # Request Services
│   │   │   │   └── my-requests/
│   │   │   │       └── page.tsx         # Track Service Requests
│   │   │   ├── billing/
│   │   │   │   ├── page.tsx             # View Bills & Payments
│   │   │   │   ├── invoice/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Download Invoice
│   │   │   │   └── payment-history/
│   │   │   │       └── page.tsx         # Payment History
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx             # Profile Management
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx         # Edit Profile
│   │   │   │   └── preferences/
│   │   │   │       └── page.tsx         # Room Preferences
│   │   │   └── help/
│   │   │       ├── page.tsx             # Help Center
│   │   │       ├── contact/
│   │   │       │   └── page.tsx         # Customer Care
│   │   │       └── manual/
│   │   │           └── page.tsx         # User Manual
│   │   │
│   │   ├── staff/                        # Staff Portal
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Staff Dashboard
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx             # Manage All Bookings
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx         # Create New Booking
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx         # View/Edit Booking
│   │   │   │   ├── check-in/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Process Check-in
│   │   │   │   ├── check-out/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Process Check-out
│   │   │   │   ├── no-show/
│   │   │   │   │   └── page.tsx         # Mark No-Show
│   │   │   │   └── late-checkin/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx     # Extend Check-in Time
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx             # Room Status Overview
│   │   │   │   ├── availability/
│   │   │   │   │   └── page.tsx         # Real-time Availability
│   │   │   │   └── maintenance/
│   │   │   │       └── page.tsx         # Room Maintenance Status
│   │   │   ├── guests/
│   │   │   │   ├── page.tsx             # Guest Management
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx         # Search Guests
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx         # Guest Profile
│   │   │   │   └── history/
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx     # Guest Booking History
│   │   │   ├── services/
│   │   │   │   ├── page.tsx             # Service Requests Dashboard
│   │   │   │   ├── pending/
│   │   │   │   │   └── page.tsx         # Pending Service Requests
│   │   │   │   ├── completed/
│   │   │   │   │   └── page.tsx         # Completed Services
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx         # Service Request Details
│   │   │   ├── billing/
│   │   │   │   ├── page.tsx             # Billing Dashboard
│   │   │   │   ├── pending-payments/
│   │   │   │   │   └── page.tsx         # Pending Payments
│   │   │   │   ├── process-payment/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Process Payment
│   │   │   │   └── invoices/
│   │   │   │       ├── page.tsx         # Generate Invoices
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx     # Invoice Details
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx             # Reports Dashboard
│   │   │   │   ├── occupancy/
│   │   │   │   │   └── page.tsx         # Occupancy Reports
│   │   │   │   ├── revenue/
│   │   │   │   │   └── page.tsx         # Revenue Reports
│   │   │   │   └── services/
│   │   │   │       └── page.tsx         # Service Usage Reports
│   │   │   └── alerts/
│   │   │       └── page.tsx             # System Alerts
│   │   │
│   │   ├── admin/                        # Admin Portal
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx             # Admin Dashboard
│   │   │   ├── branch-management/
│   │   │   │   ├── page.tsx             # Manage Branches
│   │   │   │   ├── add/
│   │   │   │   │   └── page.tsx         # Add New Branch
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         # Branch Details
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx     # Edit Branch
│   │   │   ├── room-management/
│   │   │   │   ├── page.tsx             # Room Inventory
│   │   │   │   ├── add/
│   │   │   │   │   └── page.tsx         # Add New Room
│   │   │   │   ├── categories/
│   │   │   │   │   └── page.tsx         # Room Categories
│   │   │   │   ├── pricing/
│   │   │   │   │   └── page.tsx         # Room Pricing
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         # Room Details
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx     # Edit Room
│   │   │   ├── service-management/
│   │   │   │   ├── page.tsx             # Service Catalogue
│   │   │   │   ├── add/
│   │   │   │   │   └── page.tsx         # Add New Service
│   │   │   │   ├── pricing/
│   │   │   │   │   └── page.tsx         # Service Pricing
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         # Service Details
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx     # Edit Service
│   │   │   ├── user-management/
│   │   │   │   ├── page.tsx             # User Management
│   │   │   │   ├── staff/
│   │   │   │   │   ├── page.tsx         # Staff Management
│   │   │   │   │   ├── add/
│   │   │   │   │   │   └── page.tsx     # Add Staff
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx     # Staff Details
│   │   │   │   ├── roles/
│   │   │   │   │   └── page.tsx         # Role Management
│   │   │   │   └── permissions/
│   │   │   │       └── page.tsx         # Access Control
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx             # Analytics Dashboard
│   │   │   │   ├── revenue/
│   │   │   │   │   └── page.tsx         # Revenue Analytics
│   │   │   │   ├── occupancy/
│   │   │   │   │   └── page.tsx         # Occupancy Analytics
│   │   │   │   ├── guest-trends/
│   │   │   │   │   └── page.tsx         # Guest Behavior Trends
│   │   │   │   ├── service-usage/
│   │   │   │   │   └── page.tsx         # Service Usage Analytics
│   │   │   │   └── cancellation-analysis/
│   │   │   │       └── page.tsx         # Cancellation Analysis
│   │   │   ├── reports/
│   │   │   │   ├── page.tsx             # Advanced Reports
│   │   │   │   ├── monthly/
│   │   │   │   │   └── page.tsx         # Monthly Reports
│   │   │   │   ├── branch-comparison/
│   │   │   │   │   └── page.tsx         # Branch Comparison
│   │   │   │   ├── guest-preferences/
│   │   │   │   │   └── page.tsx         # Guest Preference Reports
│   │   │   │   └── financial/
│   │   │   │       └── page.tsx         # Financial Reports
│   │   │   ├── system/
│   │   │   │   ├── page.tsx             # System Settings
│   │   │   │   ├── backup/
│   │   │   │   │   └── page.tsx         # Data Backup
│   │   │   │   ├── security/
│   │   │   │   │   └── page.tsx         # Security Settings
│   │   │   │   ├── audit-logs/
│   │   │   │   │   └── page.tsx         # Audit Logs
│   │   │   │   └── maintenance/
│   │   │   │       └── page.tsx         # System Maintenance
│   │   │   └── policies/
│   │   │       ├── page.tsx             # Policy Management
│   │   │       ├── cancellation/
│   │   │       │   └── page.tsx         # Cancellation Policy
│   │   │       ├── refund/
│   │   │       │   └── page.tsx         # Refund Policy
│   │   │       └── frequent-cancellers/
│   │   │           └── page.tsx         # Frequent Canceller Rules
│   │   │
│   │   └── api/                          # API Routes
│   │       ├── auth/
│   │       ├── bookings/
│   │       ├── rooms/
│   │       ├── guests/
│   │       ├── services/
│   │       ├── payments/
│   │       ├── reports/
│   │       └── admin/