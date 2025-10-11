import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Query parameters
    const branchId = searchParams.get('branchId')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const maxOccupancy = searchParams.get('maxOccupancy')
    const bedType = searchParams.get('bedType')
    const featured = searchParams.get('featured')
    const status = searchParams.get('status') || 'active'

    // Build where clause
    const where: any = {
      status,
    }

    if (branchId) {
      where.branchId = branchId
    }

    if (minPrice || maxPrice) {
      where.basePrice = {}
      if (minPrice) where.basePrice.gte = parseFloat(minPrice)
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice)
    }

    if (maxOccupancy) {
      where.maxOccupancy = {
        gte: parseInt(maxOccupancy),
      }
    }

    if (bedType) {
      where.bedType = {
        contains: bedType,
        mode: 'insensitive',
      }
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    // Fetch room types
    const roomTypes = await prisma.roomType.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            location: true,
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
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { popularityScore: 'desc' },
        { basePrice: 'asc' },
      ],
    })

    // Transform data for better frontend consumption
    const transformedRoomTypes = roomTypes.map((roomType) => ({
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
      branch: roomType.branch,
      images: roomType.images,
      amenities: roomType.amenities.map((ra) => ra.amenity),
      availableRooms: roomType._count.rooms,
      createdAt: roomType.createdAt,
      updatedAt: roomType.updatedAt,
    }))

    return NextResponse.json(
      {
        success: true,
        count: transformedRoomTypes.length,
        data: transformedRoomTypes,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching room types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room types' },
      { status: 500 }
    )
  }
}