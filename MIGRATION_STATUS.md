# Prisma to Raw SQL Migration Status

## Current Status: IN PROGRESS 🔄

### Infrastructure ✅

- [x] PostgreSQL connection pool (`/lib/postgres.ts`)
- [x] Query helper functions (`/lib/db-queries.ts`)
- [x] Database utilities (`/lib/db.ts`)

### API Routes to Convert

#### Authentication Routes (8 files)

- [ ] `/app/api/auth/login/route.ts`
- [ ] `/app/api/auth/admin-login/route.ts`
- [ ] `/app/api/auth/register/route.ts` - **HAS ERRORS** (IdType import from @prisma/client)
- [ ] `/app/api/auth/verify-email/route.ts`
- [ ] `/app/api/auth/forgot-password/route.ts`
- [ ] `/app/api/auth/reset-password/route.ts`
- [ ] `/app/api/auth/resend-verification/route.ts`
- [x] `/app/api/auth/logout/route.ts` - No Prisma (cookies only)

#### Public Routes (4 files)

- [ ] `/app/api/branches/route.ts`
- [ ] `/app/api/amenities/route.ts` - **HAS ERRORS** (TypeScript any type)
- [ ] `/app/api/rooms/route.ts` - **HAS ERRORS** (TypeScript any type)
- [ ] `/app/api/rooms/[slug]/route.ts` - **HAS ERRORS** (TypeScript any type)

#### Booking Routes (1 file)

- [ ] `/app/api/bookings/[id]/routes.ts`

#### Admin Routes (4+ files)

- [ ] `/app/api/admin/rooms/route.ts`
- [ ] `/app/api/admin/rooms/[id]/route.ts`
- [ ] `/app/api/admin/rooms/instances/route.ts`
- [ ] `/app/api/admin/rooms/instances/[id]/route.ts`

### Frontend Components

- [ ] Check for any Prisma type imports
- [ ] Verify API calls work with new response format

### Database Schema Reference

**Table Names** (snake_case - via @@map()):

- users
- guest_profiles
- staff_profiles
- branches
- room_types
- rooms
- amenities
- room_type_amenities
- room_images
- verification_tokens
- password_reset_tokens
- bookings

**Column Names** (camelCase - Prisma default with quotes in SQL):

- "firstName", "lastName", "emailVerified"
- "userId", "branchId", "roomTypeId"
- "basePrice", "displayOrder", "isPrimary"
- etc.

### Next Steps

1. Convert login route (most critical)
2. Convert register route (remove @prisma/client import)
3. Convert other auth routes
4. Convert public routes (rooms, branches, amenities)
5. Convert booking routes
6. Fix TypeScript errors
7. Test all endpoints
