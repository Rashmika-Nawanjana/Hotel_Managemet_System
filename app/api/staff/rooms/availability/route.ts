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
    const roomId = searchParams.get('roomId')
    const checkInDate = searchParams.get('checkInDate')
    const checkOutDate = searchParams.get('checkOutDate')
    const excludeBookingId = searchParams.get('excludeBookingId')

    if (!roomId || !checkInDate || !checkOutDate) {
      return NextResponse.json({ 
        error: 'Missing required parameters: roomId, checkInDate, checkOutDate' 
      }, { status: 400 })
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

    // Check if room exists and get its details
    const room = await queryOne(`
      SELECT 
        r.id,
        r."roomNumber",
        r.status as room_status,
        r."branchId",
        rt.name as room_type_name,
        b.name as branch_name
      FROM "Room" r
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" b ON r."branchId" = b.id
      WHERE r.id = $1
    `, [roomId])

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check staff branch access (non-management staff can only check availability for rooms in their branch)
    if (!isManagement && room.branchId !== staffUser.branchId) {
      return NextResponse.json({ 
        error: 'You can only check availability for rooms in your assigned branch' 
      }, { status: 403 })
    }

    // Check for conflicting bookings
    let conflictQuery = `
      SELECT 
        b.id,
        b."bookingReference",
        b."checkInDate",
        b."checkOutDate",
        b.status,
        u.firstname,
        u.lastname
      FROM "Booking" b
      JOIN users u ON b."userId" = u.id
      WHERE b."roomId" = $1
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND (
          (DATE(b."checkInDate") <= $2 AND DATE(b."checkOutDate") > $2) OR
          (DATE(b."checkInDate") < $3 AND DATE(b."checkOutDate") >= $3) OR
          (DATE(b."checkInDate") >= $2 AND DATE(b."checkOutDate") <= $3)
        )
    `

    const conflictParams = [roomId, checkInDate, checkOutDate]
    
    if (excludeBookingId) {
      conflictQuery += ' AND b.id != $4'
      conflictParams.push(excludeBookingId)
    }

    const conflicts = await query(conflictQuery, conflictParams)

    // Check if room is available (not out of service)
    const isRoomAvailable = room.room_status !== 'OUT_OF_SERVICE'

    // Calculate availability status
    const isAvailable = isRoomAvailable && conflicts.length === 0
    const availabilityStatus = !isRoomAvailable ? 'OUT_OF_SERVICE' : 
                              conflicts.length > 0 ? 'CONFLICTS' : 'AVAILABLE'

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        roomType: room.room_type_name,
        branch: room.branch_name,
        status: room.room_status
      },
      availability: {
        isAvailable,
        status: availabilityStatus,
        checkInDate,
        checkOutDate,
        conflicts: conflicts.map(conflict => ({
          id: conflict.id,
          bookingReference: conflict.bookingReference,
          checkInDate: conflict.checkInDate,
          checkOutDate: conflict.checkOutDate,
          status: conflict.status,
          guestName: `${conflict.firstname} ${conflict.lastname}`
        }))
      }
    })

  } catch (error) {
    console.error('Room availability check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check room availability' 
    }, { status: 500 })
  }
}
