import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'
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

    // Build branch filter based on staff role
    let branchFilter = ''
    let branchParams: any[] = []
    
    if (!isManagement && staffUser.branchId) {
      branchFilter = 'AND r."branchId" = $1'
      branchParams = [staffUser.branchId]
    }

    // Get all rooms with their current status and booking information
    const rooms = await query(`
      SELECT 
        r.id,
        r."roomNumber",
        r.floor,
        r.status,
        r."lastCleaned",
        r."lastMaintenance",
        r.notes,
        rt.id as roomtype_id,
        rt.name as roomtype_name,
        rt."basePrice",
        rt."maxOccupancy",
        rt."bedType",
        b.id as branch_id,
        b.name as branch_name,
        b.location as branch_location,
        -- Current booking information
        bk.id as current_booking_id,
        bk."bookingReference",
        bk."checkInDate",
        bk."checkOutDate",
        bk.status as booking_status,
        u.firstname as guest_firstname,
        u.lastname as guest_lastname
      FROM "Room" r
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" b ON r."branchId" = b.id
      LEFT JOIN "Booking" bk ON r.id = bk."roomId" 
        AND bk.status = 'CHECKED_IN'
        AND CURRENT_DATE BETWEEN DATE(bk."checkInDate") AND DATE(bk."checkOutDate")
      LEFT JOIN users u ON bk."userId" = u.id
      WHERE r.status != 'OUT_OF_SERVICE'
      ${branchFilter}
      ORDER BY r.floor ASC, r."roomNumber" ASC
    `, branchParams)

    // Transform the data
    const transformedRooms = rooms.map(room => ({
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      lastCleaned: room.lastCleaned,
      lastMaintenance: room.lastMaintenance,
      notes: room.notes,
      roomType: {
        id: room.roomtype_id,
        name: room.roomtype_name,
        basePrice: parseFloat(room.basePrice),
        maxOccupancy: room.maxOccupancy,
        bedType: room.bedType
      },
      branch: {
        id: room.branch_id,
        name: room.branch_name,
        location: room.branch_location
      },
      currentBooking: room.current_booking_id ? {
        id: room.current_booking_id,
        bookingReference: room.bookingReference,
        checkInDate: room.checkInDate,
        checkOutDate: room.checkOutDate,
        status: room.booking_status,
        guestName: `${room.guest_firstname} ${room.guest_lastname}`
      } : null
    }))

    return NextResponse.json({
      success: true,
      rooms: transformedRooms
    })

  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch rooms' 
    }, { status: 500 })
  }
}
