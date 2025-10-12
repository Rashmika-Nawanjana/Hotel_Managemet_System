import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db-queries'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    console.log('Email verification attempt with token:', token.substring(0, 10) + '...')

    // Find verification token
    const verificationToken = await queryOne<any>(
      `SELECT id, "userId", "expiresAt", used 
       FROM verification_tokens 
       WHERE token = $1`,
      [token]
    )

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      )
    }

    // Check if already used
    if (verificationToken.used) {
      return NextResponse.json(
        { error: 'This verification link has already been used' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > new Date(verificationToken.expiresAt)) {
      return NextResponse.json(
        { error: 'This verification link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update user's email verification status
    await execute(
      'UPDATE users SET "emailVerified" = true, "updatedAt" = NOW() WHERE id = $1',
      [verificationToken.userId]
    )

    // Mark token as used
    await execute(
      'UPDATE verification_tokens SET used = true WHERE id = $1',
      [verificationToken.id]
    )

    console.log('✅ Email verified successfully for user:', verificationToken.userId)

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully! You can now sign in.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}