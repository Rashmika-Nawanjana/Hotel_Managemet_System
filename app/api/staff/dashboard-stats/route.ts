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
    const today = new Date().toISOString().split('T')[0]

    // Base stats query - always include branch filtering for non-management
    let branchFilter = ''
    let branchParams: any[] = []
    
    if (!isManagement && staffUser.branchId) {
      branchFilter = 'AND r."branchId" = $1'
      branchParams = [staffUser.branchId]
    }

    // Get today's check-ins
    const checkInsResult = await queryOne(`
      SELECT COUNT(*)::int as count
      FROM "Booking" b
      JOIN "Room" r ON b."roomId" = r.id
      WHERE DATE(b."checkInDate") = $${branchParams.length + 1}
      ${branchFilter}
    `, [...branchParams, today])

    // Get today's check-outs
    const checkOutsResult = await queryOne(`
      SELECT COUNT(*)::int as count
      FROM "Booking" b
      JOIN "Room" r ON b."roomId" = r.id
      WHERE DATE(b."checkOutDate") = $${branchParams.length + 1}
      ${branchFilter}
    `, [...branchParams, today])

    // Get essential metrics for staff
    const essentialStats = await queryOne(`
      SELECT 
        -- Available rooms right now
        COUNT(CASE WHEN r.status = 'AVAILABLE' THEN 1 END)::int as available_rooms,
        -- Occupied rooms (these have checked-in guests)
        COUNT(CASE WHEN r.status = 'OCCUPIED' THEN 1 END)::int as checked_in_guests,
        -- Total rooms
        COUNT(r.id)::int as total_rooms
      FROM "Room" r
      WHERE r.status != 'OUT_OF_SERVICE'
      ${branchFilter}
    `, branchParams)

    // Debug query to see room statuses
    const debugRooms = await query(`
      SELECT 
        r."roomNumber",
        r.status as room_status,
        b.status as booking_status,
        b."checkInDate",
        b."checkOutDate",
        u.firstname,
        u.lastname
      FROM "Room" r
      LEFT JOIN "Booking" b ON r.id = b."roomId" 
        AND b.status = 'CHECKED_IN'
        AND CURRENT_DATE BETWEEN DATE(b."checkInDate") AND DATE(b."checkOutDate")
      LEFT JOIN users u ON b."userId" = u.id
      WHERE r.status != 'OUT_OF_SERVICE'
      ${branchFilter}
      ORDER BY r."roomNumber"
    `, branchParams)

    console.log('Debug room statuses:', debugRooms)

    // Get pending service requests (mock for now)
    const pendingRequests = 0 // TODO: Implement service requests table

    // Management-specific stats
    let totalRevenue = 0
    let averageOccupancy = 0

    if (isManagement) {
      // Get total revenue for today
      const revenueResult = await queryOne(`
        SELECT COALESCE(SUM(b."totalPrice"), 0) as revenue
        FROM "Booking" b
        JOIN "Room" r ON b."roomId" = r.id
        WHERE DATE(b."createdAt") = $1
        ${branchFilter}
      `, [...branchParams, today])

      totalRevenue = parseFloat(revenueResult?.revenue || '0')

      // Get average occupancy for the month
      const avgOccupancyResult = await queryOne(`
        SELECT 
          AVG(
            CASE 
              WHEN b.status IN ('CONFIRMED', 'CHECKED_IN') 
              THEN 1.0 
              ELSE 0.0 
            END
          ) * 100 as avg_occupancy
        FROM "Booking" b
        JOIN "Room" r ON b."roomId" = r.id
        WHERE DATE_TRUNC('month', b."createdAt") = DATE_TRUNC('month', CURRENT_DATE)
        ${branchFilter}
      `, branchParams)

      averageOccupancy = Math.round(parseFloat(avgOccupancyResult?.avg_occupancy || '0'))
    }

    const stats = {
      // Essential metrics for staff
      availableRooms: essentialStats?.available_rooms || 0,
      checkedInGuests: essentialStats?.checked_in_guests || 0,
      totalRooms: essentialStats?.total_rooms || 0,
      
      // Daily activity (still useful for staff)
      checkInsToday: checkInsResult?.count || 0,
      checkOutsToday: checkOutsResult?.count || 0,
      
      // Management-specific stats
      ...(isManagement && {
        totalRevenue,
        averageOccupancy
      })
    }

    console.log('Dashboard stats calculated:', {
      essentialStats,
      checkInsResult,
      checkOutsResult,
      stats,
      branchFilter,
      branchParams
    })

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}

