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

    const room = await queryOne(`
      SELECT 
        r.*,
        json_build_object('id', b.id, 'name', b.name, 'location', b.location, 'address', b.address) as branch,
        json_build_object(
          'id', rt.id,
          'name', rt.name,
          'description', rt.description,
          'basePrice', rt."basePrice",
          'maxOccupancy', rt."maxOccupancy",
          'bedType', rt."bedType",
          'numberOfBeds', rt."numberOfBeds",
          'roomSize', rt."roomSize",
          'viewType', rt."viewType",
          'amenities', COALESCE((
            SELECT json_agg(json_build_object('amenity', json_build_object('id', a.id, 'name', a.name, 'icon', a.icon, 'category', a.category)))
            FROM "RoomTypeAmenity" rta
            JOIN "Amenities" a ON rta."amenityId" = a.id
            WHERE rta."roomTypeId" = rt.id
          ), '[]'::json),
          'images', COALESCE((
            SELECT json_agg(json_build_object('id', ri.id, 'url', ri.url, 'isPrimary', ri."isPrimary"))
            FROM "RoomImage" ri
            WHERE ri."roomTypeId" = rt.id
          ), '[]'::json)
        ) as "roomType"
      FROM "Room" r
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" b ON r."branchId" = b.id
      WHERE r.id = $1
    `, [id])

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const transformedRoom = {
      ...room,
      roomType: {
        ...room.roomType,
        basePrice: parseFloat(room.roomType.basePrice.toString()),
      },
    }

    return NextResponse.json(
      {
        success: true,
        data: transformedRoom,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching room instance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room instance' },
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
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes, lastCleaned, lastMaintenance } = body

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

    maybeSet('status', status)
    maybeSet('notes', notes)
    maybeSet('"lastCleaned"', lastCleaned, (v) => new Date(v))
    maybeSet('"lastMaintenance"', lastMaintenance, (v) => new Date(v))
    if (setClauses.length > 0) {
      setClauses.push('"updatedAt" = NOW()')
      await execute(
        `UPDATE "Room" SET ${setClauses.join(', ')} WHERE id = $${idx}`,
        [...values, id]
      )
    }

    const updated = await queryOne(`
      SELECT r.*, 
        json_build_object('id', rt.id, 'name', rt.name, 'basePrice', rt."basePrice", 'bedType', rt."bedType", 'maxOccupancy', rt."maxOccupancy") as "roomType",
        json_build_object('id', b.id, 'name', b.name, 'location', b.location) as branch
      FROM "Room" r
      JOIN "RoomType" rt ON r."roomTypeId" = rt.id
      JOIN "Branch" b ON r."branchId" = b.id
      WHERE r.id = $1
    `, [id])

    return NextResponse.json(
      {
        success: true,
        message: 'Room updated successfully',
        data: updated,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
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

    const active = await queryOne(
      `SELECT COUNT(*)::int as cnt FROM "Booking" WHERE "roomId" = $1 AND status IN ('PENDING','CONFIRMED')`,
      [id]
    )
    const activeBookings = active?.cnt || 0

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: `Cannot delete room with ${activeBookings} active bookings` },
        { status: 400 }
      )
    }

    await execute('DELETE FROM "Room" WHERE id = $1', [id])

    return NextResponse.json(
      {
        success: true,
        message: 'Room deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}