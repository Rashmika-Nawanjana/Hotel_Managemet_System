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
      branchFilter = 'AND sp."branchId" = $1'
      queryParams = [branchId]
    }

    // Get staff performance data
    const staffPerformance = await query(`
      SELECT 
        u.id,
        u.firstname,
        u.lastname,
        u.email,
        u.phone,
        sp."employeeId",
        sp.department,
        sp."position",
        sp.salary,
        sp."hireDate",
        sp.rating,
        sp."totalServices",
        b.name as branch_name,
        b.location as branch_location,
        EXTRACT(YEAR FROM AGE(sp."hireDate")) as years_of_service,
        CASE 
          WHEN sp.rating >= 4.5 THEN 'Excellent'
          WHEN sp.rating >= 4.0 THEN 'Good'
          WHEN sp.rating >= 3.0 THEN 'Average'
          WHEN sp.rating >= 2.0 THEN 'Below Average'
          ELSE 'Poor'
        END as performance_level
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.role = 'STAFF'
        AND u.status = 'ACTIVE'
        ${branchFilter}
      ORDER BY sp.rating DESC NULLS LAST, sp."totalServices" DESC
    `, queryParams)

    // Get department performance
    const departmentPerformance = await query(`
      SELECT 
        sp.department,
        COUNT(*) as staff_count,
        AVG(sp.rating) as avg_rating,
        AVG(sp."totalServices") as avg_services,
        AVG(sp.salary) as avg_salary,
        b.name as branch_name
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.role = 'STAFF'
        AND u.status = 'ACTIVE'
        AND sp.department IS NOT NULL
        ${branchFilter}
      GROUP BY sp.department, b.name
      ORDER BY avg_rating DESC
    `, queryParams)

    // Get staff by performance level
    const performanceLevels = await query(`
      SELECT 
        CASE 
          WHEN sp.rating >= 4.5 THEN 'Excellent'
          WHEN sp.rating >= 4.0 THEN 'Good'
          WHEN sp.rating >= 3.0 THEN 'Average'
          WHEN sp.rating >= 2.0 THEN 'Below Average'
          ELSE 'Poor'
        END as performance_level,
        COUNT(*) as count,
        AVG(sp.rating) as avg_rating,
        AVG(sp."totalServices") as avg_services
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.role = 'STAFF'
        AND u.status = 'ACTIVE'
        AND sp.rating IS NOT NULL
        ${branchFilter}
      GROUP BY performance_level
      ORDER BY avg_rating DESC
    `, queryParams)

    // Get top performers
    const topPerformers = await query(`
      SELECT 
        u.firstname,
        u.lastname,
        sp."employeeId",
        sp.department,
        sp."position",
        sp.rating,
        sp."totalServices",
        sp.salary,
        b.name as branch_name,
        EXTRACT(YEAR FROM AGE(sp."hireDate")) as years_of_service
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.role = 'STAFF'
        AND u.status = 'ACTIVE'
        AND sp.rating IS NOT NULL
        ${branchFilter}
      ORDER BY sp.rating DESC, sp."totalServices" DESC
      LIMIT 10
    `, queryParams)

    // Get salary analysis
    const salaryAnalysis = await query(`
      SELECT 
        sp.department,
        sp."position",
        COUNT(*) as count,
        MIN(sp.salary) as min_salary,
        MAX(sp.salary) as max_salary,
        AVG(sp.salary) as avg_salary,
        b.name as branch_name
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.role = 'STAFF'
        AND u.status = 'ACTIVE'
        AND sp.salary IS NOT NULL
        ${branchFilter}
      GROUP BY sp.department, sp."position", b.name
      ORDER BY avg_salary DESC
    `, queryParams)

    // Get staff tenure analysis
    const tenureAnalysis = await query(`
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(sp."hireDate")) < 1 THEN 'Less than 1 year'
          WHEN EXTRACT(YEAR FROM AGE(sp."hireDate")) < 3 THEN '1-3 years'
          WHEN EXTRACT(YEAR FROM AGE(sp."hireDate")) < 5 THEN '3-5 years'
          WHEN EXTRACT(YEAR FROM AGE(sp."hireDate")) < 10 THEN '5-10 years'
          ELSE '10+ years'
        END as tenure_group,
        COUNT(*) as count,
        AVG(sp.rating) as avg_rating,
        AVG(sp."totalServices") as avg_services,
        AVG(sp.salary) as avg_salary
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.role = 'STAFF'
        AND u.status = 'ACTIVE'
        AND sp."hireDate" IS NOT NULL
        ${branchFilter}
      GROUP BY tenure_group
      ORDER BY avg_rating DESC
    `, queryParams)

    // Get overall stats
    const overallStats = await query(`
      SELECT 
        COUNT(*) as total_staff,
        AVG(sp.rating) as avg_rating,
        AVG(sp."totalServices") as avg_services,
        AVG(sp.salary) as avg_salary,
        MIN(sp."hireDate") as earliest_hire,
        MAX(sp."hireDate") as latest_hire
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.role = 'STAFF'
        AND u.status = 'ACTIVE'
        ${branchFilter}
    `, queryParams)

    const response = {
      success: true,
      data: {
        staffPerformance,
        departmentPerformance,
        performanceLevels,
        topPerformers,
        salaryAnalysis,
        tenureAnalysis,
        overallStats: overallStats[0] || {},
        branchId,
        generatedAt: new Date().toISOString()
      }
    }

    console.log('📊 Staff performance report generated:', {
      branchId,
      totalStaff: staffPerformance.length,
      departments: departmentPerformance.length
    })

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('❌ Error generating staff performance report:', error)
    return NextResponse.json(
      { error: 'Failed to generate staff performance report' },
      { status: 500 }
    )
  }
}
