import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db-queries'
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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params

    const booking = await queryOne(
      `SELECT 
        b.*,
        json_build_object(
          'id', u.id,
          'firstName', u."firstName",
          'lastName', u."lastName",
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
            'images', COALESCE((
              SELECT json_agg(json_build_object(
                'id', ri.id,
                'url', ri.url,
                'caption', ri.caption,
                'order', ri."order"
              ) ORDER BY ri."order")
              FROM room_images ri
              WHERE ri."roomTypeId" = rt.id
            ), '[]'::json),
            'amenities', COALESCE((
              SELECT json_agg(json_build_object(
                'id', a.id,
                'name', a.name,
                'icon', a.icon,
                'category', a.category
              ))
              FROM room_type_amenities rta
              JOIN amenities a ON rta."amenityId" = a.id
              WHERE rta."roomTypeId" = rt.id
            ), '[]'::json)
          ),
          'branch', json_build_object(
            'id', br.id,
            'name', br.name,
            'code', br.code,
            'address', br.address,
            'city', br.city
          )
        ) as room
      FROM bookings b
      LEFT JOIN users u ON b."userId" = u.id
      LEFT JOIN rooms r ON b."roomId" = r.id
      LEFT JOIN room_types rt ON r."roomTypeId" = rt.id
      LEFT JOIN branches br ON r."branchId" = br.id
      WHERE b.id = $1`,
      [id]
    )

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (
      decoded.role === 'GUEST' &&
      booking.userId !== decoded.userId
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to view this booking' },
        { status: 403 }
      )
    }

    const transformedBooking = {
      ...booking,
      totalPrice: parseFloat(booking.totalPrice.toString()),
      room: {
        ...booking.room,
        roomType: {
          ...booking.room.roomType,
          basePrice: parseFloat(booking.room.roomType.basePrice.toString()),
        },
      },
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedBooking,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, paymentStatus, specialRequests } = body

    const existingBooking = await queryOne(
      'SELECT id, "userId" FROM bookings WHERE id = $1',
      [id]
    )

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (
      decoded.role === 'GUEST' &&
      existingBooking.userId !== decoded.userId
    ) {
      return NextResponse.json(
        { error: 'Unauthorized to update this booking' },
        { status: 403 }
      )
    }

    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (status) {
      if (decoded.role === 'GUEST' && status !== 'CANCELLED') {
        return NextResponse.json(
          { error: 'You can only cancel bookings' },
          { status: 403 }
        )
      }
      updateFields.push(`status = $${paramIndex++}`)
      updateValues.push(status)
    }

    if (paymentStatus && (decoded.role === 'ADMIN' || decoded.role === 'STAFF')) {
      updateFields.push(`"paymentStatus" = $${paramIndex++}`)
      updateValues.push(paymentStatus)
    }

    if (specialRequests !== undefined) {
      updateFields.push(`"specialRequests" = $${paramIndex++}`)
      updateValues.push(specialRequests)
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updateValues.push(id)

    await execute(
      `UPDATE bookings 
       SET ${updateFields.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramIndex}`,
      updateValues
    )

    // Fetch updated booking with related data
    const booking = await queryOne(
      `SELECT 
        b.*,
        json_build_object(
          'id', u.id,
          'firstName', u."firstName",
          'lastName', u."lastName",
          'email', u.email
        ) as user,
        json_build_object(
          'id', r.id,
          'roomNumber', r."roomNumber",
          'roomType', json_build_object(
            'id', rt.id,
            'name', rt.name,
            'slug', rt.slug
          ),
          'branch', json_build_object(
            'id', br.id,
            'name', br.name,
            'code', br.code
          )
        ) as room
      FROM bookings b
      LEFT JOIN users u ON b."userId" = u.id
      LEFT JOIN rooms r ON b."roomId" = r.id
      LEFT JOIN room_types rt ON r."roomTypeId" = rt.id
      LEFT JOIN branches br ON r."branchId" = br.id
      WHERE b.id = $1`,
      [id]
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Booking updated successfully',
        data: {
          ...booking,
          totalPrice: parseFloat(booking.totalPrice.toString()),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    await execute('DELETE FROM bookings WHERE id = $1', [id])

    return NextResponse.json(
      {
        success: true,
        message: 'Booking deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}