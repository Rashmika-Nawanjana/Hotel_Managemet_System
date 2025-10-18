import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { queryOne } from '@/lib/db-queries'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user is staff
    if (decoded.role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Access denied - Staff only' },
        { status: 403 }
      )
    }

    // Get staff user with profile data
    const staffUser = await queryOne<any>(`
      SELECT 
        u.id,
        u.email,
        u.firstname,
        u.lastname,
        u.phone,
        u.role,
        u.status,
        u.emailverified,
        u.address,
        u.city,
        u.postalcode,
        u.nationality,
        sp."employeeId",
        sp."branchId",
        sp.department,
        sp."position",
        sp."staffRole",
        sp.permissions,
        sp."isActive",
        sp."hireDate",
        sp.salary,
        sp.rating,
        sp."totalServices",
        b.name as branch_name,
        b.location as branch_location,
        b.address as branch_address,
        b.phone as branch_phone,
        b.email as branch_email
      FROM users u
      LEFT JOIN "StaffProfile" sp ON u.id = sp."userId"
      LEFT JOIN "Branch" b ON sp."branchId" = b.id
      WHERE u.id = $1 AND u.role = 'STAFF'
    `, [decoded.userId])

    if (!staffUser) {
      return NextResponse.json(
        { error: 'Staff user not found' },
        { status: 404 }
      )
    }

    // Check if staff profile exists and is active
    if (!staffUser.staffRole || !staffUser.isActive) {
      return NextResponse.json(
        { error: 'Staff account is not active' },
        { status: 403 }
      )
    }

    // Transform the data to match frontend expectations
    const transformedUser = {
      id: staffUser.id,
      email: staffUser.email,
      firstName: staffUser.firstname,
      lastName: staffUser.lastname,
      firstname: staffUser.firstname, // Keep both for compatibility
      lastname: staffUser.lastname,
      phone: staffUser.phone,
      role: staffUser.role,
      status: staffUser.status,
      emailVerified: staffUser.emailverified,
      address: staffUser.address,
      city: staffUser.city,
      postalCode: staffUser.postalcode,
      nationality: staffUser.nationality,
      // Staff-specific fields
      employeeId: staffUser.employeeId,
      branchId: staffUser.branchId,
      department: staffUser.department,
      position: staffUser.position,
      staffRole: staffUser.staffRole,
      permissions: staffUser.permissions || [],
      isActive: staffUser.isActive,
      hireDate: staffUser.hireDate,
      salary: staffUser.salary,
      rating: staffUser.rating,
      totalServices: staffUser.totalServices,
      // Branch information
      branch: {
        name: staffUser.branch_name,
        location: staffUser.branch_location,
        address: staffUser.branch_address,
        phone: staffUser.branch_phone,
        email: staffUser.branch_email
      }
    }

    return NextResponse.json(
      {
        success: true,
        user: transformedUser,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get staff user error:', error)
    return NextResponse.json(
      { error: 'Failed to get staff user' },
      { status: 500 }
    )
  }
}
