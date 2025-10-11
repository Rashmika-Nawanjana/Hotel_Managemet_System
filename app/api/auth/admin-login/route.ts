import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { send2FACode } from '@/lib/email'

// Temporary store for 2FA codes (in production, use Redis or database)
const twoFactorCodes = new Map<string, { code: string; expiresAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, twoFactorCode, step, userId } = body

    console.log('Admin login attempt:', { email, userId, step, hasCode: !!twoFactorCode })

    // Step 1: Validate credentials
    if (step === 'credentials' || !step) {
      // Validation
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          staffProfile: {
            include: {
              branch: true,
            },
          },
        },
      })

      console.log('User found:', user ? 'Yes' : 'No')
      if (user) {
        console.log('User role:', user.role)
        console.log('Email verified:', user.emailVerified)
      }

      // Check if user exists
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Check if user is admin
      if (user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized. Admin access only.' },
          { status: 403 }
        )
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password)
      console.log('Password valid:', isValidPassword)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Check if account is active
      if (user.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Your account has been suspended. Please contact IT support.' },
          { status: 403 }
        )
      }

      // Generate 2FA code (6 digits)
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

      // Store code temporarily
      twoFactorCodes.set(user.id, { code, expiresAt })

      console.log(`🔐 2FA Code generated for ${user.email}: ${code}`)
      console.log('⏰ Code expires in 5 minutes')

      // Send 2FA code via email
      try {
        await send2FACode(user.email, user.firstName, code)
        console.log('✅ 2FA code sent via email')
      } catch (emailError) {
        console.error('❌ Failed to send 2FA email:', emailError)
        // Still allow login, but log the error
      }
      
      return NextResponse.json(
        {
          success: true,
          message: '2FA code sent to your email',
          requiresTwoFactor: true,
          userId: user.id,
          email: user.email, // Send email for display purposes
        },
        { status: 200 }
      )
    }

    // Step 2: Verify 2FA code
    if (step === '2fa') {
      const { userId } = body

      if (!userId || !twoFactorCode) {
        return NextResponse.json(
          { error: 'User ID and 2FA code are required' },
          { status: 400 }
        )
      }

      // Get stored code
      const storedData = twoFactorCodes.get(userId)

      if (!storedData) {
        return NextResponse.json(
          { error: '2FA code expired or invalid. Please login again.' },
          { status: 401 }
        )
      }

      // Check if code expired
      if (Date.now() > storedData.expiresAt) {
        twoFactorCodes.delete(userId)
        return NextResponse.json(
          { error: '2FA code expired. Please login again.' },
          { status: 401 }
        )
      }

      // Verify code
      if (storedData.code !== twoFactorCode) {
        return NextResponse.json(
          { error: 'Invalid 2FA code. Please try again.' },
          { status: 401 }
        )
      }

      // Code is valid - delete it
      twoFactorCodes.delete(userId)

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          staffProfile: {
            include: {
              branch: true,
            },
          },
        },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Update last login time
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      // Generate JWT token
      const token = generateToken(user.id, user.role)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      // Set token in HTTP-only cookie
      const response = NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: userWithoutPassword,
          token,
        },
        { status: 200 }
      )

      // Set cookie (expires in 7 days)
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      console.log('✅ Admin login successful:', user.email)

      return response
    }

    return NextResponse.json(
      { error: 'Invalid request step' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}
