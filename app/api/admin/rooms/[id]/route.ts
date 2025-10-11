import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
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

    const roomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        branch: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        images: true,
        rooms: true,
      },
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Room type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: roomType,
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
    } = body

    // Update room type
    const roomType = await prisma.roomType.update({
      where: { id },
      data: {
        name,
        description,
        shortDescription,
        basePrice: basePrice ? parseFloat(basePrice) : undefined,
        maxOccupancy: maxOccupancy ? parseInt(maxOccupancy) : undefined,
        bedType,
        numberOfBeds: numberOfBeds ? parseInt(numberOfBeds) : undefined,
        roomSize: roomSize ? parseInt(roomSize) : undefined,
        viewType,
        status,
        isFeatured,
        // Update amenities if provided
        ...(amenityIds && {
          amenities: {
            deleteMany: {},
            createMany: {
              data: amenityIds.map((amenityId: string) => ({
                amenityId,
              })),
            },
          },
        }),
      },
      include: {
        branch: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        images: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Room type updated successfully',
        data: roomType,
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

    // Check if room type has any rooms
    const roomCount = await prisma.room.count({
      where: { roomTypeId: id },
    })

    if (roomCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete room type with ${roomCount} associated rooms. Please delete or reassign rooms first.`,
        },
        { status: 400 }
      )
    }

    // Delete room type
    await prisma.roomType.delete({
      where: { id },
    })

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