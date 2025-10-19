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
    const { staffId, confirmationNotes } = await request.json()

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
        u.email,
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

    // Check if booking is in correct status for confirmation
    if (booking.status !== 'PENDING') {
      return NextResponse.json({ 
        error: `Cannot confirm booking with status: ${booking.status}` 
      }, { status: 400 })
    }

    // Check staff branch access (non-management staff can only confirm bookings in their branch)
    const isManagement = booking.staffRole === 'MANAGEMENT'
    if (!isManagement && booking.branchId !== booking.staff_branch_id) {
      return NextResponse.json({ 
        error: 'You can only confirm bookings in your assigned branch' 
      }, { status: 403 })
    }

    // Start transaction
    await execute('BEGIN')

    try {
      // Update booking status to CONFIRMED
      await execute(`
        UPDATE "Booking" 
        SET 
          status = 'CONFIRMED', 
          "paymentStatus" = 'PAID',
          "updatedAt" = NOW()
        WHERE id = $1
      `, [id])

      // Note: BookingLog table could be added later for audit trail
      // For now, we'll just update the booking status

      // Commit transaction
      await execute('COMMIT')

      return NextResponse.json({
        success: true,
        message: `Successfully confirmed booking for ${booking.firstname} ${booking.lastname}`,
        booking: {
          id: booking.id,
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          roomNumber: booking.roomNumber,
          guestEmail: booking.email
        }
      })

    } catch (error) {
      // Rollback transaction
      await execute('ROLLBACK')
      throw error
    }

  } catch (error) {
    console.error('Booking confirmation error:', error)
    return NextResponse.json({ 
      error: 'Failed to confirm booking' 
    }, { status: 500 })
  }
}
