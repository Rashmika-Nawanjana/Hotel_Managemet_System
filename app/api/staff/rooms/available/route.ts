import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db-queries'
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
    const checkInDate = searchParams.get('checkInDate')
    const checkOutDate = searchParams.get('checkOutDate')
    const roomTypeId = searchParams.get('roomTypeId')

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({ 
        error: 'Missing required parameters: checkInDate, checkOutDate' 
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

    // Build branch filter
    let branchFilter = ''
    let branchParams: any[] = []
    
    if (!isManagement && staffUser.branchId) {
      branchFilter = 'AND r."branchId" = $1'
      branchParams = [staffUser.branchId]
    }

    // Build room type filter
    let roomTypeFilter = ''
    
    if (roomTypeId) {
      roomTypeFilter = 'AND r."roomTypeId" = $' + (branchParams.length + 1)
    }

    // Combine all parameters
    const allParams = [...branchParams]
    if (roomTypeId) {
      allParams.push(roomTypeId)
    }
    allParams.push(checkInDate, checkOutDate)

    console.log('Available rooms query params:', {
      branchParams,
      roomTypeId,
      checkInDate,
      checkOutDate,
      allParams,
      branchFilter,
      roomTypeFilter
    })

    // Get available rooms for the date range
    const rooms = await query(`
      SELECT 
        r.id,
        r."roomNumber",
        r.status,
        r."branchId",
        rt.id as room_type_id,
        rt.name as room_type_name,
        rt.description,
        rt."basePrice" as price_per_night,
        rt."maxOccupancy" as max_guests,
        b.name as branch_name,
        b.address as branch_address
      FROM "Room" r
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" b ON r."branchId" = b.id
      WHERE r.status = 'AVAILABLE'
        AND r."branchId" IS NOT NULL
        ${branchFilter}
        ${roomTypeFilter}
        AND NOT EXISTS (
          SELECT 1 FROM "Booking" b
          WHERE b."roomId" = r.id
            AND b.status IN ('CONFIRMED', 'CHECKED_IN')
            AND (
              (DATE(b."checkInDate") <= $${allParams.length - 1} AND DATE(b."checkOutDate") > $${allParams.length - 1}) OR
              (DATE(b."checkInDate") < $${allParams.length} AND DATE(b."checkOutDate") >= $${allParams.length}) OR
              (DATE(b."checkInDate") >= $${allParams.length - 1} AND DATE(b."checkOutDate") <= $${allParams.length})
            )
        )
      ORDER BY rt."basePrice" ASC, r."roomNumber" ASC
    `, allParams)

    // Get room types for filtering
    const roomTypes = await query(`
      SELECT DISTINCT
        rt.id,
        rt.name,
        rt.description,
        rt."basePrice" as price_per_night,
        rt."maxOccupancy" as max_guests
      FROM "RoomType" rt
      JOIN "Room" r ON rt.id = r."roomTypeId"
      WHERE r.status = 'AVAILABLE'
        ${branchFilter}
      ORDER BY rt."basePrice" ASC
    `, branchParams)

    return NextResponse.json({
      success: true,
      rooms,
      roomTypes,
      filters: {
        checkInDate,
        checkOutDate,
        roomTypeId: roomTypeId || null
      }
    })

  } catch (error) {
    console.error('Available rooms API error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
