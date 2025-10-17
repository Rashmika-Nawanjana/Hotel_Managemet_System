import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'

export async function GET(request: NextRequest) {
  try {
    const branches = await query(
      `SELECT id, name, slug, location, address, phone, email, status
       FROM "Branch"
       WHERE status = 'operational'
       ORDER BY name ASC`
    )

    return NextResponse.json(
      {
        success: true,
        count: branches.length,
        data: branches,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    )
  }
}