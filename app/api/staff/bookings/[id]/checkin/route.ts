import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

export async function POST(
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
    const { staffId, checkInTime } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Verify the booking exists and is in the correct status
    const booking = await queryOne(`
      SELECT 
        b.id,
        b.status,
        b."paymentStatus",
        b."roomId",
        b."userId",
        u.firstname,
        u.lastname,
        r."roomNumber",
        r."branchId",
        sp."branchId" as staff_branch_id,
        sp."staffRole"
      FROM "Booking" b
      JOIN users u ON b."userId" = u.id
      JOIN "Room" r ON b."roomId" = r.id
      JOIN "StaffProfile" sp ON sp."userId" = $1
      WHERE b.id = $2
    `, [decoded.userId, id])

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if booking is in correct status for check-in
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json({ 
        error: `Cannot check in booking with status: ${booking.status}` 
      }, { status: 400 })
    }

    if (booking.paymentStatus !== 'PAID') {
      return NextResponse.json({ 
        error: 'Cannot check in unpaid booking' 
      }, { status: 400 })
    }

    // Check if room is available for the booking period
    const roomAvailability = await queryOne(`
      SELECT COUNT(*)::int as conflicting_bookings
      FROM "Booking" b
      WHERE b."roomId" = $1
        AND b.id != $2
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND (
          (DATE(b."checkInDate") <= $3 AND DATE(b."checkOutDate") > $3) OR
          (DATE(b."checkInDate") < $4 AND DATE(b."checkOutDate") >= $4) OR
          (DATE(b."checkInDate") >= $3 AND DATE(b."checkOutDate") <= $4)
        )
    `, [booking.roomId, id, booking.checkInDate, booking.checkOutDate])

    if (roomAvailability.conflicting_bookings > 0) {
      return NextResponse.json({ 
        error: 'Room is not available for the entire booking period. Please check room availability.' 
      }, { status: 400 })
    }

    // Check staff branch access (non-management staff can only check-in guests in their branch)
    const isManagement = booking.staffRole === 'MANAGEMENT'
    if (!isManagement && booking.branchId !== booking.staff_branch_id) {
      return NextResponse.json({ 
        error: 'You can only check-in guests in your assigned branch' 
      }, { status: 403 })
    }

    // Start transaction
    await execute('BEGIN')

    try {
      // Update booking status to CHECKED_IN
      await execute(`
        UPDATE "Booking" 
        SET status = 'CHECKED_IN', "updatedAt" = NOW()
        WHERE id = $1
      `, [id])

      // Update room status to OCCUPIED
      await execute(`
        UPDATE "Room" 
        SET status = 'OCCUPIED', "updatedAt" = NOW()
        WHERE id = $1
      `, [booking.roomId])

      // Commit transaction
      await execute('COMMIT')

      return NextResponse.json({
        success: true,
        message: `Successfully checked in ${booking.firstname} ${booking.lastname} to Room ${booking.roomNumber}`,
        booking: {
          id: booking.id,
          status: 'CHECKED_IN',
          roomNumber: booking.roomNumber
        }
      })

    } catch (error) {
      // Rollback transaction
      await execute('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json({ 
      error: 'Failed to check in guest' 
    }, { status: 500 })
  }
}

