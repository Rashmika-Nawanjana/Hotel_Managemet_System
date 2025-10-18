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

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const branchId = searchParams.get('branchId')

    if (!role || !branchId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const isManagement = role === 'MANAGEMENT'
    const today = new Date().toISOString().split('T')[0]

    // Base stats query - always include branch filtering for non-management
    let branchFilter = ''
    let branchParams: any[] = []
    
    if (!isManagement) {
      branchFilter = 'AND r."branchId" = $1'
      branchParams = [branchId]
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

    // Get current occupancy
    const occupancyResult = await queryOne(`
      SELECT 
        COUNT(CASE WHEN b.status IN ('CONFIRMED', 'CHECKED_IN') THEN 1 END)::int as occupied,
        COUNT(r.id)::int as total_rooms
      FROM "Room" r
      LEFT JOIN "Booking" b ON r.id = b."roomId" 
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND CURRENT_DATE BETWEEN DATE(b."checkInDate") AND DATE(b."checkOutDate")
      WHERE r.status != 'OUT_OF_SERVICE'
      ${branchFilter}
    `, branchParams)

    // Get room status counts
    const roomStatusResult = await queryOne(`
      SELECT 
        COUNT(CASE WHEN r.status = 'AVAILABLE' THEN 1 END)::int as ready,
        COUNT(CASE WHEN r.status = 'CLEANING' THEN 1 END)::int as cleaning,
        COUNT(CASE WHEN r.status = 'OCCUPIED' THEN 1 END)::int as occupied
      FROM "Room" r
      WHERE r.status != 'OUT_OF_SERVICE'
      ${branchFilter}
    `, branchParams)

    // Get active guests count
    const activeGuestsResult = await queryOne(`
      SELECT COUNT(DISTINCT b."userId")::int as count
      FROM "Booking" b
      JOIN "Room" r ON b."roomId" = r.id
      WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND CURRENT_DATE BETWEEN DATE(b."checkInDate") AND DATE(b."checkOutDate")
      ${branchFilter}
    `, branchParams)

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
      checkInsToday: checkInsResult?.count || 0,
      checkOutsToday: checkOutsResult?.count || 0,
      currentOccupancy: occupancyResult?.occupied || 0,
      totalRooms: occupancyResult?.total_rooms || 0,
      pendingRequests,
      activeGuests: activeGuestsResult?.count || 0,
      roomsReady: roomStatusResult?.ready || 0,
      roomsCleaning: roomStatusResult?.cleaning || 0,
      ...(isManagement && {
        totalRevenue,
        averageOccupancy
      })
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}

