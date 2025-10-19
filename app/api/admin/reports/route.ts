import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db-queries'
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
    const period = searchParams.get('period') || 'month'
    const branchId = searchParams.get('branchId') || 'all'
    const reportType = searchParams.get('reportType') || 'overview'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let endDate = now

    if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1) // Start of current year
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1) // Start of current month
    }

    // Build branch filter
    let branchFilter = ''
    let queryParams: any[] = [startDate.toISOString(), endDate.toISOString()]
    
    if (branchId !== 'all') {
      branchFilter = 'AND br.id = $3'
      queryParams.push(branchId)
    }

    // Get total revenue
    const revenueResult = await queryOne(`
      SELECT 
        COALESCE(SUM(b."totalPrice"), 0) as total_revenue,
        COUNT(b.id) as total_bookings
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      LEFT JOIN "Branch" br ON rt."branchId" = br.id
      WHERE b."checkInDate" >= $1 
        AND b."checkInDate" <= $2
        AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        ${branchFilter}
    `, queryParams)

    // Get occupancy rate
    const occupancyResult = await queryOne(`
      WITH total_rooms AS (
        SELECT COUNT(*) as total
        FROM "Room" r
        LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
        LEFT JOIN "Branch" b ON rt."branchId" = b.id
        WHERE 1=1 ${branchId !== 'all' ? 'AND b.id = $3' : ''}
      ),
      occupied_rooms AS (
        SELECT COUNT(DISTINCT r.id) as occupied
        FROM "Room" r
        LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
        LEFT JOIN "Branch" b ON rt."branchId" = b.id
        INNER JOIN "Booking" bk ON r.id = bk."roomId"
        WHERE bk."checkInDate" <= $2 
          AND bk."checkOutDate" >= $1
          AND bk.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
          ${branchId !== 'all' ? 'AND b.id = $3' : ''}
      )
      SELECT 
        CASE 
          WHEN tr.total > 0 THEN ROUND((ocr.occupied::decimal / tr.total::decimal) * 100, 1)
          ELSE 0 
        END as occupancy_rate
      FROM total_rooms tr
      CROSS JOIN occupied_rooms ocr
    `, queryParams)

    // Get average rating (using staff ratings as fallback since Review table doesn't exist)
    const ratingResult = await queryOne(`
      SELECT 
        COALESCE(AVG(sp.rating), 0) as avg_rating,
        COUNT(sp.id) as total_reviews
      FROM "StaffProfile" sp
      LEFT JOIN "Branch" br ON sp."branchId" = br.id
      WHERE sp."createdAt" >= $1 
        AND sp."createdAt" <= $2
        AND sp.rating IS NOT NULL
        ${branchFilter}
    `, queryParams)

    // Get revenue trend data for charts
    const trendData = await query(`
      SELECT 
        DATE_TRUNC('${period === 'year' ? 'month' : 'day'}', b."checkInDate") as period,
        SUM(b."totalPrice") as revenue,
        COUNT(b.id) as bookings
      FROM "Booking" b
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      LEFT JOIN "Branch" br ON rt."branchId" = br.id
      WHERE b."checkInDate" >= $1 
        AND b."checkInDate" <= $2
        AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        ${branchFilter}
      GROUP BY DATE_TRUNC('${period === 'year' ? 'month' : 'day'}', b."checkInDate")
      ORDER BY period ASC
    `, queryParams)

    // Get branch data for filtering
    const branches = await query(`
      SELECT id, name, location
      FROM "Branch"
      ORDER BY name ASC
    `)

    // Get room type performance
    const roomTypePerformance = await query(`
      SELECT 
        rt.name as room_type,
        COUNT(b.id) as bookings,
        SUM(b."totalPrice") as revenue,
        AVG(b."totalPrice") as avg_booking_value
      FROM "RoomType" rt
      LEFT JOIN "Room" r ON rt.id = r."roomTypeId"
      LEFT JOIN "Booking" b ON r.id = b."roomId"
      LEFT JOIN "Branch" br ON rt."branchId" = br.id
      WHERE b."checkInDate" >= $1 
        AND b."checkInDate" <= $2
        AND b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT')
        ${branchFilter}
      GROUP BY rt.id, rt.name
      ORDER BY revenue DESC
      LIMIT 10
    `, queryParams)

    // Format trend data for charts
    const formattedTrendData = trendData.map((item: any) => ({
      name: period === 'year' 
        ? new Date(item.period).toLocaleDateString('en-US', { month: 'short' })
        : new Date(item.period).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: parseFloat(item.revenue || 0),
      bookings: parseInt(item.bookings || 0)
    }))

    // Calculate growth percentages (mock for now - would need previous period data)
    const stats = {
      totalRevenue: parseFloat(revenueResult?.total_revenue || 0),
      totalBookings: parseInt(revenueResult?.total_bookings || 0),
      occupancyRate: parseFloat(occupancyResult?.occupancy_rate || 0),
      avgRating: parseFloat(ratingResult?.avg_rating || 0),
      totalReviews: parseInt(ratingResult?.total_reviews || 0)
    }

    const response = {
      success: true,
      data: {
        stats,
        trendData: formattedTrendData,
        roomTypePerformance,
        branches,
        period,
        branchId,
        reportType
      }
    }

    console.log('📊 Reports data fetched:', {
      period,
      branchId,
      stats,
      trendDataPoints: formattedTrendData.length,
      branchesCount: branches.length,
      roomTypesCount: roomTypePerformance.length
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ Error fetching reports data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports data' },
      { status: 500 }
    )
  }
}
