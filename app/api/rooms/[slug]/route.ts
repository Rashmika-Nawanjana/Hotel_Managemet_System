import { NextRequest, NextResponse } from 'next/server'
import { queryOne, query } from '@/lib/db-queries'

interface Amenity {
  id: string
  name: string
  icon: string | null
  category: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const roomType = await queryOne(
      `SELECT 
        rt.*,
        json_build_object(
          'id', b.id,
          'name', b.name,
          'slug', b.slug,
          'location', b.location,
          'address', b.address,
          'phone', b.phone,
          'email', b.email
        ) as branch,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'id', ri.id,
              'url', ri.url,
              'caption', ri.caption,
              'isPrimary', ri."isPrimary",
              'order', ri."order"
            ) ORDER BY ri."order" ASC
          )
          FROM "RoomImage" ri
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
          FROM "RoomTypeAmenity" rta
          JOIN "Amenities" a ON rta."amenityId" = a.id
          WHERE rta."roomTypeId" = rt.id
        ), '[]'::json) as amenities
      FROM "RoomType" rt
      LEFT JOIN "Branch" b ON rt."branchId" = b.id
      WHERE rt.slug = $1`,
      [slug]
    )

    if (!roomType) {
      return NextResponse.json(
        { error: 'Room type not found' },
        { status: 404 }
      )
    }

    // Get available rooms separately
    const rooms = await query(
      `SELECT id, "roomNumber", floor, status
       FROM "Room"
       WHERE "roomTypeId" = $1 AND status = 'AVAILABLE'`,
      [roomType.id]
    )

    // Group amenities by category
    const amenitiesByCategory: Record<string, Amenity[]> = {}
    if (roomType.amenities && Array.isArray(roomType.amenities)) {
      roomType.amenities.forEach((amenity: Amenity) => {
        const category = amenity.category
        if (!amenitiesByCategory[category]) {
          amenitiesByCategory[category] = []
        }
        amenitiesByCategory[category].push(amenity)
      })
    }

    // Transform response
    const response = {
      id: roomType.id,
      name: roomType.name,
      slug: roomType.slug,
      description: roomType.description,
      shortDescription: roomType.shortDescription,
      basePrice: parseFloat(roomType.basePrice),
      maxOccupancy: roomType.maxOccupancy,
      bedType: roomType.bedType,
      numberOfBeds: roomType.numberOfBeds,
      roomSize: roomType.roomSize,
      viewType: roomType.viewType,
      isFeatured: roomType.isFeatured,
      popularityScore: roomType.popularityScore,
      status: roomType.status,
      branch: roomType.branch,
      images: roomType.images,
      amenitiesByCategory,
      availableRooms: rooms.length,
      rooms,
      createdAt: roomType.createdAt,
      updatedAt: roomType.updatedAt,
    }

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching room type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room type' },
      { status: 500 }
    )
  }
}