import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db-queries'
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
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

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
              'id', r.id,
              'roomNumber', r."roomNumber",
              'floor', r.floor,
              'status', r.status
            )
          )
          FROM "Room" r
          WHERE r."roomTypeId" = rt.id
        ), '[]'::json) as rooms
      FROM "RoomType" rt
      LEFT JOIN "Branch" b ON rt."branchId" = b.id
      WHERE rt.id = $1
    `, [id])

    if (!roomType) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 })
    }

    const rooms = roomType.rooms || []
    const roomsByStatus = (rooms as any[]).reduce((acc: Record<string, any[]>, room: any) => {
      const key = room.status
      if (!acc[key]) acc[key] = []
      acc[key].push(room)
      return acc
    }, {})

    const transformedRoomType = {
      ...roomType,
      basePrice: parseFloat(roomType.basePrice.toString()),
      totalRooms: (rooms as any[]).length,
      roomsByStatus,
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedRoomType,
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
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
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
      status,
      isFeatured,
      amenityIds,
      images,
    } = body

    const setClauses: string[] = []
    const values: any[] = []
    let idx = 1

    const maybeSet = (column: string, value: any, transform?: (v: any) => any) => {
      if (value !== undefined) {
        setClauses.push(`${column} = $${idx}`)
        values.push(transform ? transform(value) : value)
        idx += 1
      }
    }

    maybeSet('name', name)
    maybeSet('description', description)
    maybeSet('"shortDescription"', shortDescription)
    maybeSet('"basePrice"', basePrice, (v) => parseFloat(v))
    maybeSet('"maxOccupancy"', maxOccupancy, (v) => parseInt(v))
    maybeSet('"bedType"', bedType)
    maybeSet('"numberOfBeds"', numberOfBeds, (v) => parseInt(v))
    maybeSet('"roomSize"', roomSize, (v) => parseInt(v))
    maybeSet('"viewType"', viewType)
    maybeSet('status', status)
    maybeSet('"isFeatured"', isFeatured)
    if (setClauses.length > 0) {
      setClauses.push('"updatedAt" = NOW()')
      await execute(
        `UPDATE "RoomType" SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        [...values, id]
      )
    }

    if (Array.isArray(amenityIds)) {
      await execute('DELETE FROM "RoomTypeAmenity" WHERE "roomTypeId" = $1', [id])
      for (const amenityId of amenityIds) {
        await execute(
          'INSERT INTO "RoomTypeAmenity" (id, "roomTypeId", "amenityId", "createdAt") VALUES (gen_random_uuid(), $1, $2, NOW())',
          [id, amenityId]
        )
      }
    }

    if (Array.isArray(images)) {
      await execute('DELETE FROM "RoomImage" WHERE "roomTypeId" = $1', [id])
      for (let i = 0; i < images.length; i++) {
        const image = images[i]
        await execute(
          'INSERT INTO "RoomImage" (id, url, caption, "altText", "isPrimary", "order", "roomTypeId", "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())',
          [image.url, image.caption || null, image.altText || null, i === 0, i + 1, id]
        )
      }
    }

    const updated = await queryOne(`
      SELECT 
        rt.*,
        json_build_object('id', b.id, 'name', b.name, 'location', b.location) as branch,
        COALESCE((
          SELECT json_agg(json_build_object('id', a.id, 'name', a.name, 'icon', a.icon, 'category', a.category))
          FROM "RoomTypeAmenity" rta
          JOIN "Amenities" a ON rta."amenityId" = a.id
          WHERE rta."roomTypeId" = rt.id
        ), '[]'::json) as amenities,
        COALESCE((
          SELECT json_agg(json_build_object('id', ri.id, 'url', ri.url, 'caption', ri.caption, 'altText', ri."altText", 'isPrimary', ri."isPrimary", 'order', ri."order") ORDER BY ri."order" ASC)
          FROM "RoomImage" ri
          WHERE ri."roomTypeId" = rt.id
        ), '[]'::json) as images
      FROM "RoomType" rt
      LEFT JOIN "Branch" b ON rt."branchId" = b.id
      WHERE rt.id = $1
    `, [id])

    return NextResponse.json(
      {
        success: true,
        message: 'Room type updated successfully',
        data: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating room type:', error)
    return NextResponse.json(
      { error: 'Failed to update room type' },
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
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params

    const roomCountRow = await queryOne('SELECT COUNT(*)::int as cnt FROM "Room" WHERE "roomTypeId" = $1', [id])
    const roomCount = roomCountRow?.cnt || 0

    if (roomCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete room type with ${roomCount} rooms. Delete rooms first.` },
        { status: 400 }
      )
    }

    await execute('DELETE FROM "RoomType" WHERE id = $1', [id])

    return NextResponse.json(
      {
        success: true,
        message: 'Room type deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting room type:', error)
    return NextResponse.json(
      { error: 'Failed to delete room type' },
      { status: 500 }
    )
  }
}