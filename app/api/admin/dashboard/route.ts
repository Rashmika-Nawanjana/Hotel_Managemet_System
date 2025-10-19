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
      branchFilter = 'AND br.id = $1'
      queryParams = [branchId]
    } else {
      branchFilter = ''
    }

    // Get overall statistics
    const overallStats = await query(`
      SELECT 
        COALESCE(SUM(b."totalPrice"), 0) as total_revenue,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status IN ('CONFIRMED', 'CHECKED_IN') THEN b.id END) as active_bookings
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE 1=1 ${branchFilter}
    `, queryParams)

    // Get staff and guest counts separately to avoid JOIN issues
    const userStats = await query(`
      SELECT 
        COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'STAFF' AND u.status = 'ACTIVE') as active_staff,
        COUNT(DISTINCT u.id) FILTER (WHERE u.role = 'GUEST' AND u.status = 'ACTIVE') as total_guests
      FROM users u
    `, [])

    // Get room statistics separately
    const roomStats = await query(`
      SELECT 
        COUNT(*) as total_rooms,
        COUNT(CASE WHEN r.status = 'OCCUPIED' THEN 1 END) as occupied_rooms
      FROM "Room" r
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE 1=1 ${branchId !== 'all' ? 'AND br.id = $1' : ''}
    `, queryParams)

    // Get branch statistics
    const branchStats = await query(`
      SELECT 
        b.id,
        b.name,
        b.location,
        COUNT(DISTINCT r.id) as total_rooms,
        COUNT(DISTINCT CASE WHEN r.status = 'OCCUPIED' THEN r.id END) as occupied_rooms,
        COUNT(DISTINCT bk.id) as total_bookings,
        COALESCE(SUM(bk."totalPrice"), 0) as revenue
      FROM "Branch" b
      LEFT JOIN "Room" r ON b.id = r."branchId"
      LEFT JOIN "Booking" bk ON r.id = bk."roomId"
      WHERE b.status = 'operational'
        ${branchId !== 'all' ? 'AND b.id = $1' : ''}
      GROUP BY b.id, b.name, b.location
      ORDER BY revenue DESC
    `, queryParams)

    // Get recent activities (bookings, staff activities, etc.)
    const recentActivities = await query(`
      SELECT 
        'booking' as type,
        'New booking - ' || b."bookingReference" as description,
        b."createdAt" as timestamp,
        br.name as branch_name
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE b."createdAt" >= NOW() - INTERVAL '24 hours'
        ${branchFilter}
      
      UNION ALL
      
      SELECT 
        'staff' as type,
        'Staff login - ' || sp."employeeId" as description,
        sp."lastLoginAt" as timestamp,
        br.name as branch_name
      FROM "StaffProfile" sp
      LEFT JOIN "Branch" br ON sp."branchId" = br.id
      WHERE sp."lastLoginAt" >= NOW() - INTERVAL '24 hours'
        ${branchId !== 'all' ? 'AND br.id = $1' : ''}
      
      ORDER BY timestamp DESC
      LIMIT 10
    `, queryParams)

    // Get pending approvals (refunds, leave requests, etc.)
    const pendingApprovals = await query(`
      SELECT 
        'refund' as type,
        'refund_' || b.id as id,
        'Refund request for ' || b."bookingReference" as description,
        br.name as branch_name,
        b."createdAt" as timestamp
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.status = 'CANCELLED' 
        AND b."paymentStatus" = 'REFUNDED'
        ${branchFilter}
      
      UNION ALL
      
      SELECT 
        'maintenance' as type,
        'maintenance_' || r.id as id,
        'Maintenance request for Room ' || r."roomNumber" as description,
        br.name as branch_name,
        COALESCE(r."lastMaintenance", '1970-01-01'::timestamp) as timestamp
      FROM "Room" r
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE r."lastMaintenance" < NOW() - INTERVAL '30 days'
        OR r."lastMaintenance" IS NULL
        ${branchFilter}
      
      UNION ALL
      
      SELECT 
        'booking' as type,
        'booking_' || b.id as id,
        'New booking pending approval - ' || b."bookingReference" as description,
        br.name as branch_name,
        b."createdAt" as timestamp
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.status = 'PENDING'
        ${branchFilter}
      
      ORDER BY timestamp DESC
      LIMIT 5
    `, queryParams)

    // Get user info
    const userInfo = await query(`
      SELECT firstname, lastname, email
      FROM users
      WHERE id = $1
    `, [decoded.userId])

    const stats = overallStats[0] || {}
    const rooms = roomStats[0] || {}
    const users = userStats[0] || {}
    const occupancyRate = rooms.total_rooms > 0 
      ? Math.round((rooms.occupied_rooms / rooms.total_rooms) * 100)
      : 0

    const response = {
      success: true,
      data: {
        userInfo: userInfo[0] || { firstname: 'Admin', lastname: 'User' },
        overallStats: {
          totalRevenue: parseFloat(stats.total_revenue) || 0,
          totalBookings: parseInt(stats.total_bookings) || 0,
          occupancyRate: occupancyRate,
          activeStaff: parseInt(users.active_staff) || 0,
          totalGuests: parseInt(users.total_guests) || 0
        },
        branchStats: branchStats.map(branch => ({
          id: branch.id,
          name: branch.name,
          location: branch.location,
          occupancy: branch.total_rooms > 0 
            ? Math.round((branch.occupied_rooms / branch.total_rooms) * 100)
            : 0,
          totalBookings: parseInt(branch.total_bookings) || 0,
          revenue: parseFloat(branch.revenue) || 0
        })),
        recentActivities: recentActivities.map(activity => ({
          id: activity.type + '_' + activity.timestamp,
          type: activity.type,
          description: activity.description,
          branch: activity.branch_name,
          time: new Date(activity.timestamp).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        })),
        pendingApprovals: pendingApprovals.map(approval => ({
          id: approval.id,
          type: approval.type,
          description: approval.description,
          branch: approval.branch_name,
          timestamp: approval.timestamp
        }))
      }
    }

    // Debug: Check what pending approvals exist
    const debugApprovals = await query(`
      SELECT 
        'refund_debug' as type,
        COUNT(*) as count
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.status = 'CANCELLED' AND b."paymentStatus" = 'REFUNDED'
        ${branchFilter}
      
      UNION ALL
      
      SELECT 
        'maintenance_debug' as type,
        COUNT(*) as count
      FROM "Room" r
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE (r."lastMaintenance" < NOW() - INTERVAL '30 days' OR r."lastMaintenance" IS NULL)
        ${branchFilter}
      
      UNION ALL
      
      SELECT 
        'pending_bookings_debug' as type,
        COUNT(*) as count
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.status = 'PENDING'
        ${branchFilter}
    `, queryParams)

    console.log('📊 Admin dashboard data generated:', {
      branchId,
      totalRevenue: stats.total_revenue,
      totalBookings: stats.total_bookings,
      occupancyRate: occupancyRate,
      branches: branchStats.length,
      pendingApprovalsCount: pendingApprovals.length,
      debugApprovals: debugApprovals
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ Error generating admin dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to generate dashboard data' },
      { status: 500 }
    )
  }
}
