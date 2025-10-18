import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl
    const branchId = url.searchParams.get('branchId')
    const checkIn = url.searchParams.get('checkIn')
    const checkOut = url.searchParams.get('checkOut')
    const guests = url.searchParams.get('guests')
    const roomType = url.searchParams.get('roomType')
    const priceRange = url.searchParams.get('priceRange')

    let whereConditions: string[] = []
    let queryParams: any[] = []
    let paramIndex = 1

    // Base query for room types with availability
    let baseQuery = `
      SELECT
        rt.id, rt.name, rt.slug, rt.description, rt."shortDescription",
        rt."basePrice", rt."maxOccupancy", rt."bedType", rt."numberOfBeds",
        rt."roomSize", rt."viewType", rt.status,
        json_build_object(
          'id', b.id,
          'name', b.name,
          'location', b.location,
          'address', b.address
        ) as branch,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', ri.id,
            'url', ri.url,
            'caption', ri.caption,
            'order', ri."order"
          ) ORDER BY ri."order")
          FROM "RoomImage" ri
          WHERE ri."roomTypeId" = rt.id
        ), '[]'::json) as images,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', a.id,
            'name', a.name,
            'icon', a.icon,
            'category', a.category
          ))
          FROM "RoomTypeAmenity" rta
          JOIN "Amenities" a ON rta."amenityId" = a.id
          WHERE rta."roomTypeId" = rt.id
        ), '[]'::json) as amenities,
        (
          SELECT COUNT(*)::int
          FROM "Room" r
          WHERE r."roomTypeId" = rt.id 
            AND r.status = 'AVAILABLE'
        ) as "availableRooms"
      FROM "RoomType" rt
      LEFT JOIN "Branch" b ON rt."branchId" = b.id
      WHERE rt.status = 'active'
    `

    // Filter by branch
    if (branchId) {
      whereConditions.push(`rt."branchId" = $${paramIndex++}`)
      queryParams.push(branchId)
    }

    // Filter by room type
    if (roomType) {
      whereConditions.push(`rt.id = $${paramIndex++}`)
      queryParams.push(roomType)
    }

    // Filter by guests
    if (guests) {
      whereConditions.push(`rt."maxOccupancy" >= $${paramIndex++}`)
      queryParams.push(parseInt(guests))
    }

    // Filter by price range
    if (priceRange) {
      switch (priceRange) {
        case 'budget':
          whereConditions.push(`rt."basePrice" < $${paramIndex++}`)
          queryParams.push(150)
          break
        case 'mid':
          whereConditions.push(`rt."basePrice" >= $${paramIndex++} AND rt."basePrice" <= $${paramIndex++}`)
          queryParams.push(150, 250)
          break
        case 'luxury':
          whereConditions.push(`rt."basePrice" > $${paramIndex++}`)
          queryParams.push(250)
          break
      }
    }

    // Filter by availability if dates are provided
    if (checkIn && checkOut) {
      whereConditions.push(`
        EXISTS (
          SELECT 1 FROM "Room" r 
          WHERE r."roomTypeId" = rt.id 
            AND r.status = 'AVAILABLE'
            AND r.id NOT IN (
              SELECT b."roomId" 
              FROM "Booking" b 
              WHERE b."roomId" = r.id 
                AND b.status IN ('CONFIRMED', 'CHECKED_IN')
                AND (
                  (b."checkInDate" <= $${paramIndex} AND b."checkOutDate" > $${paramIndex}) OR
                  (b."checkInDate" < $${paramIndex + 1} AND b."checkOutDate" >= $${paramIndex + 1}) OR
                  (b."checkInDate" >= $${paramIndex} AND b."checkOutDate" <= $${paramIndex + 1})
                )
            )
        )
      `)
      queryParams.push(checkIn, checkOut)
      paramIndex += 2
    }

    // Add where conditions to query
    if (whereConditions.length > 0) {
      baseQuery += ` AND ${whereConditions.join(' AND ')}`
    }

    // Add ordering
    baseQuery += ` ORDER BY rt."basePrice" ASC`

    const roomTypes = await query(baseQuery, queryParams)

    // Transform the data
    const transformedRoomTypes = roomTypes.map(roomType => ({
      ...roomType,
      basePrice: parseFloat(roomType.basePrice.toString()),
      images: roomType.images || [],
      amenities: roomType.amenities || []
    }))

    return NextResponse.json({
      success: true,
      roomTypes: transformedRoomTypes
    }, { status: 200 })

  } catch (error) {
    console.error('Error searching rooms:', error)
    return NextResponse.json({ error: 'Failed to search rooms' }, { status: 500 })
  }
}
