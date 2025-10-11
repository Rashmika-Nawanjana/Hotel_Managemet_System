import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params
    const body = await request.json()
    const { status, notes, lastCleaned, lastMaintenance } = body

    const updateData: any = {}

    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (lastCleaned) updateData.lastCleaned = new Date(lastCleaned)
    if (lastMaintenance) updateData.lastMaintenance = new Date(lastMaintenance)

    const room = await prisma.room.update({
      where: { id },
      data: updateData,
      include: {
        roomType: true,
        branch: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Room updated successfully',
        data: room,
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
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    await prisma.room.delete({
      where: { id },
    })

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