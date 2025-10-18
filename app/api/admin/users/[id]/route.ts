import { NextRequest, NextResponse } from 'next/server';
import { query, execute, queryOne } from '@/lib/db-queries';
import { verifyToken } from '@/lib/auth';

// Auth helper
function isAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const user = token ? verifyToken(token) : null;
  return user && user.role === 'ADMIN';
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: userId } = await params;
    
    // Fetch user details for editing
    const user = await queryOne(
      `SELECT 
        id, email, role, status, firstname AS "firstName", lastname AS "lastName", 
        phone, dateofbirth AS "dateOfBirth", nationality, idtype AS "idType", 
        idnumber AS "idNumber", address, city, postalcode AS "postalCode",
        twofactorenabled AS "twoFactorEnabled", twofactorsecret AS "twoFactorSecret",
        emailverified AS "emailVerified", createdat AS "createdAt", updatedat AS "updatedAt"
       FROM users 
       WHERE id = $1`,
      [userId]
    );
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: userId } = await params;
    
    // Check if user exists
    const existingUser = await query('SELECT id, email FROM users WHERE id = $1', [userId]);
    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user has any bookings (optional business logic)
    const bookings = await query('SELECT id FROM "Booking" WHERE "userId" = $1 LIMIT 1', [userId]);
    if (bookings && bookings.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete user with existing bookings. Consider deactivating instead.' 
      }, { status: 400 });
    }
    
    // Delete user (cascade will handle related records)
    await execute('DELETE FROM users WHERE id = $1', [userId]);
    
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: userId } = await params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.role || !data.status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE id = $1', [userId]);
    if (!existingUser || existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check email uniqueness (excluding current user)
    const emailCheck = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [data.email, userId]);
    if (emailCheck && emailCheck.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }
    
    // Update user with proper column names
    await execute(
      `UPDATE users SET 
        firstname = $1, 
        lastname = $2, 
        email = $3, 
        role = $4, 
        status = $5,
        phone = $6,
        dateofbirth = $7,
        nationality = $8,
        idtype = $9,
        idnumber = $10,
        address = $11,
        city = $12,
        postalcode = $13,
        twofactorenabled = $14,
        twofactorsecret = $15,
        emailverified = $16,
        updatedat = NOW()
       WHERE id = $17`,
      [
        data.firstName,
        data.lastName,
        data.email,
        data.role,
        data.status,
        data.phone || '',
        data.dateOfBirth,
        data.nationality,
        data.idType || 'NATIONAL_ID',
        data.idNumber || '',
        data.address || '',
        data.city || '',
        data.postalCode || '',
        data.twoFactorEnabled ? true : false,
        data.twoFactorSecret || null,
        data.emailVerified ? true : false,
        userId
      ]
    );
    
    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
