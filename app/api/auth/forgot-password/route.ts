import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateVerificationToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Don't reveal if user exists (security best practice)
    if (!user) {
      // Still return success to prevent user enumeration
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.',
        },
        { status: 200 }
      )
    }

    // Delete old unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    })

    // Generate reset token
    const resetToken = generateVerificationToken()

    // Create password reset token (expires in 1 hour)
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.firstName, resetToken)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      
      // In production, you might want to return success anyway
      // to prevent revealing if email exists
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    )
  }
}