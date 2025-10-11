import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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

    const roomType = await prisma.roomType.findUnique({
      where: { id },
      include: {
        branch: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        rooms: {
          select: {
            id: true,
            roomNumber: true,
            floor: true,
            status: true,
          },
        },
      },
    })

    if (!roomType) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 })
    }

    // Group rooms by status
    const roomsByStatus = roomType.rooms.reduce((acc, room) => {
      if (!acc[room.status]) {
        acc[room.status] = []
      }
      acc[room.status].push(room)
      return acc
    }, {} as Record<string, typeof roomType.rooms>)

    const transformedRoomType = {
      ...roomType,
      basePrice: parseFloat(roomType.basePrice.toString()),
      amenities: roomType.amenities.map((ra) => ra.amenity),
      totalRooms: roomType.rooms.length,
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

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (shortDescription !== undefined) updateData.shortDescription = shortDescription
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice)
    if (maxOccupancy !== undefined) updateData.maxOccupancy = parseInt(maxOccupancy)
    if (bedType !== undefined) updateData.bedType = bedType
    if (numberOfBeds !== undefined) updateData.numberOfBeds = parseInt(numberOfBeds)
    if (roomSize !== undefined) updateData.roomSize = parseInt(roomSize)
    if (viewType !== undefined) updateData.viewType = viewType
    if (status !== undefined) updateData.status = status
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured

    if (amenityIds) {
      await prisma.roomTypeAmenity.deleteMany({
        where: { roomTypeId: id },
      })

      updateData.amenities = {
        createMany: {
          data: amenityIds.map((amenityId: string) => ({
            amenityId,
          })),
        },
      }
    }

    if (images) {
      await prisma.roomImage.deleteMany({
        where: { roomTypeId: id },
      })

      updateData.images = {
        createMany: {
          data: images.map((image: any, index: number) => ({
            url: image.url,
            caption: image.caption || null,
            altText: image.altText || null,
            isPrimary: index === 0,
            order: index + 1,
          })),
        },
      }
    }

    const roomType = await prisma.roomType.update({
      where: { id },
      data: updateData,
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

    const roomCount = await prisma.room.count({
      where: { roomTypeId: id },
    })

    if (roomCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete room type with ${roomCount} rooms. Delete rooms first.` },
        { status: 400 }
      )
    }

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