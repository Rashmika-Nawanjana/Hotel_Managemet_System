import { NextRequest, NextResponse } from 'next/server'
import { queryOne, execute } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

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
    if (!decoded || decoded.role !== 'STAFF') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params
    const { status, notes } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['AVAILABLE', 'CLEANING', 'OUT_OF_SERVICE']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be AVAILABLE, CLEANING, or OUT_OF_SERVICE' 
      }, { status: 400 })
    }

    // Get room details and check if staff has access
    const room = await queryOne(`
      SELECT 
        r.id,
        r."roomNumber",
        r.status as current_status,
        r."branchId",
        sp."branchId" as staff_branch_id,
        sp."staffRole"
      FROM "Room" r
      JOIN "StaffProfile" sp ON sp."userId" = $1
      WHERE r.id = $2
    `, [decoded.userId, id])

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check staff branch access (non-management staff can only update rooms in their branch)
    const isManagement = room.staffRole === 'MANAGEMENT'
    if (!isManagement && room.branchId !== room.staff_branch_id) {
      return NextResponse.json({ 
        error: 'You can only update rooms in your assigned branch' 
      }, { status: 403 })
    }

    // Prevent changing occupied rooms to cleaning (occupied status is managed by check-in/out)
    if (room.current_status === 'OCCUPIED' && status === 'CLEANING') {
      return NextResponse.json({ 
        error: 'Cannot change occupied room to cleaning. Occupied status is managed automatically by check-in/check-out system.' 
      }, { status: 400 })
    }

    // Prevent changing occupied rooms to available (occupied status is managed by check-in/out)
    if (room.current_status === 'OCCUPIED' && status === 'AVAILABLE') {
      return NextResponse.json({ 
        error: 'Cannot change occupied room to available. Occupied status is managed automatically by check-in/check-out system.' 
      }, { status: 400 })
    }

    // Update room status
    const updateFields = ['status = $1', '"updatedAt" = NOW()']
    const updateValues = [status]
    let paramIndex = 2

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramIndex++}`)
      updateValues.push(notes)
    }

    // Update lastCleaned timestamp if changing to AVAILABLE
    if (status === 'AVAILABLE') {
      updateFields.push(`"lastCleaned" = NOW()`)
    }

    updateValues.push(id)

    await execute(`
      UPDATE "Room" 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
    `, updateValues)

    return NextResponse.json({
      success: true,
      message: `Room ${room.roomNumber} status updated to ${status}`,
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        status: status
      }
    })

  } catch (error) {
    console.error('Room status update error:', error)
    return NextResponse.json({ 
      error: 'Failed to update room status' 
    }, { status: 500 })
  }
}
