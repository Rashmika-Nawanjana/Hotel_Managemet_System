import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'

interface Amenity {
  id: string
  name: string
  icon: string | null
  category: string
  createdAt: Date
  updatedAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    let amenities: Amenity[]

    if (category) {
      amenities = await query<Amenity>(
        'SELECT * FROM "Amenities" WHERE category = $1 ORDER BY name ASC',
        [category]
      )
    } else {
      amenities = await query<Amenity>(
        'SELECT * FROM "Amenities" ORDER BY name ASC'
      )
    }

    // Group by category
    const amenitiesByCategory = amenities.reduce((acc: Record<string, Amenity[]>, amenity: Amenity) => {
      const cat = amenity.category
      if (!acc[cat]) {
        acc[cat] = []
      }
      acc[cat].push(amenity)
      return acc
    }, {} as Record<string, Amenity[]>)

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