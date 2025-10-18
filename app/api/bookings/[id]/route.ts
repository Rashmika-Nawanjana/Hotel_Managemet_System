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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id: bookingId } = await params

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Fetch booking with full details
    const booking = await queryOne(`
      SELECT 
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
            'viewType', rt."viewType",
            'images', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'id', ri.id,
                  'url', ri.url,
                  'caption', ri.caption,
                  'altText', ri."altText",
                  'isPrimary', ri."isPrimary",
                  'order', ri."order"
                ) ORDER BY ri."order" ASC, ri."isPrimary" DESC
              )
              FROM "RoomImage" ri
              WHERE ri."roomTypeId" = rt.id
            ), '[]'::json),
            'amenities', COALESCE((
              SELECT json_agg(
                json_build_object(
                  'id', a.id,
                  'name', a.name,
                  'icon', a.icon,
                  'category', a.category
                )
              )
              FROM "RoomTypeAmenity" rta
              JOIN "Amenities" a ON rta."amenityId" = a.id
              WHERE rta."roomTypeId" = rt.id
            ), '[]'::json)
          ),
          'branch', json_build_object(
            'id', br.id,
            'name', br.name,
            'location', br.location,
            'address', br.address,
            'phone', br.phone,
            'email', br.email
          )
        ) as room,
        json_build_object(
          'cardNumber', pi."cardNumber",
          'cardExpiry', pi."cardExpiry",
          'cardCvv', pi."cardCvv",
          'cardName', pi."cardName",
          'billingAddress', pi."billingAddress",
          'billingCity', pi."billingCity",
          'billingPostalCode', pi."billingPostalCode",
          'billingCountry', pi."billingCountry"
        ) as paymentInfo
      FROM "Booking" b
      LEFT JOIN users u ON b."userId" = u.id
      LEFT JOIN "Room" r ON b."roomId" = r.id
      LEFT JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      LEFT JOIN "Branch" br ON r."branchId" = br.id
      LEFT JOIN "PaymentInfo" pi ON b.id = pi."bookingId"
      WHERE b.id = $1
    `, [bookingId])

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if user has access to this booking
    if (decoded.role === 'GUEST' && booking.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(
      {
        success: true,
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
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

