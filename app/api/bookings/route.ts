import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const {
      checkInDate,
      checkOutDate,
      numberOfGuests,
      branchId,
      roomTypeId,
      specialRequests,
      firstName,
      lastName,
      email,
      phone,
      paymentInfo
    } = body

    // Validate required fields
    if (!checkInDate || !checkOutDate || !numberOfGuests || !branchId || !roomTypeId) {
      return NextResponse.json({ error: 'Missing required booking fields' }, { status: 400 })
    }

    // Validate dates
    const checkIn = new Date(checkInDate)
    const checkOut = new Date(checkOutDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkIn < today) {
      return NextResponse.json({ error: 'Check-in date cannot be in the past' }, { status: 400 })
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({ error: 'Check-out date must be after check-in date' }, { status: 400 })
    }

    // Get room type details for pricing
    const roomType = await queryOne(
      `SELECT id, name, "basePrice", "maxOccupancy" FROM "RoomType" WHERE id = $1`,
      [roomTypeId]
    )

    if (!roomType) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 })
    }

    // Check if room type belongs to the selected branch
    const roomTypeBranch = await queryOne(
      `SELECT "branchId" FROM "RoomType" WHERE id = $1`,
      [roomTypeId]
    )

    if (roomTypeBranch?.branchId !== branchId) {
      return NextResponse.json({ error: 'Room type does not belong to selected branch' }, { status: 400 })
    }

    // Check occupancy
    if (numberOfGuests > roomType.maxOccupancy) {
      return NextResponse.json({ 
        error: `Maximum occupancy for this room type is ${roomType.maxOccupancy} guests` 
      }, { status: 400 })
    }

    // Calculate total price
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const totalPrice = nights * parseFloat(roomType.basePrice.toString())

    // Generate booking reference
    const bookingReference = `SN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Find an available room of this type in the selected branch
    const availableRoom = await queryOne(
      `SELECT r.id 
       FROM "Room" r 
       WHERE r."roomTypeId" = $1 
         AND r."branchId" = $2 
         AND r.status = 'AVAILABLE'
         AND r.id NOT IN (
           SELECT b."roomId" 
           FROM "Booking" b 
           WHERE b."roomId" = r.id 
             AND b.status IN ('CONFIRMED', 'CHECKED_IN')
             AND (
               (b."checkInDate" <= $3 AND b."checkOutDate" > $3) OR
               (b."checkInDate" < $4 AND b."checkOutDate" >= $4) OR
               (b."checkInDate" >= $3 AND b."checkOutDate" <= $4)
             )
         )
       LIMIT 1`,
      [roomTypeId, branchId, checkInDate, checkOutDate]
    )

    if (!availableRoom) {
      return NextResponse.json({ 
        error: 'No rooms available for the selected dates. Please try different dates.' 
      }, { status: 400 })
    }

    // Create booking
    const bookingId = await queryOne(
      `INSERT INTO "Booking" (
        id, "bookingReference", "userId", "roomId", "checkInDate", "checkOutDate",
        "numberOfGuests", "totalPrice", status, "paymentStatus", "specialRequests",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, 'PENDING', 'PENDING', $8, NOW(), NOW()
      ) RETURNING id`,
      [
        bookingReference,
        decoded.userId,
        availableRoom.id,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        totalPrice,
        specialRequests || null
      ]
    )

    // Store payment information (encrypted in real implementation)
    if (paymentInfo) {
      await execute(
        `INSERT INTO "PaymentInfo" (
          id, "bookingId", "cardNumber", "cardExpiry", "cardCvv", "cardName",
          "billingAddress", "billingCity", "billingPostalCode", "billingCountry",
          "createdAt"
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()
        )`,
        [
          bookingId.id,
          paymentInfo.cardNumber,
          paymentInfo.cardExpiry,
          paymentInfo.cardCvv,
          paymentInfo.cardName,
          paymentInfo.billingAddress,
          paymentInfo.billingCity,
          paymentInfo.billingPostalCode,
          paymentInfo.billingCountry
        ]
      )
    }

    // Update guest information if provided
    if (firstName || lastName || email || phone) {
      const updateFields = []
      const updateValues = []
      let paramIndex = 1

      if (firstName) {
        updateFields.push(`firstname = $${paramIndex++}`)
        updateValues.push(firstName)
      }
      if (lastName) {
        updateFields.push(`lastname = $${paramIndex++}`)
        updateValues.push(lastName)
      }
      if (email) {
        updateFields.push(`email = $${paramIndex++}`)
        updateValues.push(email)
      }
      if (phone) {
        updateFields.push(`phone = $${paramIndex++}`)
        updateValues.push(phone)
      }

      if (updateFields.length > 0) {
        updateFields.push(`updatedat = NOW()`)
        updateValues.push(decoded.userId)

        await execute(
          `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
          updateValues
        )
      }
    }

    // Fetch the created booking with full details
    const booking = await queryOne(
      `SELECT 
        b.*,
        json_build_object(
          'id', u.id,
          'firstName', u.firstname,
          'lastName', u.lastname,
          'email', u.email,
          'phone', u.phone
        ) as user,
        json_build_object(
          'id', r.id,
          'roomNumber', r."roomNumber",
          'floor', r.floor,
          'status', r.status,
          'roomType', json_build_object(
            'id', rt.id,
            'name', rt.name,
            'slug', rt.slug,
            'description', rt.description,
            'basePrice', rt."basePrice",
            'maxOccupancy', rt."maxOccupancy",
            'bedType', rt."bedType",
            'numberOfBeds', rt."numberOfBeds",
            'roomSize', rt."roomSize",
            'viewType', rt."viewType"
          ),
          'branch', json_build_object(
            'id', br.id,
            'name', br.name,
            'location', br.location,
            'address', br.address
          )
        ) as room
      FROM "Booking" b
      LEFT JOIN users u ON b."userId" = u.id
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      WHERE b.id = $1`,
      [bookingId.id]
    )

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        ...booking,
        totalPrice: parseFloat(booking.totalPrice.toString()),
        room: {
          ...booking.room,
          roomType: {
            ...booking.room.roomType,
            basePrice: parseFloat(booking.room.roomType.basePrice.toString())
          }
        }
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const url = request.nextUrl
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'))
    const limit = Math.max(1, parseInt(url.searchParams.get('limit') || '10'))
    const offset = (page - 1) * limit

    let whereClause = ''
    let queryParams: any[] = []
    let paramIndex = 1

    // Admin/Staff can see all bookings, guests can only see their own
    if (decoded.role === 'GUEST') {
      whereClause = `WHERE b."userId" = $${paramIndex++}`
      queryParams.push(decoded.userId)
    }

    // Get total count
    const totalRes = await query(
      `SELECT COUNT(*)::int AS count FROM "Booking" b ${whereClause}`,
      queryParams
    )
    const total = totalRes[0]?.count || 0

    // Get bookings
    const bookings = await query(
      `SELECT 
        b.*,
        json_build_object(
          'id', u.id,
          'firstName', u.firstname,
          'lastName', u.lastname,
          'email', u.email,
          'phone', u.phone
        ) as user,
        json_build_object(
          'id', r.id,
          'roomNumber', r."roomNumber",
          'floor', r.floor,
          'status', r.status,
          'roomType', json_build_object(
            'id', rt.id,
            'name', rt.name,
            'slug', rt.slug,
            'basePrice', rt."basePrice",
            'maxOccupancy', rt."maxOccupancy",
            'bedType', rt."bedType"
          ),
          'branch', json_build_object(
            'id', br.id,
            'name', br.name,
            'location', br.location
          )
        ) as room
      FROM "Booking" b
      LEFT JOIN users u ON b."userId" = u.id
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      ${whereClause}
      ORDER BY b."createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...queryParams, limit, offset]
    )

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      bookings: bookings.map(booking => ({
        ...booking,
        totalPrice: parseFloat(booking.totalPrice.toString()),
        room: {
          ...booking.room,
          roomType: {
            ...booking.room.roomType,
            basePrice: parseFloat(booking.room.roomType.basePrice.toString())
          }
        }
      }))
    }, { status: 200 })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
