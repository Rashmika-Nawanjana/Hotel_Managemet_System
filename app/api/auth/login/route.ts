import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log('Login attempt for email:', email)

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
        guestProfile: true,
        staffProfile: {
          include: {
            branch: true,
          },
        },
      },
    })

    console.log('User found:', user ? 'Yes' : 'No')
    if (user) {
      console.log('Email verified:', user.emailVerified)
      console.log('User status:', user.status)
    }

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
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

    // Check if email is verified ⭐ NEW CHECK
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before signing in',
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email
        },
        { status: 403 }
      )
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact support.' },
        { status: 403 }
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

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}