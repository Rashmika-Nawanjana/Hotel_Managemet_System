import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const roomType = await prisma.roomType.findUnique({
      where: { slug },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        amenities: {
          include: {
            amenity: true,
          },
        },
        rooms: {
          where: {
            status: 'AVAILABLE',
          },
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
      return NextResponse.json(
        { error: 'Room type not found' },
        { status: 404 }
      )
    }

    // Group amenities by category
    const amenitiesByCategory = roomType.amenities.reduce((acc, ra) => {
      const category = ra.amenity.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(ra.amenity)
      return acc
    }, {} as Record<string, any[]>)

    // Transform response
    const response = {
      id: roomType.id,
      name: roomType.name,
      slug: roomType.slug,
      description: roomType.description,
      shortDescription: roomType.shortDescription,
      basePrice: roomType.basePrice,
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
      availableRooms: roomType.rooms.length,
      rooms: roomType.rooms,
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