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

    // Build the main query with proper availability calculation
    let mainQuery = `
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
        -- Calculate available rooms for the specific dates
        CASE 
          WHEN $1 != '' AND $2 != '' THEN
            (
              SELECT COUNT(*)::int
              FROM "Room" r
              WHERE r."roomTypeId" = rt.id 
                AND r.status = 'AVAILABLE'
                AND r.id NOT IN (
                  SELECT b."roomId" 
                  FROM "Booking" b 
                  WHERE b."roomId" = r.id 
                    AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
                    AND (
                      -- Check for date overlap: booking overlaps with requested dates
                      (DATE(b."checkInDate") <= $2::date AND DATE(b."checkOutDate") > $1::date)
                    )
                )
            )
          ELSE
            (
              SELECT COUNT(*)::int
              FROM "Room" r
              WHERE r."roomTypeId" = rt.id 
                AND r.status = 'AVAILABLE'
            )
        END as "availableRooms"
      FROM "RoomType" rt
      LEFT JOIN "Branch" b ON rt."branchId" = b.id
      WHERE rt.status = 'active'
    `

    // Add check-in and check-out dates to parameters first
    if (checkIn && checkOut) {
      queryParams.push(checkIn, checkOut)
      paramIndex += 2
    } else {
      // Use empty string instead of null to avoid PostgreSQL type inference issues
      queryParams.push('', '')
      paramIndex += 2
    }

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

    // Only show room types that have available rooms for the requested dates
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
                AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
                AND (
                  -- Check for date overlap: booking overlaps with requested dates
                  (DATE(b."checkInDate") <= $2::date AND DATE(b."checkOutDate") > $1::date)
                )
            )
        )
      `)
    }

    // Add where conditions to query
    if (whereConditions.length > 0) {
      mainQuery += ` AND ${whereConditions.join(' AND ')}`
    }

    // Add ordering
    mainQuery += ` ORDER BY rt."basePrice" ASC`

    console.log('Room search query:', mainQuery)
    console.log('Query params:', queryParams)
    console.log('Check-in date:', checkIn, 'Check-out date:', checkOut)

    const roomTypes = await query(mainQuery, queryParams)

    // Transform the data
    const transformedRoomTypes = roomTypes.map(roomType => ({
      ...roomType,
      basePrice: parseFloat(roomType.basePrice.toString()),
      images: roomType.images || [],
      amenities: roomType.amenities || [],
      availableRooms: parseInt(roomType.availableRooms) || 0
    }))

    console.log('Found room types:', transformedRoomTypes.length)
    console.log('Available rooms per type:', transformedRoomTypes.map(rt => ({ name: rt.name, available: rt.availableRooms })))
    
    // Debug: Check existing bookings for Standard Room
    if (checkIn && checkOut) {
      const debugQuery = `
        SELECT b.id, b."bookingReference", b."checkInDate", b."checkOutDate", b.status, r."roomNumber", rt.name as "roomTypeName"
        FROM "Booking" b
        JOIN "Room" r ON b."roomId" = r.id
        JOIN "RoomType" rt ON r."roomTypeId" = rt.id
        WHERE rt.name = 'Standard Room'
          AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
          AND (DATE(b."checkInDate") <= $1::date AND DATE(b."checkOutDate") > $2::date)
      `
      const debugBookings = await query(debugQuery, [checkOut, checkIn])
      console.log('Debug - Existing bookings for Standard Room:', debugBookings)
    }

    return NextResponse.json({
      success: true,
      roomTypes: transformedRoomTypes
    }, { status: 200 })

  } catch (error) {
    console.error('Error searching rooms:', error)
    return NextResponse.json({ error: 'Failed to search rooms' }, { status: 500 })
  }
}
