import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, execute, transaction } from '@/lib/db-queries'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    console.log('Password reset attempt with token:', token.substring(0, 10) + '...')

    // Find valid token
    const resetToken = await queryOne<any>(
  `SELECT id, "userId", "expiresAt", used 
   FROM "PasswordResetToken" 
   WHERE token = $1`,
      [token]
    )

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'This reset link has already been used' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (new Date() > new Date(resetToken.expiresAt)) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password and mark token as used in a transaction
    await transaction(async (client) => {
      // Update user password
      await client.query(
  'UPDATE users SET password = $1, updatedat = NOW() WHERE id = $2',
        [hashedPassword, resetToken.userId]
      )

      // Mark token as used
      await client.query(
        'UPDATE "PasswordResetToken" SET used = true WHERE id = $1',
        [resetToken.id]
      )
    })

    console.log('✅ Password reset successful for user:', resetToken.userId)

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}