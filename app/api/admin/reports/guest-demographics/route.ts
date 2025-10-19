import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db-queries'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId') || 'all'

    // Build branch filter
    let branchFilter = ''
    let queryParams: any[] = []
    
    if (branchId !== 'all') {
      branchFilter = 'AND b."branchId" = $1'
      queryParams = [branchId]
    }

    // Get guest demographics
    const guestDemographics = await query(`
      SELECT 
        u.id,
        u.firstname,
        u.lastname,
        u.email,
        u.phone,
        u.dateofbirth,
        u.nationality,
        u.idtype,
        u.createdat as member_since,
        gp."loyaltyPoints",
        gp."totalBookings",
        gp."totalSpent",
        gp."preferredRoomType",
        gp."preferredBedType",
        gp."smokingPreference",
        gp."floorPreference",
        gp.newsletter,
        gp."emailNotifications",
        gp."smsNotifications",
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 25 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 35 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 45 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 55 THEN '45-54'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 65 THEN '55-64'
          ELSE '65+'
        END as age_group
      FROM users u
      LEFT JOIN "GuestProfile" gp ON u.id = gp."userId "
      LEFT JOIN "Booking" b ON u.id = b."userId"
      WHERE u.role = 'GUEST'
        AND u.status = 'ACTIVE'
        ${branchFilter}
      GROUP BY u.id, gp.id
      ORDER BY gp."totalSpent" DESC NULLS LAST
    `, queryParams)

    // Get age group distribution
    const ageGroupDistribution = await query(`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 25 THEN '18-24'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 35 THEN '25-34'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 45 THEN '35-44'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 55 THEN '45-54'
          WHEN EXTRACT(YEAR FROM AGE(u.dateofbirth)) < 65 THEN '55-64'
          ELSE '65+'
        END as age_group,
        COUNT(*) as count,
        AVG(gp."totalSpent") as avg_spent,
        AVG(gp."totalBookings") as avg_bookings
      FROM users u
      LEFT JOIN "GuestProfile" gp ON u.id = gp."userId "
      LEFT JOIN "Booking" b ON u.id = b."userId"
      WHERE u.role = 'GUEST'
        AND u.status = 'ACTIVE'
        ${branchFilter}
      GROUP BY age_group
      ORDER BY age_group
    `, queryParams)

    // Get nationality distribution
    const nationalityDistribution = await query(`
      SELECT 
        u.nationality,
        COUNT(*) as count,
        AVG(gp."totalSpent") as avg_spent,
        AVG(gp."totalBookings") as avg_bookings
      FROM users u
      LEFT JOIN "GuestProfile" gp ON u.id = gp."userId "
      LEFT JOIN "Booking" b ON u.id = b."userId"
      WHERE u.role = 'GUEST'
        AND u.status = 'ACTIVE'
        ${branchFilter}
      GROUP BY u.nationality
      ORDER BY count DESC
      LIMIT 20
    `, queryParams)

    // Get loyalty program stats
    const loyaltyStats = await query(`
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN gp."loyaltyPoints" > 0 THEN 1 END) as active_members,
        AVG(gp."loyaltyPoints") as avg_points,
        MAX(gp."loyaltyPoints") as max_points,
        AVG(gp."totalSpent") as avg_spent,
        AVG(gp."totalBookings") as avg_bookings
      FROM users u
      LEFT JOIN "GuestProfile" gp ON u.id = gp."userId "
      LEFT JOIN "Booking" b ON u.id = b."userId"
      WHERE u.role = 'GUEST'
        AND u.status = 'ACTIVE'
        ${branchFilter}
    `, queryParams)

    // Get top spenders
    const topSpenders = await query(`
      SELECT 
        u.firstname,
        u.lastname,
        u.email,
        gp."loyaltyPoints",
        gp."totalBookings",
        gp."totalSpent",
        gp."preferredRoomType",
        u.nationality
      FROM users u
      LEFT JOIN "GuestProfile" gp ON u.id = gp."userId "
      LEFT JOIN "Booking" b ON u.id = b."userId"
      WHERE u.role = 'GUEST'
        AND u.status = 'ACTIVE'
        AND gp."totalSpent" > 0
        ${branchFilter}
      GROUP BY u.id, gp.id
      ORDER BY gp."totalSpent" DESC
      LIMIT 20
    `, queryParams)

    // Get preference analysis
    const preferences = await query(`
      SELECT 
        gp."preferredRoomType",
        gp."preferredBedType",
        gp."smokingPreference",
        gp."floorPreference",
        COUNT(*) as count
      FROM users u
      LEFT JOIN "GuestProfile" gp ON u.id = gp."userId "
      LEFT JOIN "Booking" b ON u.id = b."userId"
      WHERE u.role = 'GUEST'
        AND u.status = 'ACTIVE'
        ${branchFilter}
      GROUP BY gp."preferredRoomType", gp."preferredBedType", gp."smokingPreference", gp."floorPreference"
      ORDER BY count DESC
    `, queryParams)

    const response = {
      success: true,
      data: {
        guestDemographics,
        ageGroupDistribution,
        nationalityDistribution,
        loyaltyStats: loyaltyStats[0] || {},
        topSpenders,
        preferences,
        branchId,
        generatedAt: new Date().toISOString()
      }
    }

    console.log('📊 Guest demographics report generated:', {
      branchId,
      totalGuests: guestDemographics.length,
      topSpenders: topSpenders.length
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ Error generating guest demographics report:', error)
    return NextResponse.json(
      { error: 'Failed to generate guest demographics report' },
      { status: 500 }
    )
  }
}
