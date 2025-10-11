# Authentication & Route Protection

## Overview

The hotel management system implements a comprehensive authentication and authorization system using JWT tokens and Next.js middleware.

## Route Access Control

### Public Routes (No Authentication Required)

Anyone can access these pages:

- `/` - Home page
- `/auth/login` - Guest login
- `/auth/register` - Guest registration
- `/auth/admin-login` - Admin login with 2FA
- `/auth/staff-login` - Staff login
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset with token

### Protected Routes (Authentication Required)

#### Guest Routes (`/guest/*`)

**Required Role:** GUEST

- `/guest/dashboard` - Guest dashboard
- `/guest/profile` - Guest profile
- `/guest/my-bookings` - Booking history
- `/guest/booking` - New booking
- `/guest/services` - Service requests
- `/guest/room-details/*` - Room details

#### Staff Routes (`/staff/*`)

**Required Roles:** STAFF or ADMIN

- `/staff/dashboard` - Staff dashboard
- `/staff/*` - All staff management pages

#### Admin Routes (`/admin/*`)

**Required Role:** ADMIN

- `/admin/dashboard` - Admin dashboard
- `/admin/rooms` - Room management
- `/admin/rooms/create` - Create room type
- `/admin/users` - User management
- `/admin/branches` - Branch management
- `/admin/reports` - Reports & analytics
- `/admin/settings` - System settings

## How It Works

### 1. Middleware Protection

The `middleware.ts` file intercepts all requests and:

1. **Checks if route is public** - Allows access without authentication
2. **Checks for auth token** - Reads JWT from cookies
3. **Verifies token** - Validates JWT signature and expiration
4. **Checks user role** - Ensures user has required permissions
5. **Redirects if unauthorized** - Sends to appropriate login page

### 2. Automatic Redirects

When an unauthenticated user tries to access a protected route:

- Trying to access `/guest/*` → Redirects to `/auth/login`
- Trying to access `/admin/*` → Redirects to `/auth/admin-login`
- Trying to access `/staff/*` → Redirects to `/auth/staff-login`

The original URL is preserved as a `redirect` parameter, so users are returned to their intended destination after login.

### 3. Role-Based Access

When an authenticated user tries to access a route they don't have permission for:

- **GUEST** trying to access admin route → Redirected to `/guest/dashboard`
- **STAFF** trying to access guest route → Redirected to `/staff/dashboard`
- **ADMIN** can access both admin and staff routes

### 4. Session Management

- **Token Storage:** JWT stored in HTTP-only cookies
- **Token Duration:** 7 days
- **Token Validation:** On every protected route access
- **Automatic Logout:** When token expires or is invalid

## User Flows

### New Guest (Unauthenticated)

1. Lands on home page (`/`) ✅
2. Can browse rooms and branches ✅
3. Tries to access `/guest/dashboard` → Redirected to `/auth/login` ❌
4. Tries to access `/guest/booking` → Redirected to `/auth/login` ❌
5. Can register at `/auth/register` ✅
6. After login, can access all guest routes ✅

### Registered Guest (Authenticated)

1. Logs in at `/auth/login`
2. Token stored in cookies
3. Can access all `/guest/*` routes ✅
4. Cannot access `/admin/*` routes (redirected to guest dashboard) ❌
5. Cannot access `/staff/*` routes (redirected to guest dashboard) ❌

### Admin User (Authenticated)

1. Logs in at `/auth/admin-login` (with 2FA)
2. Token stored in cookies
3. Can access all `/admin/*` routes ✅
4. Can access all `/staff/*` routes ✅
5. Cannot access `/guest/*` routes (redirected to admin dashboard) ❌

### Staff User (Authenticated)

1. Logs in at `/auth/staff-login`
2. Token stored in cookies
3. Can access all `/staff/*` routes ✅
4. Cannot access `/admin/*` routes (redirected to staff dashboard) ❌
5. Cannot access `/guest/*` routes (redirected to staff dashboard) ❌

## API Route Protection

API routes are also protected:

### Public APIs

- `/api/auth/*` - Authentication endpoints
- `/api/rooms` - Public room listing
- `/api/branches` - Public branch listing
- `/api/amenities` - Public amenities listing

### Protected APIs

- `/api/admin/*` - Admin-only APIs (ADMIN role required)
- `/api/staff/*` - Staff APIs (STAFF or ADMIN role required)
- `/api/guest/*` - Guest APIs (GUEST role required)

## Security Features

1. ✅ **HTTP-only Cookies** - Tokens cannot be accessed via JavaScript
2. ✅ **JWT Verification** - All tokens are cryptographically verified
3. ✅ **Role-Based Access Control (RBAC)** - Users can only access authorized routes
4. ✅ **Token Expiration** - Automatic logout after 7 days
5. ✅ **Redirect Protection** - Users redirected to appropriate login pages
6. ✅ **2FA for Admin** - Additional security for admin accounts
7. ✅ **Email Verification** - Guests must verify email before full access

## Testing

### To Test Route Protection:

1. **Without Login:**

   - Try accessing `http://localhost:3000/guest/dashboard`
   - Should redirect to `/auth/login`

2. **As Guest:**

   - Login at `/auth/login`
   - Try accessing `http://localhost:3000/admin/dashboard`
   - Should redirect to `/guest/dashboard`

3. **As Admin:**
   - Login at `/auth/admin-login`
   - Can access both `/admin/*` and `/staff/*` routes
   - Cannot access `/guest/*` routes

## Configuration

To modify route protection, edit `middleware.ts`:

```typescript
// Add more public routes
const publicRoutes = ["/", "/your-new-public-route"];

// Add more protected routes with required roles
const protectedRoutes = {
  "/your-route": ["REQUIRED_ROLE"],
};
```

## Troubleshooting

### Issue: Redirect Loop

**Solution:** Check if token is valid and not expired

### Issue: Can't Access Protected Route

**Solution:** Ensure you're logged in with the correct role

### Issue: Token Not Persisting

**Solution:** Check browser cookie settings and HTTPS in production

---

**Last Updated:** October 11, 2025
**Middleware File:** `/middleware.ts`
**Auth Library:** `/lib/auth.ts`
