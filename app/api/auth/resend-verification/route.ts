import { NextRequest, NextResponse } from 'next/server'
import { queryOne, transaction } from '@/lib/db-queries'
import { generateVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

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
    const user = await queryOne(
      'SELECT id, email, firstname, emailverified FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailverified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Generate new token
    const verificationToken = generateVerificationToken()

    // Delete old unused tokens and create new one in a transaction
    await transaction(async (client) => {
      // Delete old unused tokens for this user
      await client.query(
        'DELETE FROM verification_tokens WHERE userid = $1 AND used = false',
        [user.id]
      )

      // Create new verification token
      await client.query(
        `INSERT INTO verification_tokens (token, userid, expiresat, createdat, used)
         VALUES ($1, $2, $3, NOW(), false)`,
        [verificationToken, user.id, new Date(Date.now() + 24 * 60 * 60 * 1000)]
      )
    })

    // Send verification email
    // Compose verification link
    const verificationLink = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`;
    // Send verification email
    const { sendEmail, getEmailVerificationHTML, getEmailVerificationText } = await import('@/lib/email');
    await sendEmail({
      to: user.email,
      subject: 'Verify your email address',
      html: getEmailVerificationHTML(user.firstname, verificationLink),
      text: getEmailVerificationText(user.firstname, verificationLink)
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Verification email sent successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification email' },
      { status: 500 }
    )
  }
}