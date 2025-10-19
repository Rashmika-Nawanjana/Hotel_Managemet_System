import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'STAFF') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get pagination parameters
    const url = request.nextUrl
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10'))
    const offset = (page - 1) * limit
    const status = url.searchParams.get('status') || 'all' // 'all', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'
    const search = url.searchParams.get('search') || ''

    // Get staff user info to determine branch access
    const staffUser = await queryOne(`
      SELECT sp."branchId", sp."staffRole"
      FROM "StaffProfile" sp
      WHERE sp."userId" = $1
    `, [decoded.userId])

    if (!staffUser) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    const isManagement = staffUser.staffRole === 'MANAGEMENT'

    // Build branch filter
    let branchFilter = ''
    let branchParams: any[] = []
    
    if (!isManagement && staffUser.branchId) {
      branchFilter = 'AND r."branchId" = $1'
      branchParams = [staffUser.branchId]
    }

    // Build status filter
    let statusFilter = ''
    if (status !== 'all') {
      statusFilter = `AND b.status = $${branchParams.length + 1}`
      branchParams.push(status)
    }

    // Build search filter
    let searchFilter = ''
    if (search) {
      searchFilter = `AND (
        b."bookingReference" ILIKE $${branchParams.length + 1} OR
        u.firstname ILIKE $${branchParams.length + 1} OR
        u.lastname ILIKE $${branchParams.length + 1} OR
        u.email ILIKE $${branchParams.length + 1} OR
        r."roomNumber" ILIKE $${branchParams.length + 1}
      )`
      branchParams.push(`%${search}%`)
    }

    // Get total count for pagination
    const totalCountResult = await queryOne(`
      SELECT COUNT(*)::int as total
      FROM "Booking" b
      JOIN users u ON b."userId" = u.id
      JOIN "Room" r ON b."roomId" = r.id
      WHERE 1=1
        ${branchFilter}
        ${statusFilter}
        ${searchFilter}
    `, branchParams)

    const totalCount = totalCountResult.total
    const totalPages = Math.ceil(totalCount / limit)

    // Get bookings with pagination
    const bookings = await query(`
      SELECT 
        b.id,
        b."bookingReference",
        b."checkInDate",
        b."checkOutDate",
        b."numberOfGuests",
        b."totalPrice",
        b.status,
        b."paymentStatus",
        b."specialRequests",
        b."createdAt",
        b."updatedAt",
        u.firstname,
        u.lastname,
        u.email,
        u.phone,
        r."roomNumber",
        rt.name as room_type_name,
        rt."basePrice" as room_price,
        br.name as branch_name,
        br.address as branch_address
      FROM "Booking" b
      JOIN users u ON b."userId" = u.id
      JOIN "Room" r ON b."roomId" = r.id
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" br ON r."branchId" = br.id
      WHERE 1=1
        ${branchFilter}
        ${statusFilter}
        ${searchFilter}
      ORDER BY b."createdAt" DESC
      LIMIT $${branchParams.length + 1} OFFSET $${branchParams.length + 2}
    `, [...branchParams, limit, offset])

    // Get booking statistics
    const stats = await queryOne(`
      SELECT 
        COUNT(CASE WHEN b.status = 'PENDING' THEN 1 END)::int as pending_bookings,
        COUNT(CASE WHEN b.status = 'CONFIRMED' THEN 1 END)::int as confirmed_bookings,
        COUNT(CASE WHEN b.status = 'CHECKED_IN' THEN 1 END)::int as checked_in_bookings,
        COUNT(CASE WHEN b.status = 'CHECKED_OUT' THEN 1 END)::int as checked_out_bookings,
        COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END)::int as cancelled_bookings,
        COUNT(*)::int as total_bookings
      FROM "Booking" b
      JOIN "Room" r ON b."roomId" = r.id
      WHERE 1=1
        ${branchFilter}
    `, branchParams)

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats,
      filters: {
        status,
        search
      }
    })

  } catch (error) {
    console.error('Staff bookings API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
