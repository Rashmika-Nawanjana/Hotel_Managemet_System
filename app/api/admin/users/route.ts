import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'STAFF'))
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url = request.nextUrl
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10'))
    const offset = (page - 1) * limit

    const totalRes = await query('SELECT COUNT(*)::int AS count FROM users')
    const total = totalRes[0]?.count || 0

    const users = await query(
      `SELECT id, email, role, status, firstname AS "firstName", lastname AS "lastName", phone, createdat AS "createdAt", lastloginat AS "lastLoginAt"
       FROM users
       ORDER BY createdat DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    return NextResponse.json({ success: true, total, page, limit, users }, { status: 200 })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

import { execute } from '@/lib/db-queries'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // auth
    const token = request.cookies.get('auth-token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      status,
      dateOfBirth,
      nationality,
      phone,
      idType,
      idNumber,
      address,
      city,
      postalCode,
      twoFactorEnabled,
      twoFactorSecret,
      emailVerified,
    } = body

    // validate required
    if (!firstName || !lastName || !email || !password || !role || !status || !dateOfBirth || !nationality) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // check email uniqueness
    const existing = await query(`SELECT id FROM users WHERE email = $1`, [email])
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await execute(
      `INSERT INTO users (id, email, password, role, status, emailverified, firstname, lastname, phone, dateofbirth, nationality, idtype, idnumber, address, city, postalcode, twofactorenabled, twofactorsecret, createdat, updatedat)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
      [
        email,
        hashed,
        role,
        status,
        emailVerified ? true : false,
        firstName,
        lastName,
        phone || '',
        dateOfBirth,
        nationality,
        idType || 'NATIONAL_ID',
        idNumber || '',
        address || '',
        city || '',
        postalCode || '',
        twoFactorEnabled ? true : false,
        twoFactorSecret || null,
      ]
    )

    return NextResponse.json({ success: true, message: 'User created' }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
