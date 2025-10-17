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

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}
