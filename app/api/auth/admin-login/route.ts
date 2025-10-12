import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { queryOne, execute, transaction } from '@/lib/db-queries'
import { generateToken, generateVerificationToken } from '@/lib/auth'
import { sendEmail, get2FACodeHTML, get2FACodeText } from '@/lib/email'
import { randomBytes } from 'crypto'

// Generate CUID-like ID
function generateId() {
  return 'c' + randomBytes(12).toString('base64').replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 24)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, twoFactorCode, step } = body

    console.log('🔐 Admin login attempt:', { email, step, hasCode: !!twoFactorCode })

    // STEP 1: Validate credentials and send 2FA code
    if (step === 'credentials' || !step) {
      // Validation
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        )
      }

      console.log('📧 Looking up admin user:', email.toLowerCase())

      // Find admin user by email
      const user = await queryOne<any>(
        `SELECT 
          u.id,
          u.email,
          u.password,
          u."firstName",
          u."lastName",
          u.phone,
          u.role,
          u.status,
          u."emailVerified"
        FROM users u
        WHERE u.email = $1 AND u.role = 'ADMIN'`,
        [email.toLowerCase()]
      )

      // Check if user exists
      if (!user) {
        console.log('❌ No admin found with this email')
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      console.log('✅ Admin user found:', user.email)
      console.log('📝 User status:', user.status)
      console.log('✉️ Email verified:', user.emailVerified)

      // Check if account is active
      if (user.status !== 'ACTIVE') {
        console.log('⛔ Account not active')
        return NextResponse.json(
          { error: 'Your account has been suspended. Please contact IT support.' },
          { status: 403 }
        )
      }

      // Check if email is verified
      if (!user.emailVerified) {
        console.log('⚠️ Email not verified')
        return NextResponse.json(
          { 
            error: 'Email not verified',
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email address before logging in.'
          },
          { status: 403 }
        )
      }

      // Verify password
      console.log('🔑 Verifying password...')
      const isValidPassword = await bcrypt.compare(password, user.password)
      console.log('🔓 Password valid:', isValidPassword)

      if (!isValidPassword) {
        console.log('❌ Invalid password')
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Generate 6-digit 2FA code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const tokenId = generateId()
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

      console.log(`🔐 2FA Code generated for ${user.email}: ${code}`)
      console.log(`⏰ Code expires at:`, expiresAt.toISOString())

      // Store 2FA code in database using transaction
      await transaction(async (client) => {
        // Delete old unused 2FA codes for this user
        await client.query(
          'DELETE FROM verification_tokens WHERE "userId" = $1 AND used = false',
          [user.id]
        )

        // Create new 2FA code token
        await client.query(
          `INSERT INTO verification_tokens (id, token, "userId", "expiresAt", used, "createdAt")
           VALUES ($1, $2, $3, $4, false, NOW())`,
          [tokenId, code, user.id, expiresAt]
        )
      })

      console.log('💾 2FA code stored in database')

      // Send 2FA code via email
      try {
        await sendEmail({
          to: user.email,
          subject: `Your Sky Nest Admin Login Code: ${code}`,
          html: get2FACodeHTML(user.firstName, code),
          text: get2FACodeText(user.firstName, code),
        })
        console.log('✅ 2FA code sent successfully via email')
      } catch (emailError) {
        console.error('❌ Failed to send 2FA email:', emailError)
        return NextResponse.json(
          { error: 'Failed to send 2FA code. Please try again.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        {
          success: true,
          message: 'A 6-digit verification code has been sent to your email',
          requiresTwoFactor: true,
          userId: user.id,
          email: user.email,
          expiresIn: 300, // 5 minutes in seconds
        },
        { status: 200 }
      )
    }

    // STEP 2: Verify 2FA code
    if (step === '2fa') {
      const { userId } = body

      console.log('🔢 Verifying 2FA code for user:', userId)

      if (!userId || !twoFactorCode) {
        return NextResponse.json(
          { error: 'User ID and 2FA code are required' },
          { status: 400 }
        )
      }

      // Find valid 2FA token
      const tokenData = await queryOne<any>(
        `SELECT id, token, "userId", "expiresAt", used 
         FROM verification_tokens 
         WHERE "userId" = $1 AND token = $2 AND used = false
         ORDER BY "createdAt" DESC
         LIMIT 1`,
        [userId, twoFactorCode.trim()]
      )

      if (!tokenData) {
        console.log('❌ Invalid 2FA code')
        return NextResponse.json(
          { error: 'Invalid or expired 2FA code. Please try again.' },
          { status: 401 }
        )
      }

      // Check if token is expired
      if (new Date() > new Date(tokenData.expiresAt)) {
        console.log('⏰ 2FA code expired')
        // Mark as used/expired
        await execute(
          'UPDATE verification_tokens SET used = true WHERE id = $1',
          [tokenData.id]
        )
        return NextResponse.json(
          { error: '2FA code expired. Please login again.' },
          { status: 401 }
        )
      }

      console.log('✅ 2FA code verified successfully')

      // Mark token as used
      await execute(
        'UPDATE verification_tokens SET used = true WHERE id = $1',
        [tokenData.id]
      )

      // Get full user data
      const user = await queryOne<any>(
        `SELECT 
          u.id,
          u.email,
          u."firstName",
          u."lastName",
          u.phone,
          u.role,
          u.status,
          u."emailVerified"
        FROM users u
        WHERE u.id = $1`,
        [userId]
      )

      if (!user) {
        console.log('❌ User not found')
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Get staff profile
      const staffProfile = await queryOne<any>(
        `SELECT 
          sp.id,
          sp."userId",
          sp.position,
          sp.department,
          sp."hireDate",
          sp."employeeId",
          sp."branchId",
          b.id as "branch_id",
          b.name as "branch_name",
          b.location as "branch_location"
        FROM staff_profiles sp
        LEFT JOIN branches b ON sp."branchId" = b.id
        WHERE sp."userId" = $1`,
        [userId]
      )

      // Update last login time
      await execute(
        'UPDATE users SET "lastLoginAt" = NOW() WHERE id = $1',
        [user.id]
      )

      console.log('📝 Last login time updated')

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      console.log('🎫 JWT token generated')

      // Prepare user data
      const userData = {
        ...user,
        staffProfile: staffProfile || null,
      }

      // Set token in HTTP-only cookie
      const response = NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: userData,
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
      console.log('🎉 User authenticated with 2FA')

      return response
    }

    return NextResponse.json(
      { error: 'Invalid request step' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('💥 Admin login error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}