import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    const where: any = {}

    if (category) {
      where.category = category
    }

    const amenities = await prisma.amenity.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    })

    // Group by category
    const amenitiesByCategory = amenities.reduce((acc, amenity) => {
      const cat = amenity.category
      if (!acc[cat]) {
        acc[cat] = []
      }
      acc[cat].push(amenity)
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json(
      {
        success: true,
        count: amenities.length,
        data: amenities,
        byCategory: amenitiesByCategory,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching amenities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch amenities' },
      { status: 500 }
    )
  }
}