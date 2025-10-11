import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth-edge'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/admin-login',
  '/auth/staff-login',
  '/auth/forgot-password',
  '/auth/reset-password',
]

// Define routes that start with these paths as public
const publicPathPrefixes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/admin-login',
  '/api/auth/logout',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/resend-verification',
  '/api/rooms', // Public API for viewing rooms
  '/api/branches', // Public API for viewing branches
  '/api/amenities', // Public API for viewing amenities
]

// Define protected route prefixes and their required roles
const protectedRoutes = {
  '/guest': ['GUEST'],
  '/admin': ['ADMIN'],
  '/staff': ['STAFF', 'ADMIN'],
  '/api/admin': ['ADMIN'],
  '/api/staff': ['STAFF', 'ADMIN'],
  '/api/guest': ['GUEST'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🔍 Middleware checking:', pathname)

  // Allow all static files and Next.js internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('/favicon.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.ico') ||
    (pathname.includes('.') && !pathname.includes('/api/'))
  ) {
    return NextResponse.next()
  }

  // Check if route is public
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check if route starts with a public path prefix
  if (publicPathPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value
  console.log('🍪 Token present:', !!token)

  // Check if route requires authentication
  let requiresAuth = false
  let requiredRoles: string[] = []

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      requiresAuth = true
      requiredRoles = roles
      break
    }
  }

  // If route requires auth but no token, redirect to login
  if (requiresAuth && !token) {
    const url = request.nextUrl.clone()
    
    // Determine which login page based on route
    if (pathname.startsWith('/admin')) {
      url.pathname = '/auth/admin-login'
    } else if (pathname.startsWith('/staff')) {
      url.pathname = '/auth/staff-login'
    } else {
      url.pathname = '/auth/login'
    }
    
    // Add redirect parameter to return after login
    url.searchParams.set('redirect', pathname)
    
    return NextResponse.redirect(url)
  }

  // If token exists, verify it and check role
  if (token && requiresAuth) {
    try {
      const decoded = await verifyToken(token)
      
      if (!decoded) {
        // Invalid token - redirect to login
        console.log('❌ Middleware: Invalid token, redirecting to login')
        const url = request.nextUrl.clone()
        url.pathname = pathname.startsWith('/admin') 
          ? '/auth/admin-login' 
          : pathname.startsWith('/staff')
          ? '/auth/staff-login'
          : '/auth/login'
        return NextResponse.redirect(url)
      }

      console.log('✅ Middleware: Token valid, user role:', decoded.role, 'required roles:', requiredRoles)

      // Check if user has required role
      if (!requiredRoles.includes(decoded.role)) {
        console.log('❌ Middleware: User role not authorized for this route')
        // Unauthorized - redirect to appropriate page
        const url = request.nextUrl.clone()
        
        if (decoded.role === 'GUEST') {
          url.pathname = '/guest/dashboard'
        } else if (decoded.role === 'STAFF') {
          url.pathname = '/staff/dashboard'
        } else if (decoded.role === 'ADMIN') {
          url.pathname = '/admin/dashboard'
        } else {
          url.pathname = '/'
        }
        
        return NextResponse.redirect(url)
      }

      console.log('✅ Middleware: Access granted to', pathname)
    } catch (error) {
      // Token verification failed - redirect to login
      console.error('❌ Middleware: Token verification error:', error)
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico|.*\\..*).*)' 
  ],
}
