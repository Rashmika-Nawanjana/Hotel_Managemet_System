import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query, execute } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'STAFF') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const {
      // Guest information
      firstname,
      lastname,
      email,
      phone,
      dateOfBirth,
      nationality,
      idType,
      idNumber,
      address,
      city,
      postalCode,
      // Booking information
      roomId,
      checkInDate,
      checkOutDate,
      guests,
      specialRequests,
      // Payment information
      totalPrice,
      paymentMethod = 'CASH' // Default to cash for walk-in bookings
    } = await request.json()

    // Validate required fields
    if (!firstname || !lastname || !email || !phone || !dateOfBirth || !nationality || !idType || !idNumber || !address || !city || !postalCode || !roomId || !checkInDate || !checkOutDate || !guests || !totalPrice) {
      return NextResponse.json({ 
        error: 'Missing required fields: firstname, lastname, email, phone, dateOfBirth, nationality, idType, idNumber, address, city, postalCode, roomId, checkInDate, checkOutDate, guests, totalPrice' 
      }, { status: 400 })
    }

    // Get staff user info to determine branch access
    const staffUser = await queryOne(`
      SELECT sp."branchId", sp."staffRole", sp."userId" as staff_id
      FROM "StaffProfile" sp
      WHERE sp."userId" = $1
    `, [decoded.userId])

    if (!staffUser) {
      return NextResponse.json({ error: 'Staff profile not found' }, { status: 404 })
    }

    const isManagement = staffUser.staffRole === 'MANAGEMENT'

    // Get room details and verify branch access
    const room = await queryOne(`
      SELECT 
        r.id,
        r."roomNumber",
        r.status,
        r."branchId",
        rt.name as room_type_name,
        rt."basePrice" as price_per_night,
        b.name as branch_name
      FROM "Room" r
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" b ON r."branchId" = b.id
      WHERE r.id = $1
    `, [roomId])

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check staff branch access (non-management staff can only book rooms in their branch)
    if (!isManagement && room.branchId !== staffUser.branchId) {
      return NextResponse.json({ 
        error: 'You can only book rooms in your assigned branch' 
      }, { status: 403 })
    }

    // Check if room is available
    if (room.status !== 'AVAILABLE') {
      return NextResponse.json({ 
        error: `Room ${room.roomNumber} is not available. Current status: ${room.status}` 
      }, { status: 400 })
    }

    // Check if room is available for the booking period
    const availabilityCheck = await queryOne(`
      SELECT COUNT(*)::int as conflict_count
      FROM "Booking" b
      WHERE b."roomId" = $1
        AND b.status IN ('CONFIRMED', 'CHECKED_IN')
        AND (
          (DATE(b."checkInDate") <= $2 AND DATE(b."checkOutDate") > $2) OR
          (DATE(b."checkInDate") < $3 AND DATE(b."checkOutDate") >= $3) OR
          (DATE(b."checkInDate") >= $2 AND DATE(b."checkOutDate") <= $3)
        )
    `, [roomId, checkInDate, checkOutDate])

    if (availabilityCheck.conflict_count > 0) {
      return NextResponse.json({ 
        error: `Room ${room.roomNumber} is not available for the selected dates` 
      }, { status: 400 })
    }

    // Start transaction
    await execute('BEGIN')

    try {
      // Check if user already exists
      let userId = null
      const existingUser = await queryOne(`
        SELECT id FROM users WHERE email = $1
      `, [email])

      if (existingUser) {
        userId = existingUser.id
        console.log('Using existing user:', userId)
      } else {
        // Create new user
        const hashedPassword = await bcrypt.hash('temp_password_' + Date.now(), 10)
        const newUser = await queryOne(`
          INSERT INTO users (
            firstname, lastname, email, phone, password, role, status, 
            emailverified, dateofbirth, nationality, idtype, idnumber, 
            address, city, postalcode, twofactorenabled, createdat, updatedat
          )
          VALUES ($1, $2, $3, $4, $5, 'GUEST', 'ACTIVE', false, $6, $7, $8, $9, $10, $11, $12, false, NOW(), NOW())
          RETURNING id
        `, [
          firstname, lastname, email, phone, hashedPassword,
          dateOfBirth, nationality, idType, idNumber, address, city, postalCode
        ])
        
        userId = newUser.id
        console.log('Created new user:', userId)
      }

      // Generate booking reference
      const bookingReference = `SN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`

      // Create booking
      const booking = await queryOne(`
        INSERT INTO "Booking" (
          "bookingReference",
          "userId",
          "roomId",
          "checkInDate",
          "checkOutDate",
          "numberOfGuests",
          "totalPrice",
          "status",
          "paymentStatus",
          "specialRequests",
          "createdAt",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'CONFIRMED', 'PAID', $8, NOW(), NOW())
        RETURNING id, "bookingReference"
      `, [
        bookingReference,
        userId,
        roomId,
        checkInDate,
        checkOutDate,
        guests,
        totalPrice,
        specialRequests || null
      ])

      // Update room status to OCCUPIED (since it's a confirmed booking)
      await execute(`
        UPDATE "Room" 
        SET status = 'OCCUPIED', "updatedAt" = NOW()
        WHERE id = $1
      `, [roomId])

      // Commit transaction
      await execute('COMMIT')

      return NextResponse.json({
        success: true,
        message: `Successfully created booking for ${firstname} ${lastname}`,
        booking: {
          id: booking.id,
          bookingReference: booking.bookingReference,
          guestName: `${firstname} ${lastname}`,
          roomNumber: room.roomNumber,
          checkInDate,
          checkOutDate,
          guests,
          totalPrice,
          paymentMethod: 'CASH', // Default for walk-in bookings
          status: 'CONFIRMED'
        }
      })

    } catch (error) {
      // Rollback transaction
      await execute('ROLLBACK')
      console.error('Manual booking error:', error)
      return NextResponse.json({ 
        error: 'Failed to create booking. Please try again.' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Manual booking API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
