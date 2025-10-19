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
    const { newCheckOutDate, extensionReason, additionalCharges } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    if (!newCheckOutDate) {
      return NextResponse.json({ error: 'New check-out date is required' }, { status: 400 })
    }

    // Verify the booking exists and is in the correct status
    const booking = await queryOne(`
      SELECT 
        b.id,
        b.status,
        b."checkOutDate",
        b."totalPrice",
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

    // Check if booking is checked in
    if (booking.status !== 'CHECKED_IN') {
      return NextResponse.json({ 
        error: `Cannot extend booking with status: ${booking.status}` 
      }, { status: 400 })
    }

    // Check staff branch access (non-management staff can only extend bookings in their branch)
    const isManagement = booking.staffRole === 'MANAGEMENT'
    if (!isManagement && booking.branchId !== booking.staff_branch_id) {
      return NextResponse.json({ 
        error: 'You can only extend bookings in your assigned branch' 
      }, { status: 403 })
    }

    // Validate new check-out date
    const currentCheckOutDate = new Date(booking.checkOutDate).toISOString().split('T')[0]
    const newCheckOutDateOnly = new Date(newCheckOutDate).toISOString().split('T')[0]
    
    console.log('Extension validation:', {
      currentCheckOutDate,
      newCheckOutDateOnly,
      bookingCheckOutDate: booking.checkOutDate,
      newCheckOutDate
    })
    
    if (newCheckOutDateOnly <= currentCheckOutDate) {
      return NextResponse.json({ 
        error: `New check-out date must be after current check-out date. Current: ${currentCheckOutDate}, New: ${newCheckOutDateOnly}` 
      }, { status: 400 })
    }

    // Check if room is available for the extended period
    const roomAvailability = await queryOne(`
      SELECT COUNT(*)::int as conflicting_bookings
      FROM "Booking" b
      WHERE b."roomId" = $1
        AND b.id != $2
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND (
          (DATE(b."checkInDate") < $3 AND DATE(b."checkOutDate") > $3) OR
          (DATE(b."checkInDate") < $4 AND DATE(b."checkOutDate") >= $4) OR
          (DATE(b."checkInDate") >= $3 AND DATE(b."checkOutDate") <= $4)
        )
    `, [booking.roomId, id, booking.checkOutDate, newCheckOutDate])

    if (roomAvailability.conflicting_bookings > 0) {
      return NextResponse.json({ 
        error: 'Room is not available for the extended period. Please choose different dates or contact management.' 
      }, { status: 400 })
    }

    // Calculate additional charges if provided
    const additionalChargesAmount = additionalCharges || 0
    const newTotalPrice = parseFloat(booking.totalPrice) + additionalChargesAmount

    // Start transaction
    await execute('BEGIN')

    try {
      // Update booking with new check-out date and price
      await execute(`
        UPDATE "Booking" 
        SET 
          "checkOutDate" = $1,
          "totalPrice" = $2,
          "updatedAt" = NOW()
        WHERE id = $3
      `, [newCheckOutDate, newTotalPrice, id])

      // Note: Could add BookingLog entry here for audit trail
      // For now, we'll just update the booking

      // Commit transaction
      await execute('COMMIT')

      return NextResponse.json({
        success: true,
        message: `Successfully extended booking for ${booking.firstname} ${booking.lastname} until ${new Date(newCheckOutDate).toLocaleDateString()}`,
        booking: {
          id: booking.id,
          newCheckOutDate: newCheckOutDate,
          newTotalPrice: newTotalPrice,
          additionalCharges: additionalChargesAmount,
          roomNumber: booking.roomNumber
        }
      })

    } catch (error) {
      // Rollback transaction
      await execute('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Booking extension error:', error)
    return NextResponse.json({ 
      error: 'Failed to extend booking' 
    }, { status: 500 })
  }
}
