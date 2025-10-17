import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'
import { queryOne, execute } from '@/lib/db-queries'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    console.log('Login attempt for email:', email)

    // Get user
      const user = await queryOne<any>(`
        SELECT 
          id,
          email,
          password,
          firstname,
          lastname,
          phone,
          dateofbirth,
          nationality,
          idtype,
          idnumber,
          address,
          city,
          postalcode,
          role,
          status,
          emailverified,
          twofactorenabled,
          lastloginat
        FROM users
        WHERE email = $1
      `, [email.toLowerCase()])

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // ✅ Check if email is verified
    if (!user.emailverified) {
      return NextResponse.json(
        { 
          error: 'Email not verified',
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address before logging in. Check your inbox for the verification link.',
          email: user.email
        },
        { status: 403 }
      )
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Get profile based on role
    let profile = null
    if (user.role === 'GUEST') {
          profile = await queryOne<any>(`
            SELECT 
              id,
              "userId ",
              "loyaltyPoints",
              "memberSince",
              "totalBookings",
              "totalSpent",
              "preferredRoomType",
              "preferredBedType",
              "smokingPreference",
              "floorPreference",
              "pillowType",
              newsletter,
              "emailNotifications",
              "smsNotifications"
            FROM "GuestProfile"
            WHERE "userId " = $1
          `, [user.id])
    } else if (user.role === 'STAFF' || user.role === 'ADMIN') {
          profile = await queryOne<any>(`
            SELECT 
              id,
              userid,
              employeeid,
              branchid,
              department,
              position,
              salary,
              hiredate,
              rating,
              totalservices
            FROM staff_profiles
            WHERE userid = $1
          `, [user.id])
    }

    // Update last login time
        await execute(`
          UPDATE users 
          SET lastloginat = NOW() 
          WHERE id = $1
        `, [user.id])

    // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          ...userWithoutPassword,
          profile,
        },
        token,
      },
      { status: 200 }
    )

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    console.log('✅ Login successful for:', email)
    return response

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}