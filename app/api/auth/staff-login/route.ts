import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db-queries'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find user with STAFF role
    const user = await queryOne(`
      SELECT u.*, sp."employeeId", sp."branchId", sp.department, sp."position", 
             sp."staffRole", sp.permissions, sp."isActive"
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      WHERE u.email = $1 AND u.role = 'STAFF' AND u.status = 'ACTIVE'
    `, [email])

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if staff profile exists and is active
    if (!user.staffRole || !user.isActive) {
      return NextResponse.json({ error: 'Staff account is not active' }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await queryOne(`
      UPDATE "StaffProfile" 
      SET "lastLoginAt" = NOW() 
      WHERE "userId" = $1
    `, [user.id])

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        role: 'STAFF',
        staffRole: user.staffRole,
        branchId: user.branchId,
        permissions: user.permissions || [],
        employeeId: user.employeeId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        role: user.role,
        staffRole: user.staffRole,
        branchId: user.branchId,
        department: user.department,
        position: user.position,
        employeeId: user.employeeId,
        permissions: user.permissions || []
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

