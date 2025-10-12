import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { generateToken, generateVerificationToken } from '@/lib/auth'
import { queryOne, transaction } from '@/lib/db-queries'
import { sendEmail, getEmailVerificationHTML, getEmailVerificationText } from '@/lib/email'
import { randomBytes } from 'crypto'

// Generate CUID-like ID
function generateId() {
  return 'c' + randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 24)
}

// Valid enum values
const VALID_ID_TYPES = ['PASSPORT', 'NATIONAL_ID', 'DRIVING_LICENSE']

function normalizeIdType(idType: string | null | undefined): string | null {
  if (!idType) return null
  
  const normalized = idType.toUpperCase().replace(/[- ]/g, '_')
  
  if (VALID_ID_TYPES.includes(normalized)) {
    return normalized
  }
  
  if (normalized === 'NIC' || normalized === 'NATIONALID') {
    return 'NATIONAL_ID'
  }
  if (normalized === 'LICENSE' || normalized === 'DRIVINGLICENSE') {
    return 'DRIVING_LICENSE'
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      nationality,
      idType,
      idNumber,
      address,
      city,
      postalCode,
    } = body

    console.log('Registration attempt for email:', email)

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName, phone' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Normalize idType
    const normalizedIdType = normalizeIdType(idType)

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate IDs
    const userId = generateId()
    const guestProfileId = generateId()
    const verificationTokenId = generateId()
    const verificationToken = generateVerificationToken()
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    console.log('Creating user in database...')

    // Create user, guest profile, and verification token in a transaction
    await transaction(async (client) => {
      // Insert user with emailVerified = false
      await client.query(
        `INSERT INTO users (
          id, email, password, "firstName", "lastName", phone,
          "dateOfBirth", nationality, "idType", "idNumber",
          address, city, "postalCode", role, status,
          "emailVerified", "twoFactorEnabled", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
        [
          userId,
          email.toLowerCase(),
          hashedPassword,
          firstName,
          lastName,
          phone,
          dateOfBirth ? new Date(dateOfBirth) : null,
          nationality || null,
          normalizedIdType,
          idNumber || null,
          address || null,
          city || null,
          postalCode || null,
          'GUEST',
          'ACTIVE',
          false, // ✅ Email not verified yet
          false,
        ]
      )

      // Create guest profile
      await client.query(
        `INSERT INTO guest_profiles (
          id, "userId", "loyaltyPoints", "memberSince", "totalBookings",
          "totalSpent", "smokingPreference", newsletter,
          "emailNotifications", "smsNotifications", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          guestProfileId,
          userId,
          0,
          0,
          0,
          'non-smoking',
          true,
          true,
          true,
        ]
      )

      // Create verification token
      await client.query(
        `INSERT INTO verification_tokens (
          id, token, "userId", "expiresAt", used, "createdAt"
        ) VALUES ($1, $2, $3, $4, false, NOW())`,
        [verificationTokenId, verificationToken, userId, verificationExpiry]
      )
    })

    console.log('✅ User created successfully:', userId)

    // Create verification link
    const verificationLink = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify-email?token=${verificationToken}`

    // Send verification email
    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: 'Verify Your Sky Nest Hotel Account 📧',
      html: getEmailVerificationHTML(firstName, verificationLink),
      text: getEmailVerificationText(firstName, verificationLink),
    })

    if (emailResult.success) {
      console.log('✅ Verification email sent to:', email)
    } else {
      console.error('❌ Failed to send verification email:', emailResult.error)
    }

    // Return success (don't auto-login, require verification first)
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.',
        email: email.toLowerCase(),
        verificationRequired: true,
        // In development, return the link
        ...(process.env.NODE_ENV === 'development' && { verificationLink }),
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Registration failed. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}