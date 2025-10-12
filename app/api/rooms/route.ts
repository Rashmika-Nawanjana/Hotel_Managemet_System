import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Query parameters
    const branchId = searchParams.get('branchId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const maxOccupancy = searchParams.get('maxOccupancy')
    const bedType = searchParams.get('bedType')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status') || 'active'

    // Build WHERE clause dynamically
    const conditions: string[] = ['rt.status = $1']
    const values: any[] = [status]
    let paramIndex = 2

    if (branchId) {
      conditions.push(`rt."branchId" = $${paramIndex++}`)
      values.push(branchId)
    }

    if (minPrice) {
      conditions.push(`rt."basePrice" >= $${paramIndex++}`)
      values.push(parseFloat(minPrice))
    }

    if (maxPrice) {
      conditions.push(`rt."basePrice" <= $${paramIndex++}`)
      values.push(parseFloat(maxPrice))
    }

    if (maxOccupancy) {
      conditions.push(`rt."maxOccupancy" >= $${paramIndex++}`)
      values.push(parseInt(maxOccupancy))
    }

    if (bedType) {
      conditions.push(`rt."bedType" ILIKE $${paramIndex++}`)
      values.push(`%${bedType}%`)
    }

    if (featured === 'true') {
      conditions.push(`rt."isFeatured" = true`)
    }

    const whereClause = conditions.join(' AND ')

    // Fetch room types with all related data using JSON aggregation
    const roomTypes = await query(
      `SELECT 
        rt.*,
        json_build_object(
          'id', b.id,
          'name', b.name,
          'location', b.location
        ) as branch,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', ri.id,
              'url', ri.url,
              'caption', ri.caption,
              'order', ri."order"
            ) ORDER BY ri."order" ASC
          )
          FROM room_images ri
          WHERE ri."roomTypeId" = rt.id
        ), '[]'::json) as images,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name,
              'icon', a.icon,
              'category', a.category
            )
          )
          FROM room_type_amenities rta
          JOIN amenities a ON rta."amenityId" = a.id
          WHERE rta."roomTypeId" = rt.id
        ), '[]'::json) as amenities,
        (
          SELECT COUNT(*)::int
          FROM rooms r
          WHERE r."roomTypeId" = rt.id
        ) as "availableRooms"
      FROM room_types rt
      LEFT JOIN branches b ON rt."branchId" = b.id
      WHERE ${whereClause}
      ORDER BY rt."isFeatured" DESC, rt."popularityScore" DESC, rt."basePrice" ASC`,
      values
    )

    return NextResponse.json(
      {
        success: true,
        count: roomTypes.length,
        data: roomTypes,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    )
  }
}