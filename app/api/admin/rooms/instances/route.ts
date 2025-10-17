import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, execute } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

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

    const searchParams = request.nextUrl.searchParams
    const branchId = searchParams.get('branchId')
    const roomTypeId = searchParams.get('roomTypeId')
    const status = searchParams.get('status')
    const floor = searchParams.get('floor')

    const where: any = {}

    if (branchId) where.branchId = branchId
    if (roomTypeId) where.roomTypeId = roomTypeId
    if (status) where.status = status
    if (floor) where.floor = parseInt(floor)

    const clauses: string[] = []
    const paramsArr: any[] = []
    let p = 1
    if (branchId) { clauses.push(`r."branchId" = $${p++}`); paramsArr.push(branchId) }
    if (roomTypeId) { clauses.push(`r."roomTypeId" = $${p++}`); paramsArr.push(roomTypeId) }
    if (status) { clauses.push(`r.status = $${p++}`); paramsArr.push(status) }
    if (floor) { clauses.push(`r.floor = $${p++}`); paramsArr.push(parseInt(floor)) }

    const whereSql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const rooms = await query(
      `SELECT 
         r.*, 
         json_build_object('id', rt.id, 'name', rt.name, 'basePrice', rt."basePrice", 'bedType', rt."bedType", 'maxOccupancy', rt."maxOccupancy") as "roomType",
         json_build_object('id', b.id, 'name', b.name, 'location', b.location) as branch
       FROM "Room" r
       JOIN "RoomType" rt ON r."roomTypeId" = rt.id
       JOIN "Branch" b ON r."branchId" = b.id
       ${whereSql}
       ORDER BY r.floor ASC, r."roomNumber" ASC`,
      paramsArr
    )

    const transformedRooms = rooms.map((room: any) => ({
      ...room,
      roomType: {
        ...room.roomType,
        basePrice: parseFloat(room.roomType.basePrice.toString()),
      },
    }))

    return NextResponse.json(
      {
        success: true,
        count: transformedRooms.length,
        data: transformedRooms,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching room instances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room instances' },
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
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { roomNumber, floor, roomTypeId, branchId, notes } = body

    // Validation
    if (!roomNumber || !floor || !roomTypeId || !branchId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if room number already exists in branch
    const existingRoom = await queryOne(
      'SELECT id FROM "Room" WHERE "roomNumber" = $1 AND "branchId" = $2',
      [roomNumber, branchId]
    )

    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room number already exists in this branch' },
        { status: 400 }
      )
    }

    // Create room
    const created = await queryOne(
      'INSERT INTO "Room" (id, "roomNumber", floor, "roomTypeId", "branchId", notes, status, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
      [roomNumber, parseInt(floor.toString()), roomTypeId, branchId, notes || null, 'AVAILABLE']
    )
    if (!created || !('id' in created)) {
      console.error('Insert returned no id:', created)
      return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
    }
    const roomId = (created as any).id
    const room = await queryOne(
      `SELECT r.*, 
        json_build_object('id', rt.id, 'name', rt.name, 'basePrice', rt."basePrice", 'bedType', rt."bedType", 'maxOccupancy', rt."maxOccupancy") as "roomType",
        json_build_object('id', b.id, 'name', b.name, 'location', b.location) as branch
       FROM "Room" r
       JOIN "RoomType" rt ON r."roomTypeId" = rt.id
       JOIN "Branch" b ON r."branchId" = b.id
       WHERE r.id = $1`,
      [roomId]
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Room created successfully',
        data: room,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}