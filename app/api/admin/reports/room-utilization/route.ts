import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId') || 'all'

    // Build branch filter
    let branchFilter = ''
    let queryParams: any[] = []
    
    if (branchId !== 'all') {
      branchFilter = 'AND r."branchId" = $1'
      queryParams = [branchId]
    }

    // Get room utilization data
    const roomUtilization = await query(`
      SELECT 
        r.id,
        r."roomNumber",
        r.floor,
        r.status,
        r."lastCleaned",
        r."lastMaintenance",
        rt.name as room_type,
        rt."basePrice",
        b.name as branch_name,
        b.location as branch_location,
        CASE 
          WHEN r."lastCleaned" IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (NOW() - r."lastCleaned")) / 86400
          ELSE NULL 
        END as days_since_cleaned,
        CASE 
          WHEN r."lastMaintenance" IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (NOW() - r."lastMaintenance")) / 86400
          ELSE NULL 
        END as days_since_maintenance
      FROM "Room" r
      LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      LEFT JOIN "Branch" b ON r."branchId" = b.id
      WHERE 1=1 ${branchFilter}
      ORDER BY b.name, r.floor, r."roomNumber"
    `, queryParams)

    // Get room status summary
    const statusSummary = await query(`
      SELECT 
        r.status,
        COUNT(*) as count,
        b.name as branch_name
      FROM "Room" r
      LEFT JOIN "Branch" b ON r."branchId" = b.id
      WHERE 1=1 ${branchFilter}
      GROUP BY r.status, b.name
      ORDER BY b.name, r.status
    `, queryParams)

    // Get maintenance alerts (rooms that need cleaning or maintenance)
    const maintenanceAlerts = await query(`
      SELECT 
        r.id,
        r."roomNumber",
        r.floor,
        r.status,
        rt.name as room_type,
        b.name as branch_name,
        r."lastCleaned",
        r."lastMaintenance",
        CASE 
          WHEN r."lastCleaned" IS NULL OR r."lastCleaned" < NOW() - INTERVAL '3 days' THEN 'NEEDS_CLEANING'
          WHEN r."lastMaintenance" IS NULL OR r."lastMaintenance" < NOW() - INTERVAL '30 days' THEN 'NEEDS_MAINTENANCE'
          ELSE 'OK'
        END as alert_type
      FROM "Room" r
      LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      LEFT JOIN "Branch" b ON r."branchId" = b.id
      WHERE 1=1 ${branchFilter}
        AND (
          r."lastCleaned" IS NULL OR r."lastCleaned" < NOW() - INTERVAL '3 days'
          OR r."lastMaintenance" IS NULL OR r."lastMaintenance" < NOW() - INTERVAL '30 days'
        )
      ORDER BY b.name, r.floor, r."roomNumber"
    `, queryParams)

    // Get occupancy trends (last 30 days)
    const occupancyTrends = await query(`
      SELECT 
        DATE_TRUNC('day', b."checkInDate") as date,
        COUNT(DISTINCT r.id) as occupied_rooms,
        COUNT(DISTINCT CASE WHEN r.status = 'AVAILABLE' THEN r.id END) as available_rooms,
        COUNT(DISTINCT r.id) as total_rooms
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE b."checkInDate" >= NOW() - INTERVAL '30 days'
        AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        ${branchId !== 'all' ? 'AND br.id = $1' : ''}
      GROUP BY DATE_TRUNC('day', b."checkInDate")
      ORDER BY date DESC
    `, queryParams)

    const response = {
      success: true,
      data: {
        roomUtilization,
        statusSummary,
        maintenanceAlerts,
        occupancyTrends,
        branchId,
        generatedAt: new Date().toISOString()
      }
    }

    console.log('📊 Room utilization report generated:', {
      branchId,
      totalRooms: roomUtilization.length,
      maintenanceAlerts: maintenanceAlerts.length
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ Error generating room utilization report:', error)
    return NextResponse.json(
      { error: 'Failed to generate room utilization report' },
      { status: 500 }
    )
  }
}
