import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query, execute } from '@/lib/db-queries'
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
    const section = url.searchParams.get('section') || 'all' // 'all', 'pending', 'checked_in'

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

    // Build branch filter based on staff role
    let branchFilter = ''
    let branchParams: any[] = []
    
    if (!isManagement && staffUser.branchId) {
      branchFilter = 'AND r."branchId" = $1'
      branchParams = [staffUser.branchId]
    }

    // Build status filter based on section
    let statusFilter = ''
    
    if (section === 'pending') {
      // 'pending' - show confirmed bookings ready for check-in (upcoming check-outs)
      statusFilter = 'AND b.status = \'CONFIRMED\''
    } else if (section === 'checked_in') {
      // 'checked_in' - show bookings that are checked in (ready for check-out)
      statusFilter = 'AND b.status = \'CHECKED_IN\''
    } else {
      // 'all' - show all confirmed and checked-in bookings
      statusFilter = 'AND b.status IN (\'CONFIRMED\', \'CHECKED_IN\')'
    }

    // Get total count for pagination
    const totalCount = await queryOne(`
      SELECT COUNT(*)::int as count
      FROM "Booking" b
      JOIN users u ON b."userId" = u.id
      JOIN "Room" r ON b."roomId" = r.id
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
        ${branchFilter}
        ${statusFilter}
    `, [...branchParams])

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
        u.id as user_id,
        u.firstname as user_firstname,
        u.lastname as user_lastname,
        u.email as user_email,
        u.phone as user_phone,
        r.id as room_id,
        r."roomNumber",
        r.floor,
        r.status as room_status,
        rt.id as roomtype_id,
        rt.name as roomtype_name,
        rt.slug as roomtype_slug,
        rt."basePrice" as roomtype_baseprice,
        rt."maxOccupancy" as roomtype_maxoccupancy,
        rt."bedType" as roomtype_bedtype,
        br.id as branch_id,
        br.name as branch_name,
        br.location as branch_location,
        -- Add overdue indicators
        CASE 
          WHEN DATE(b."checkOutDate") < $${branchParams.length + 1} THEN true
          ELSE false
        END as is_overdue_checkout,
        CASE 
          WHEN DATE(b."checkOutDate") = $${branchParams.length + 1} THEN true
          ELSE false
        END as is_due_today
      FROM "Booking" b
      JOIN users u ON b."userId" = u.id
      JOIN "Room" r ON b."roomId" = r.id
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.status IN ('CONFIRMED', 'CHECKED_IN')
        ${branchFilter}
        ${statusFilter}
      ORDER BY 
        CASE WHEN DATE(b."checkOutDate") < $${branchParams.length + 1} THEN 0 ELSE 1 END,
        b."checkOutDate" ASC
      LIMIT $${branchParams.length + 2} OFFSET $${branchParams.length + 3}
    `, [...branchParams, today, limit, offset])

    // Transform the data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingReference: booking.bookingReference,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      numberOfGuests: booking.numberOfGuests,
      totalPrice: parseFloat(booking.totalPrice),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      specialRequests: booking.specialRequests,
      createdAt: booking.createdAt,
      isOverdueCheckout: booking.is_overdue_checkout,
      isDueToday: booking.is_due_today,
      user: {
        id: booking.user_id,
        firstName: booking.user_firstname,
        lastName: booking.user_lastname,
        email: booking.user_email,
        phone: booking.user_phone
      },
      room: {
        id: booking.room_id,
        roomNumber: booking.roomNumber,
        floor: booking.floor,
        status: booking.room_status,
        roomType: {
          id: booking.roomtype_id,
          name: booking.roomtype_name,
          slug: booking.roomtype_slug,
          basePrice: parseFloat(booking.roomtype_baseprice),
          maxOccupancy: booking.roomtype_maxoccupancy,
          bedType: booking.roomtype_bedtype
        },
        branch: {
          id: booking.branch_id,
          name: booking.branch_name,
          location: booking.branch_location
        }
      }
    }))

    return NextResponse.json({
      success: true,
      bookings: transformedBookings,
      pagination: {
        page,
        limit,
        total: totalCount.count,
        totalPages: Math.ceil(totalCount.count / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching check-out bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch check-out bookings' }, { status: 500 })
  }
}

