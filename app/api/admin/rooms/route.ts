import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get all room types (including inactive) with related data
    const roomTypes = await query(`
      SELECT 
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
              'altText', ri."altText",
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
        ), '[]'::json) as amenities,
        (
          SELECT COUNT(*)::int
          FROM "Room" r
          WHERE r."roomTypeId" = rt.id
        ) as "availableRooms"
      FROM "RoomType" rt
      LEFT JOIN "Branch" b ON rt."branchId" = b.id
      ORDER BY rt."createdAt" DESC
    `)

    console.log('📊 Fetched room types:', roomTypes.length)

    // Transform data and convert Decimal to number
    const transformedRoomTypes = roomTypes.map((roomType) => {
      console.log(`🏨 Room: ${roomType.name}, Images: ${roomType.images?.length || 0}`)
      
      return {
        id: roomType.id,
        name: roomType.name,
        slug: roomType.slug,
        description: roomType.description,
        shortDescription: roomType.shortDescription,
        basePrice: parseFloat(roomType.basePrice.toString()),
        maxOccupancy: roomType.maxOccupancy,
        bedType: roomType.bedType,
        numberOfBeds: roomType.numberOfBeds,
        roomSize: roomType.roomSize,
        viewType: roomType.viewType,
        isFeatured: roomType.isFeatured,
        popularityScore: roomType.popularityScore,
        status: roomType.status,
        branch: roomType.branch,
        images: roomType.images || [],
        amenities: roomType.amenities || [],
        availableRooms: roomType.availableRooms,
        createdAt: roomType.createdAt,
        updatedAt: roomType.updatedAt,
      }
    })

    return NextResponse.json(
      {
        success: true,
        count: transformedRoomTypes.length,
        data: transformedRoomTypes,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error fetching room types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const {
      name,
      description,
      shortDescription,
      basePrice,
      maxOccupancy,
      bedType,
      numberOfBeds,
      roomSize,
      viewType,
      branchId,
      amenityIds,
      images,
      isFeatured,
    } = body

    // Validation
    if (!name || !description || !basePrice || !maxOccupancy || !bedType || !branchId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug
    const slug = generateSlug(name)

    // Check if slug already exists
    const existingRoomType = await queryOne(
      'SELECT id FROM "RoomType" WHERE slug = $1',
      [slug]
    )

    if (existingRoomType) {
      return NextResponse.json(
        { error: 'A room type with this name already exists' },
        { status: 400 }
      )
    }

    console.log('🆕 Creating room type:', name)
    console.log('📸 Images to save:', images?.length || 0)

    // Create room type and return id
    const roomTypeRow = await queryOne(`
      INSERT INTO "RoomType" (
        id, name, slug, description, "shortDescription", "basePrice", 
        "maxOccupancy", "bedType", "numberOfBeds", "roomSize", "viewType", 
        "branchId", "isFeatured", status, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active', NOW(), NOW()
      ) RETURNING id
    `, [
      name,
      slug,
      description,
      shortDescription,
      parseFloat(basePrice),
      parseInt(maxOccupancy),
      bedType,
      parseInt(numberOfBeds) || 1,
      parseInt(roomSize),
      viewType,
      branchId,
      isFeatured || false
    ])
    if (!roomTypeRow) {
      throw new Error('Failed to create room type')
    }
    const roomTypeId = (roomTypeRow as any).id

    // Add amenities if provided
    if (amenityIds && amenityIds.length > 0) {
      for (const amenityId of amenityIds) {
        await execute(`
          INSERT INTO "RoomTypeAmenity" (id, "roomTypeId", "amenityId", "createdAt")
          VALUES (gen_random_uuid(), $1, $2, NOW())
        `, [roomTypeId, amenityId])
      }
    }

    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        await execute(`
          INSERT INTO "RoomImage" (id, url, caption, "altText", "isPrimary", "order", "roomTypeId", "createdAt")
          VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
        `, [
          image.url,
          image.caption || null,
          image.altText || null,
          i === 0, // First image is primary
          i + 1, // Order starts from 1
          roomTypeId
        ])
      }
    }

    // Fetch the created room type with all related data
    const roomType = await queryOne(`
      SELECT 
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
              'altText', ri."altText",
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
      WHERE rt.id = $1
    `, [roomTypeId])

    console.log('✅ Room type created with', roomType.images?.length || 0, 'images')

    return NextResponse.json(
      {
        success: true,
        message: 'Room type created successfully',
        data: roomType,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error creating room type:', error)
    return NextResponse.json(
      { error: 'Failed to create room type' },
      { status: 500 }
    )
  }
}