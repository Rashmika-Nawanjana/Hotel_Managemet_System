import { NextRequest, NextResponse } from 'next/server'
import { queryOne } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'STAFF') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
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

    // Get booking details with branch access check
    const booking = await queryOne(`
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
        u.dateofbirth,
        u.nationality,
        u.idtype,
        u.idnumber,
        u.address,
        u.city,
        u.postalcode,
        r."roomNumber",
        rt.name as room_type_name,
        rt."basePrice" as room_price,
        br.name as branch_name,
        br.address as branch_address,
        r."branchId"
      FROM "Booking" b
      JOIN users u ON b."userId" = u.id
      JOIN "Room" r ON b."roomId" = r.id
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.id = $1
    `, [id])

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check staff branch access (non-management staff can only view bookings in their branch)
    if (!isManagement && booking.branchId !== staffUser.branchId) {
      return NextResponse.json({ 
        error: 'You can only view bookings in your assigned branch' 
      }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      booking
    })

  } catch (error) {
    console.error('Staff booking detail API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
