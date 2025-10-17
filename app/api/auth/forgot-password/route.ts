import { NextRequest, NextResponse } from 'next/server'
import { generateVerificationToken } from '@/lib/auth'
import { queryOne, transaction } from '@/lib/db-queries'
import { sendEmail, getPasswordResetEmailHTML, getPasswordResetEmailText } from '@/lib/email'
import { randomBytes } from 'crypto'

// Generate CUID-like ID
function generateId() {
  return 'c' + randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 24)
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('Password reset request for:', email)

    // Check if user exists
      const user = await queryOne<any>(
        'SELECT "userId", email, "firstName" FROM users WHERE email = $1',
        [email.toLowerCase()]
      )

    // Security: Always return success even if user doesn't exist
      if (!user) {
        console.log('⚠️ User not found, but returning success to prevent enumeration')
        return NextResponse.json(
          {
            success: true,
            message: 'If an account exists with this email, you will receive a password reset link.',
          },
          { status: 200 }
        )
      }

    // Generate reset token
    const resetToken = generateVerificationToken()
    const tokenId = generateId()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Delete old unused tokens and create new one
    await transaction(async (client) => {
        await client.query(
          'DELETE FROM password_reset_tokens WHERE "userId" = $1 AND used = false',
          [user.userId]
        )

        await client.query(
          `INSERT INTO password_reset_tokens (id, token, "userId", "expiresAt", used, "createdAt")
           VALUES ($1, $2, $3, $4, false, NOW())`,
          [tokenId, resetToken, user.userId, expiresAt]
        )
    })

    // Create reset link
    const resetLink = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Send email
    const emailResult = await sendEmail({
        to: user.email,
        subject: 'Reset Your Sky Nest Hotel Password',
        html: getPasswordResetEmailHTML(user.firstName, resetLink, 1),
        text: getPasswordResetEmailText(user.firstName, resetLink, 1),
    })

    if (!emailResult.success) {
      console.error('Failed to send email:', emailResult.error)
      // Still return success to prevent enumeration
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link.',
        },
        { status: 200 }
      )
    }

    console.log('✅ Password reset email sent to:', email)

    // In development, also return the link
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          success: true,
          message: 'Password reset email sent successfully',
          resetLink, // ⚠️ Only for development
          email: user.email,
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}