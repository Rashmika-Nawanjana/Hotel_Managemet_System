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
      'SELECT id, email, "firstName", "emailVerified" FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
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
        'DELETE FROM verification_tokens WHERE "userId" = $1 AND used = false',
        [user.id]
      )

      // Create new verification token
      await client.query(
        `INSERT INTO verification_tokens (token, "userId", "expiresAt", "createdAt")
         VALUES ($1, $2, $3, NOW())`,
        [verificationToken, user.id, new Date(Date.now() + 24 * 60 * 60 * 1000)]
      )
    })

    // Send verification email
    await sendVerificationEmail(user.email, user.firstName, verificationToken)

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