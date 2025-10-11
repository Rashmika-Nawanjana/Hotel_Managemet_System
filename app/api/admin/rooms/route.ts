import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    const existingRoomType = await prisma.roomType.findUnique({
      where: { slug },
    })

    if (existingRoomType) {
      return NextResponse.json(
        { error: 'A room type with this name already exists' },
        { status: 400 }
      )
    }

    // Create room type with amenities and images
    const roomType = await prisma.roomType.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        basePrice: parseFloat(basePrice),
        maxOccupancy: parseInt(maxOccupancy),
        bedType,
        numberOfBeds: parseInt(numberOfBeds) || 1,
        roomSize: parseInt(roomSize),
        viewType,
        branchId,
        isFeatured: isFeatured || false,
        status: 'active',
        amenities: amenityIds
          ? {
              createMany: {
                data: amenityIds.map((amenityId: string) => ({
                  amenityId,
                })),
              },
            }
          : undefined,
        images: images
          ? {
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
          : undefined,
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
        message: 'Room type created successfully',
        data: roomType,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating room type:', error)
    return NextResponse.json(
      { error: 'Failed to create room type' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'STAFF')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Get all room types (including inactive)
    const roomTypes = await prisma.roomType.findMany({
      include: {
        branch: true,
        amenities: {
          include: {
            amenity: true,
          },
        },
        images: true,
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Convert Decimal types to numbers for JSON serialization
    const serializedRoomTypes = roomTypes.map((roomType: any) => ({
      ...roomType,
      basePrice: Number(roomType.basePrice),
      roomSize: Number(roomType.roomSize),
      popularityScore: Number(roomType.popularityScore),
    }))

    return NextResponse.json(
      {
        success: true,
        count: serializedRoomTypes.length,
        data: serializedRoomTypes,
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